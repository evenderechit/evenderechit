// app/api/appointments/get-by-id/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get("appointmentId")

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("Appointments")
      .select(
        `
        *,
        Services (
          id,
          name,
          duration_minutes,
          price,
          color
        ),
        Users (
          id,
          name,
          email,
          business_address,
          Settings (
            business_name,
            link_slug
          ),
          Business_settings (
            allow_cancellation,
            cancellation_hours,
            allow_rescheduling,
            reschedule_hours
          )
        )
      `,
      )
      .eq("id", appointmentId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching appointment by ID:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ appointment: null, message: "Appointment not found." }, { status: 404 })
    }

    return NextResponse.json({ appointment: data }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in get appointment by ID API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
