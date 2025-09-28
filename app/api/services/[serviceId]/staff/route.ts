// app/api/services/[serviceId]/staff/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from "@/utils/supabase/server"

// GET: Get staff members assigned to a specific service
export async function GET(request: Request, { params }: { params: { serviceId: string } }) {
  try {
    const supabaseServer = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceId = params.serviceId

    const { data, error } = await supabase.from("Service_Staff").select("staff_member_id").eq("service_id", serviceId)

    if (error) {
      console.error("Error fetching service staff:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const staffIds = data.map((row) => row.staff_member_id)
    return NextResponse.json({ staffIds }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in get service staff API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Assign staff members to a service (or update assignments)
export async function POST(request: Request, { params }: { params: { serviceId: string } }) {
  try {
    const supabaseServer = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceId = params.serviceId
    const { staff_member_ids } = await request.json() // Array of staff IDs

    // Validate that the service belongs to the user
    const { data: serviceCheck, error: serviceCheckError } = await supabase
      .from("Services")
      .select("id")
      .eq("id", serviceId)
      .eq("user_id", user.id)
      .single()

    if (serviceCheckError || !serviceCheck) {
      return NextResponse.json({ error: "Service not found or unauthorized" }, { status: 404 })
    }

    // Delete existing assignments for this service
    const { error: deleteError } = await supabase.from("Service_Staff").delete().eq("service_id", serviceId)

    if (deleteError) {
      console.error("Error deleting existing service staff assignments:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Insert new assignments
    if (staff_member_ids && staff_member_ids.length > 0) {
      const assignments = staff_member_ids.map((staffId: string) => ({
        service_id: serviceId,
        staff_member_id: staffId,
      }))

      const { data, error } = await supabase.from("Service_Staff").insert(assignments).select()

      if (error) {
        console.error("Error assigning staff to service:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json(
        { message: "Staff assigned to service successfully", assignments: data },
        { status: 200 },
      )
    }

    return NextResponse.json({ message: "No staff assigned to service" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in assign staff to service API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
