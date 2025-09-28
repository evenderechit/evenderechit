import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return realistic demo data for today's appointments
    return NextResponse.json([
      {
        id: "1",
        customer_name: "יוסי כהן",
        service_name: "תספורת גברים",
        appointment_time: "09:00",
        status: "confirmed",
        phone: "050-1234567",
      },
      {
        id: "2",
        customer_name: "שרה לוי",
        service_name: "צביעה וחיתוך",
        appointment_time: "10:30",
        status: "pending",
        phone: "052-9876543",
      },
      {
        id: "3",
        customer_name: "דוד ישראלי",
        service_name: "עיצוב שיער",
        appointment_time: "14:00",
        status: "confirmed",
        phone: "054-5555555",
      },
      {
        id: "4",
        customer_name: "מירי אברהם",
        service_name: "טיפוח פנים",
        appointment_time: "16:30",
        status: "pending",
        phone: "053-1111111",
      },
      {
        id: "5",
        customer_name: "אבי רוזן",
        service_name: "תספורת וזקן",
        appointment_time: "18:00",
        status: "confirmed",
        phone: "054-7777777",
      },
    ])
  } catch (error) {
    console.error("Error in today-appointments API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
