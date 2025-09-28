import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get appointments for the period
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        *,
        services!inner(price)
      `)
      .eq("user_id", user.id)
      .gte("appointment_date", startDate.toISOString())

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
    }

    // Calculate popular hours (0-23)
    const hourlyStats = new Array(24).fill(0).map((_, hour) => ({
      hour,
      bookings: 0,
      completed: 0,
    }))

    appointments?.forEach((appointment) => {
      const hour = new Date(appointment.appointment_date).getHours()
      hourlyStats[hour].bookings++
      if (appointment.status === "completed") {
        hourlyStats[hour].completed++
      }
    })

    // Format hours for display
    const popularHours = hourlyStats
      .filter((h) => h.bookings > 0)
      .map((h) => ({
        hour: `${h.hour.toString().padStart(2, "0")}:00`,
        bookings: h.bookings,
        completed: h.completed,
        completionRate: h.bookings > 0 ? Math.round((h.completed / h.bookings) * 100) : 0,
      }))

    // Calculate weekly patterns (0=Sunday, 1=Monday, etc.)
    const weeklyStats = new Array(7).fill(0).map((_, day) => ({
      dayOfWeek: day,
      dayName: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][day],
      bookings: 0,
      completed: 0,
      revenue: 0,
    }))

    appointments?.forEach((appointment) => {
      const dayOfWeek = new Date(appointment.appointment_date).getDay()
      weeklyStats[dayOfWeek].bookings++
      if (appointment.status === "completed") {
        weeklyStats[dayOfWeek].completed++
        weeklyStats[dayOfWeek].revenue += appointment.services?.price || 0
      }
    })

    const weeklyPatterns = weeklyStats
      .filter((d) => d.bookings > 0)
      .map((d) => ({
        ...d,
        completionRate: d.bookings > 0 ? Math.round((d.completed / d.bookings) * 100) : 0,
        averageRevenue: d.completed > 0 ? Math.round((d.revenue / d.completed) * 100) / 100 : 0,
      }))

    // Calculate cancellation reasons
    const cancellationReasons = appointments
      ?.filter((a) => a.status === "cancelled" && a.cancellation_reason)
      .reduce(
        (acc, appointment) => {
          const reason = appointment.cancellation_reason || "לא צוין"
          acc[reason] = (acc[reason] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    const cancellationAnalysis = Object.entries(cancellationReasons || {})
      .sort(([, a], [, b]) => b - a)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage:
          appointments?.filter((a) => a.status === "cancelled").length > 0
            ? Math.round((count / appointments.filter((a) => a.status === "cancelled").length) * 100)
            : 0,
      }))

    // Calculate booking patterns by month (for longer periods)
    const monthlyStats = new Map()
    appointments?.forEach((appointment) => {
      const monthKey = appointment.appointment_date.substring(0, 7) // YYYY-MM
      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, {
          month: monthKey,
          bookings: 0,
          completed: 0,
          revenue: 0,
        })
      }
      const monthData = monthlyStats.get(monthKey)
      monthData.bookings++
      if (appointment.status === "completed") {
        monthData.completed++
        monthData.revenue += appointment.services?.price || 0
      }
    })

    const monthlyPatterns = Array.from(monthlyStats.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        ...m,
        completionRate: m.bookings > 0 ? Math.round((m.completed / m.bookings) * 100) : 0,
      }))

    return NextResponse.json({
      popularHours,
      weeklyPatterns,
      monthlyPatterns,
      cancellationAnalysis,
    })
  } catch (error) {
    console.error("Error in patterns analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
