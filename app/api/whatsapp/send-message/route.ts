import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { phoneNumber, message, businessName } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: "Phone number and message are required" }, { status: 400 })
    }

    // כאן תהיה האינטגרציה עם WhatsApp API
    // לעת עתה נחזיר הצלחה מדומה
    console.log("WhatsApp message would be sent:", {
      to: phoneNumber,
      message,
      businessName,
    })

    // סימולציה של שליחה מוצלחת
    return NextResponse.json({
      success: true,
      messageId: `msg_${Date.now()}`,
      message: "Message sent successfully",
    })
  } catch (error) {
    console.error("Error in WhatsApp send message API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
