// app/api/whatsapp/send-advanced/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// פונקציה לעיבוד תבנית הודעה עם משתנים
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

// פונקציה לשליחת הודעה דרך WhatsApp Business API
async function sendWhatsAppMessage(phoneNumber: string, message: string, businessToken?: string) {
  const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, "")
  const formattedPhoneNumber = cleanPhoneNumber.startsWith("972")
    ? cleanPhoneNumber
    : `972${cleanPhoneNumber.startsWith("0") ? cleanPhoneNumber.slice(1) : cleanPhoneNumber}`

  if (businessToken && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${businessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: formattedPhoneNumber,
            type: "text",
            text: {
              body: message,
            },
          }),
        },
      )

      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          method: "api",
          messageId: result.messages?.[0]?.id,
        }
      } else {
        const errorData = await response.json()
        throw new Error(`WhatsApp API Error: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error("WhatsApp API Error:", error)
      throw error
    }
  } else {
    // יצירת קישור לשליחה ידנית
    const whatsappUrl = `https://wa.me/${formattedPhoneNumber}?text=${encodeURIComponent(message)}`
    return {
      success: true,
      method: "link",
      whatsappUrl,
    }
  }
}

export async function POST(request: Request) {
  try {
    const { appointment_id, user_id, phone_number, message_type, template_variables, custom_message } =
      await request.json()

    if (!phone_number || !message_type || !user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // קבלת הגדרות עסק
    const { data: businessSettings } = await supabase
      .from("Business_settings")
      .select("whatsapp_business_token, whatsapp_enabled")
      .eq("user_id", user_id)
      .single()

    if (!businessSettings?.whatsapp_enabled) {
      return NextResponse.json({ error: "WhatsApp is not enabled for this business" }, { status: 400 })
    }

    let messageContent = custom_message

    // אם לא סופקה הודעה מותאמת, השתמש בתבנית
    if (!custom_message) {
      const { data: template } = await supabase
        .from("Whatsapp_templates")
        .select("message_template")
        .eq("user_id", user_id)
        .eq("template_type", message_type)
        .eq("is_active", true)
        .single()

      if (!template) {
        return NextResponse.json({ error: "No template found for this message type" }, { status: 400 })
      }

      messageContent = processMessageTemplate(template.message_template, template_variables || {})
    }

    // שליחת ההודעה
    const result = await sendWhatsAppMessage(phone_number, messageContent, businessSettings.whatsapp_business_token)

    // שמירת ההודעה בבסיס הנתונים
    const { data: messageRecord, error: messageError } = await supabase
      .from("Whatsapp_messages")
      .insert([
        {
          appointment_id,
          user_id,
          phone_number,
          message_content: messageContent,
          message_type,
          status: result.success ? "sent" : "failed",
          sent_at: result.success ? new Date().toISOString() : null,
          error_message: result.success ? null : "Failed to send",
        },
      ])
      .select()
      .single()

    if (messageError) {
      console.error("Error saving message record:", messageError)
    }

    return NextResponse.json(
      {
        success: result.success,
        message: result.success ? "הודעה נשלחה בהצלחה" : "שגיאה בשליחת ההודעה",
        method: result.method,
        whatsappUrl: result.whatsappUrl,
        messageId: result.messageId,
        recordId: messageRecord?.id,
      },
      { status: result.success ? 200 : 500 },
    )
  } catch (error) {
    console.error("Error in advanced WhatsApp send:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
