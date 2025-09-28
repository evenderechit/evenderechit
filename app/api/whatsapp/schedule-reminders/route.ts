// app/api/whatsapp/schedule-reminders/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { subHours, subMinutes } from "date-fns"

export async function POST(request: Request) {
  try {
    const { appointment_id, user_id } = await request.json()

    if (!appointment_id || !user_id) {
      return NextResponse.json({ error: "Appointment ID and User ID are required" }, { status: 400 })
    }

    // קבלת פרטי התור
    const { data: appointment, error: appointmentError } = await supabase
      .from("Appointments")
      .select("*")
      .eq("id", appointment_id)
      .eq("user_id", user_id)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // קבלת הגדרות תזכורות
    const { data: settings, error: settingsError } = await supabase
      .from("Business_settings")
      .select("reminder_24h_enabled, reminder_2h_enabled, reminder_30m_enabled")
      .eq("user_id", user_id)
      .single()

    if (settingsError) {
      console.error("Error fetching reminder settings:", settingsError)
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }

    // יצירת תאריך ושעת התור
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
    const reminders = []

    // תזכורת 24 שעות מראש
    if (settings?.reminder_24h_enabled) {
      const reminderTime = subHours(appointmentDateTime, 24)
      if (reminderTime > new Date()) {
        reminders.push({
          appointment_id,
          user_id,
          reminder_type: "24h",
          scheduled_time: reminderTime.toISOString(),
        })
      }
    }

    // תזכורת 2 שעות מראש
    if (settings?.reminder_2h_enabled) {
      const reminderTime = subHours(appointmentDateTime, 2)
      if (reminderTime > new Date()) {
        reminders.push({
          appointment_id,
          user_id,
          reminder_type: "2h",
          scheduled_time: reminderTime.toISOString(),
        })
      }
    }

    // תזכורת 30 דקות מראש
    if (settings?.reminder_30m_enabled) {
      const reminderTime = subMinutes(appointmentDateTime, 30)
      if (reminderTime > new Date()) {
        reminders.push({
          appointment_id,
          user_id,
          reminder_type: "30m",
          scheduled_time: reminderTime.toISOString(),
        })
      }
    }

    // שמירת התזכורות
    if (reminders.length > 0) {
      const { data, error } = await supabase.from("Scheduled_reminders").insert(reminders).select()

      if (error) {
        console.error("Error scheduling reminders:", error)
        return NextResponse.json({ error: "Failed to schedule reminders" }, { status: 500 })
      }

      return NextResponse.json(
        {
          message: `${reminders.length} תזכורות נקבעו בהצלחה`,
          reminders: data,
        },
        { status: 200 },
      )
    }

    return NextResponse.json({ message: "לא נקבעו תזכורות (הגדרות או זמנים לא מתאימים)" }, { status: 200 })
  } catch (error) {
    console.error("Error in schedule reminders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
