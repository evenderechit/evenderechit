import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // If supabase is null, we're in demo mode
    if (!supabase) {
      // Return mock data for demo mode
      const mockAppointments = [
        {
          id: "1",
          customer_name: "יוסי כהן",
          customer_phone: "050-1234567",
          customer_email: "yossi@example.com",
          service_name: "תספורת גברים",
          appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          appointment_time: "10:00",
          status: "confirmed",
          notes: "לקוח קבוע",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          customer_name: "שרה לוי",
          customer_phone: "052-9876543",
          customer_email: "sara@example.com",
          service_name: "צביעת שיער",
          appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          appointment_time: "14:30",
          status: "scheduled",
          notes: "צבע חדש",
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          customer_name: "דוד אברהם",
          customer_phone: "053-5555555",
          customer_email: "david@example.com",
          service_name: "עיסוי רפואי",
          appointment_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          appointment_time: "16:00",
          status: "completed",
          notes: null,
          created_at: new Date().toISOString(),
        },
        {
          id: "4",
          customer_name: "מירי ישראלי",
          customer_phone: "054-7777777",
          customer_email: "miri@example.com",
          service_name: "טיפוח פנים",
          appointment_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          appointment_time: "11:30",
          status: "confirmed",
          notes: "טיפוח מיוחד",
          created_at: new Date().toISOString(),
        },
        {
          id: "5",
          customer_name: "אבי רוזן",
          customer_phone: "050-9999999",
          customer_email: "avi@example.com",
          service_name: "תספורת וזקן",
          appointment_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          appointment_time: "09:15",
          status: "scheduled",
          notes: null,
          created_at: new Date().toISOString(),
        },
      ]

      return NextResponse.json({ appointments: mockAppointments })
    }

    // Real Supabase mode
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get appointments with service and staff info
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        *,
        service:services(name, duration),
        staff_member:staff_members(name)
      `)
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false })

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    return NextResponse.json({ appointments: appointments || [] })
  } catch (error) {
    console.error("Error in appointments API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
