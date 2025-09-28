import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

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

    // Get staff members
    const { data: staffMembers, error: staffError } = await supabase
      .from("staff_members")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)

    if (staffError) {
      console.error("Error fetching staff:", staffError)
      return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 })
    }

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

    // Calculate staff performance including business owner
    const staffPerformance = []

    // Add business owner performance (appointments without staff_member_id)
    const ownerAppointments = appointments?.filter((a) => !a.staff_member_id) || []
    const ownerStats = {
      id: "owner",
      name: "בעל העסק",
      email: user.email,
      totalAppointments: ownerAppointments.length,
      completedAppointments: ownerAppointments.filter((a) => a.status === "completed").length,
      cancelledAppointments: ownerAppointments.filter((a) => a.status === "cancelled").length,
      noShowAppointments: ownerAppointments.filter((a) => a.status === "no_show").length,
      completionRate:
        ownerAppointments.length > 0
          ? (ownerAppointments.filter((a) => a.status === "completed").length / ownerAppointments.length) * 100
          : 0,
      totalRevenue: ownerAppointments
        .filter((a) => a.status === "completed")
        .reduce((sum, a) => sum + (a.services?.price || 0), 0),
    }

    if (ownerStats.totalAppointments > 0) {
      staffPerformance.push({
        ...ownerStats,
        completionRate: Math.round(ownerStats.completionRate * 100) / 100,
        averageRevenue:
          ownerStats.completedAppointments > 0
            ? Math.round((ownerStats.totalRevenue / ownerStats.completedAppointments) * 100) / 100
            : 0,
      })
    }

    // Add staff members performance
    staffMembers?.forEach((staff) => {
      const staffAppointments = appointments?.filter((a) => a.staff_member_id === staff.id) || []
      const totalAppointments = staffAppointments.length
      const completedAppointments = staffAppointments.filter((a) => a.status === "completed").length
      const cancelledAppointments = staffAppointments.filter((a) => a.status === "cancelled").length
      const noShowAppointments = staffAppointments.filter((a) => a.status === "no_show").length

      const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0

      const totalRevenue = staffAppointments
        .filter((a) => a.status === "completed")
        .reduce((sum, a) => sum + (a.services?.price || 0), 0)

      if (totalAppointments > 0) {
        staffPerformance.push({
          id: staff.id,
          name: staff.name,
          email: staff.email,
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          noShowAppointments,
          completionRate: Math.round(completionRate * 100) / 100,
          totalRevenue,
          averageRevenue:
            completedAppointments > 0 ? Math.round((totalRevenue / completedAppointments) * 100) / 100 : 0,
        })
      }
    })

    // Sort by total appointments descending
    staffPerformance.sort((a, b) => b.totalAppointments - a.totalAppointments)

    // Create staff comparison chart data
    const staffComparison = staffPerformance.map((staff) => ({
      name: staff.name,
      appointments: staff.totalAppointments,
      completed: staff.completedAppointments,
      revenue: staff.totalRevenue,
      completionRate: staff.completionRate,
    }))

    return NextResponse.json({
      staffPerformance,
      staffComparison,
    })
  } catch (error) {
    console.error("Error in staff analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
