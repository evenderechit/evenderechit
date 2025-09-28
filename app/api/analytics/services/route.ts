import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    // Mock services data
    const services = [
      { id: 1, name: "תספורת גברים", color: "#3B82F6", price: 80 },
      { id: 2, name: "תספורת נשים", color: "#EF4444", price: 120 },
      { id: 3, name: "צביעת שיער", color: "#10B981", price: 200 },
      { id: 4, name: "עיצוב שיער", color: "#F59E0B", price: 150 },
      { id: 5, name: "טיפול פנים", color: "#8B5CF6", price: 180 },
    ]

    // Mock appointments data based on days parameter
    const mockAppointments = [
      {
        service_id: 1,
        status: "completed",
        appointment_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        service_id: 1,
        status: "completed",
        appointment_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        service_id: 1,
        status: "cancelled",
        appointment_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        service_id: 2,
        status: "completed",
        appointment_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        service_id: 2,
        status: "completed",
        appointment_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        service_id: 2,
        status: "no_show",
        appointment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        service_id: 3,
        status: "completed",
        appointment_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        service_id: 3,
        status: "completed",
        appointment_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        service_id: 4,
        status: "completed",
        appointment_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        service_id: 5,
        status: "completed",
        appointment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    // Calculate service performance
    const servicePerformance = services.map((service) => {
      const serviceAppointments = mockAppointments.filter((a) => a.service_id === service.id)
      const totalBookings = serviceAppointments.length
      const completedBookings = serviceAppointments.filter((a) => a.status === "completed").length
      const cancelledBookings = serviceAppointments.filter((a) => a.status === "cancelled").length
      const noShowBookings = serviceAppointments.filter((a) => a.status === "no_show").length

      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
      const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0

      const totalRevenue = serviceAppointments
        .filter((a) => a.status === "completed")
        .reduce((sum, a) => sum + (service.price || 0), 0)

      return {
        id: service.id,
        name: service.name,
        color: service.color,
        price: service.price,
        totalBookings,
        completedBookings,
        cancelledBookings,
        noShowBookings,
        completionRate: Math.round(completionRate * 100) / 100,
        cancellationRate: Math.round(cancellationRate * 100) / 100,
        totalRevenue,
        averageRevenue: completedBookings > 0 ? Math.round((totalRevenue / completedBookings) * 100) / 100 : 0,
      }
    })

    // Sort by total bookings descending
    servicePerformance.sort((a, b) => b.totalBookings - a.totalBookings)

    // Get service distribution for chart
    const serviceDistribution = servicePerformance
      .filter((s) => s.totalBookings > 0)
      .map((service) => ({
        name: service.name,
        value: service.totalBookings,
        color: service.color,
        revenue: service.totalRevenue,
      }))

    return NextResponse.json({
      servicePerformance,
      serviceDistribution,
    })
  } catch (error) {
    console.error("Error in services analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
