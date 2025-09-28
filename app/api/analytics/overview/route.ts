import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const supabaseServer = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current date info
    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)
    const currentYear = now.getFullYear()

    // Get total appointments
    const { count: totalAppointments } = await supabase
      .from("Appointments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Get this month's appointments
    const { count: thisMonthAppointments } = await supabase
      .from("Appointments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("appointment_date", `${currentMonth}-01`)
      .lt("appointment_date", `${currentMonth}-32`)

    // Get last month's appointments
    const { count: lastMonthAppointments } = await supabase
      .from("Appointments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("appointment_date", `${lastMonth}-01`)
      .lt("appointment_date", `${lastMonth}-32`)

    // Calculate growth
    const appointmentGrowth =
      lastMonthAppointments > 0
        ? (((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100).toFixed(1)
        : "0"

    // Get revenue data
    const { data: revenueData } = await supabase
      .from("Appointments")
      .select("Services(price)")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("appointment_date", `${currentMonth}-01`)
      .lt("appointment_date", `${currentMonth}-32`)

    const thisMonthRevenue =
      revenueData?.reduce((sum, appointment) => {
        return sum + (appointment.Services?.price || 0)
      }, 0) || 0

    // Get last month revenue
    const { data: lastMonthRevenueData } = await supabase
      .from("Appointments")
      .select("Services(price)")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("appointment_date", `${lastMonth}-01`)
      .lt("appointment_date", `${lastMonth}-32`)

    const lastMonthRevenue =
      lastMonthRevenueData?.reduce((sum, appointment) => {
        return sum + (appointment.Services?.price || 0)
      }, 0) || 0

    const revenueGrowth =
      lastMonthRevenue > 0 ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1) : "0"

    // Get popular services
    const { data: popularServices } = await supabase
      .from("Appointments")
      .select(`
        Services (id, name, color),
        count
      `)
      .eq("user_id", user.id)
      .gte("appointment_date", `${currentMonth}-01`)
      .lt("appointment_date", `${currentMonth}-32`)

    // Process popular services data
    const serviceStats = {}
    popularServices?.forEach((appointment) => {
      const serviceId = appointment.Services?.id
      if (serviceId) {
        if (!serviceStats[serviceId]) {
          serviceStats[serviceId] = {
            id: serviceId,
            name: appointment.Services.name,
            color: appointment.Services.color,
            count: 0,
          }
        }
        serviceStats[serviceId].count += 1
      }
    })

    const topServices = Object.values(serviceStats)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    // Get monthly data for chart (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = date.toISOString().slice(0, 7)
      const monthName = date.toLocaleDateString("he-IL", { month: "short", year: "numeric" })

      const { count: monthCount } = await supabase
        .from("Appointments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("appointment_date", `${monthStr}-01`)
        .lt("appointment_date", `${monthStr}-32`)

      monthlyData.push({
        month: monthName,
        appointments: monthCount || 0,
      })
    }

    // Get status distribution
    const { data: statusData } = await supabase
      .from("Appointments")
      .select("status")
      .eq("user_id", user.id)
      .gte("appointment_date", `${currentMonth}-01`)
      .lt("appointment_date", `${currentMonth}-32`)

    const statusStats = {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    }

    statusData?.forEach((appointment) => {
      if (statusStats.hasOwnProperty(appointment.status)) {
        statusStats[appointment.status]++
      }
    })

    return NextResponse.json({
      overview: {
        totalAppointments: totalAppointments || 0,
        thisMonthAppointments: thisMonthAppointments || 0,
        appointmentGrowth: Number.parseFloat(appointmentGrowth),
        thisMonthRevenue,
        revenueGrowth: Number.parseFloat(revenueGrowth),
        topServices,
        monthlyData,
        statusStats,
      },
    })
  } catch (error) {
    console.error("Error fetching analytics overview:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
