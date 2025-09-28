// app/api/whatsapp/process-reminders/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// פונקציה זו תופעל על ידי Cron Job או Vercel Functions
export async function POST(request: Request) {
  try {
    // קבלת תזכורות שצריך לשלוח (זמן עבר ועדיין pending)
    const { data: pendingReminders, error: remindersError } = await supabase
      .from("Scheduled_reminders")
      .select(
        `
        *,
        Appointments (
          id,
          customer_name,
          customer_phone,
          date,
          time,
          service_description,
          Services (
            name,
            duration_minutes
          )
        ),
        Users (
          name,
          Settings (
            business_name,
            Business_settings (
              whatsapp_business_token
            )
          )
        )
      `,
      )
      .eq("status", "pending")
      .lte("scheduled_time", new Date().toISOString())
      .limit(50) // מגבלה למניעת עומס

    if (remindersError) {
      console.error("Error fetching pending reminders:", remindersError)
      return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
    }

    if (!pendingReminders || pendingReminders.length === 0) {
      return NextResponse.json({ message: "No pending reminders to process" }, { status: 200 })
    }

    const results = []

    for (const reminder of pendingReminders) {
      try {
        const appointment = reminder.Appointments
        const user = reminder.Users
        const businessSettings = user.Settings?.Business_settings

        if (!appointment?.customer_phone) {
          // עדכון סטטוס לכישלון - אין מספר טלפון
          await supabase.from("Scheduled_reminders").update({ status: "cancelled" }).eq("id", reminder.id)
          continue
        }

        // הכנת משתנים לתבנית
        const reminderTimeText =
          {
            "24h": "מחר",
            "2h": "בעוד שעתיים",
            "30m": "בעוד 30 דקות",
          }[reminder.reminder_type] || "בקרוב"

        const templateVariables = {
          customer_name: appointment.customer_name,
          date: new Date(appointment.date).toLocaleDateString("he-IL"),
          time: appointment.time,
          business_name: user.Settings?.business_name || "העסק",
          business_address: user.business_address || "",
          service_name: appointment.Services?.name || appointment.service_description,
          service_duration: appointment.Services?.duration_minutes,
          reminder_time: reminderTimeText,
        }

        // שליחת התזכורת
        const sendResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/send-advanced`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointment_id: appointment.id,
            user_id: reminder.user_id,
            phone_number: appointment.customer_phone,
            message_type: "reminder",
            template_variables: templateVariables,
          }),
        })

        if (sendResponse.ok) {
          // עדכון סטטוס התזכורת להצלחה
          await supabase.from("Scheduled_reminders").update({ status: "sent" }).eq("id", reminder.id)

          results.push({
            reminder_id: reminder.id,
            appointment_id: appointment.id,
            status: "sent",
            customer: appointment.customer_name,
          })
        } else {
          // עדכון סטטוס לכישלון
          await supabase.from("Scheduled_reminders").update({ status: "failed" }).eq("id", reminder.id)

          results.push({
            reminder_id: reminder.id,
            appointment_id: appointment.id,
            status: "failed",
            customer: appointment.customer_name,
          })
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        await supabase.from("Scheduled_reminders").update({ status: "failed" }).eq("id", reminder.id)

        results.push({
          reminder_id: reminder.id,
          status: "failed",
          error: error.message,
        })
      }
    }

    return NextResponse.json(
      {
        message: `Processed ${results.length} reminders`,
        results,
        summary: {
          sent: results.filter((r) => r.status === "sent").length,
          failed: results.filter((r) => r.status === "failed").length,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in process reminders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
