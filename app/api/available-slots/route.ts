// app/api/available-slots/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const date = searchParams.get("date")
    const serviceId = searchParams.get("serviceId")
    const staffMemberId = searchParams.get("staffMemberId") // New: staffMemberId

    if (!userId || !date) {
      return NextResponse.json({ error: "User ID and date are required" }, { status: 400 })
    }

    // Get business settings
    const { data: businessSettings } = await supabase
      .from("Business_settings")
      .select("*")
      .eq("user_id", userId)
      .single()

    // Get service details
    let serviceDuration = 60 // Default
    if (serviceId) {
      const { data: service } = await supabase.from("Services").select("duration_minutes").eq("id", serviceId).single()
      if (service) {
        serviceDuration = service.duration_minutes
      }
    }

    // Get day of the week (0=Sunday, 1=Monday, etc.)
    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay()

    // Get availability for this day, filtered by staff_member_id if provided
    let availabilityQuery = supabase
      .from("Availability")
      .select("*")
      .eq("user_id", userId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true)

    if (staffMemberId) {
      availabilityQuery = availabilityQuery.eq("staff_member_id", staffMemberId)
    } else {
      // If no specific staff member is selected, fetch general availability (staff_member_id is NULL)
      availabilityQuery = availabilityQuery.is("staff_member_id", null)
    }

    const { data: availability, error: availabilityError } = await availabilityQuery

    if (availabilityError) {
      console.error("Error fetching availability:", availabilityError)
      return NextResponse.json({ error: availabilityError.message }, { status: 500 })
    }

    if (!availability || availability.length === 0) {
      return NextResponse.json({ slots: [] }, { status: 200 })
    }

    // Check if the date is blocked
    const { data: blockedDate, error: blockedDateError } = await supabase
      .from("Blocked_dates")
      .select("*")
      .eq("user_id", userId)
      .eq("blocked_date", date)
      .single()

    if (blockedDateError && blockedDateError.code !== "PGRST116") {
      console.error("Error fetching blocked date:", blockedDateError)
      return NextResponse.json({ error: blockedDateError.message }, { status: 500 })
    }

    if (blockedDate) {
      return NextResponse.json({ slots: [] }, { status: 200 })
    }

    // Get existing appointments for this date, filtered by staff_member_id if provided
    let existingAppointmentsQuery = supabase
      .from("Appointments")
      .select("time, duration_minutes")
      .eq("user_id", userId)
      .eq("date", date)
      .neq("status", "canceled")

    if (staffMemberId) {
      existingAppointmentsQuery = existingAppointmentsQuery.eq("staff_member_id", staffMemberId)
    } else {
      existingAppointmentsQuery = existingAppointmentsQuery.is("staff_member_id", null)
    }

    const { data: existingAppointments, error: appointmentsError } = await existingAppointmentsQuery

    if (appointmentsError) {
      console.error("Error fetching existing appointments:", appointmentsError)
      return NextResponse.json({ error: appointmentsError.message }, { status: 500 })
    }

    // Generate available slots
    const availableSlots: string[] = []
    const bufferTime = businessSettings?.buffer_time_minutes || 15

    for (const slot of availability) {
      const startTime = new Date(`2000-01-01T${slot.start_time}`)
      const endTime = new Date(`2000-01-01T${slot.end_time}`)

      let currentTime = new Date(startTime)

      while (currentTime < endTime) {
        const timeString = currentTime.toTimeString().slice(0, 5)

        // Check if the slot is available
        const isSlotAvailable = !existingAppointments?.some((appointment) => {
          const appointmentStart = new Date(`2000-01-01T${appointment.time}`)
          const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration_minutes || 60) * 60000)
          const slotStart = new Date(`2000-01-01T${timeString}`)
          const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)

          // Check for overlap
          return slotStart < appointmentEnd && slotEnd > appointmentStart
        })

        if (isSlotAvailable) {
          // Check if there's enough time until the end of the window
          const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000)
          if (slotEnd <= endTime) {
            availableSlots.push(timeString)
          }
        }

        // Move to the next time slot (every 15 minutes)
        currentTime = new Date(currentTime.getTime() + 15 * 60000)
      }
    }

    return NextResponse.json({ slots: availableSlots }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in get available slots:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
