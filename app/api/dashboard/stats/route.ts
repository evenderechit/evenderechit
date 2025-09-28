import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return realistic demo data for dashboard stats
    return NextResponse.json({
      totalAppointments: 156,
      todayAppointments: 8,
      totalCustomers: 89,
      pendingAppointments: 3,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({
      totalAppointments: 0,
      todayAppointments: 0,
      totalCustomers: 0,
      pendingAppointments: 0,
    })
  }
}
