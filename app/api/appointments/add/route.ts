// app/api/appointments/add/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

// פונקציה לעיבוד תבנית הודעה עם משתנים (הועתקה מ-send-advanced)
function processMessageTemplate(template: string, variables: Record<string, any>): string {
  let processedMessage = template

  // החלפת משתנים רגילים {{variable}}
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g")
    processedMessage = processedMessage.replace(regex, variables[key] || "")
  })

  // טיפול במשתנים מותנים {{#variable}}content{{/variable}}
  const conditionalRegex = /{{#(\w+)}}(.*?){{\/\1}}/gs
  processedMessage = processedMessage.replace(conditionalRegex, (match, variable, content) => {
    return variables[variable] ? content.replace(new RegExp(`{{${variable}}}`, "g"), variables[variable]) : ""
  })

  return processedMessage.trim()
}

export async function POST(request: Request) {
  try {
    const {
      user_id,
      customer_name,
      date,
      time,
      service_id,
      service_description,
      duration_minutes,
      customer_phone,
      rescheduled_from,
      staff_member_id, // Add staff_member_id
    } = await request.json()

    // בדיקת קלט בסיסית
    if (!user_id || !customer_name || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // קבלת פרטי השירות אם סופק service_id
    let finalServiceDescription = service_description
    let finalDurationMinutes = duration_minutes || 60 // ברירת מחדל
    let serviceName = ""

    if (service_id) {
      const { data: serviceData, error: serviceError } = await supabase
        .from("Services")
        .select("name, description, duration_minutes")
        .eq("id", service_id)
        .single()

      if (serviceError) {
        console.error("Error fetching service details:", serviceError)
        // לא נכשיל את הבקשה, נמשיך עם ברירות מחדל
      } else if (serviceData) {
        serviceName = serviceData.name
        finalServiceDescription = serviceData.description || serviceData.name
        finalDurationMinutes = serviceData.duration_minutes
      }
    }

    // חישוב end_time
    const [hours, minutes] = time.split(":").map(Number)
    const startTime = new Date()
    startTime.setHours(hours, minutes, 0, 0)
    const endTime = new Date(startTime.getTime() + finalDurationMinutes * 60000)
    const finalEndTime = format(endTime, "HH:mm")

    // הוספת תור חדש לטבלת Appointments
    const { data, error } = await supabase
      .from("Appointments")
      .insert([
        {
          user_id,
          customer_name,
          customer_phone: customer_phone || null,
          date,
          time,
          end_time: finalEndTime,
          service_id: service_id || null,
          service_description: finalServiceDescription,
          duration_minutes: finalDurationMinutes,
          rescheduled_from: rescheduled_from || null, // קישור לתור קודם אם נדחה
          staff_member_id: staff_member_id || null, // Insert staff_member_id
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding appointment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const appointment = data

    // שליחת הודעת אישור ללקוח דרך WhatsApp (אם יש מספר טלפון והגדרות מאפשרות)
    if (customer_phone) {
      try {
        // קבלת פרטי העסק והגדרות WhatsApp
        const { data: businessData } = await supabase
          .from("Settings")
          .select(
            `
            business_name,
            Users (
              business_address,
              Business_settings (
                whatsapp_enabled,
                auto_confirmation_enabled
              )
            )
          `,
          )
          .eq("user_id", user_id)
          .single()

        const businessName = businessData?.business_name || "העסק"
        const businessAddress = businessData?.Users?.business_address || ""
        const whatsappEnabled = businessData?.Users?.Business_settings?.whatsapp_enabled
        const autoConfirmationEnabled = businessData?.Users?.Business_settings?.auto_confirmation_enabled

        if (whatsappEnabled && autoConfirmationEnabled) {
          // קבלת תבנית אישור
          const { data: confirmationTemplate } = await supabase
            .from("Whatsapp_templates")
            .select("message_template")
            .eq("user_id", user_id)
            .eq("template_type", "confirmation")
            .eq("is_active", true)
            .single()

          const templateVariables = {
            customer_name: customer_name,
            date: new Date(date).toLocaleDateString("he-IL"),
            time: time,
            business_name: businessName,
            business_address: businessAddress,
            service_name: serviceName || service_description,
            service_duration: finalDurationMinutes.toString(),
            // הוסף קישור לניהול תור
            management_link: `${process.env.NEXT_PUBLIC_APP_URL}/book/${businessData?.link_slug}?appointmentId=${appointment.id}`,
          }

          const confirmationMessage = confirmationTemplate
            ? processMessageTemplate(confirmationTemplate.message_template, templateVariables)
            : `שלום ${customer_name}! התור שלך אושר בהצלחה ב-${businessName} בתאריך ${new Date(date).toLocaleDateString("he-IL")} בשעה ${time}.`

          // שליחת הודעה דרך WhatsApp Advanced API
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/send-advanced`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appointment_id: appointment.id,
              user_id: user_id,
              phone_number: customer_phone,
              message_type: "confirmation",
              custom_message: confirmationMessage, // נשלח את ההודעה המעובדת
            }),
          })
        }
      } catch (whatsappError) {
        console.error("Error sending WhatsApp confirmation:", whatsappError)
        // לא נכשיל את כל הבקשה אם WhatsApp נכשל
      }
    }

    // קביעת תזכורות אוטומטיות
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/schedule-reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: appointment.id,
          user_id: user_id,
        }),
      })
    } catch (scheduleError) {
      console.error("Error scheduling reminders:", scheduleError)
    }

    return NextResponse.json(
      {
        message: "Appointment added successfully",
        appointment,
        whatsappSent: !!customer_phone,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Unexpected error in add appointment API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
