// app/api/services/[serviceId]/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from "@/utils/supabase/server"

// GET: Get a single service by ID
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

    const { data, error } = await supabase
      .from("Services")
      .select("*, Service_Staff(staff_member_id)")
      .eq("id", serviceId)
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching service by ID:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ service: null, message: "Service not found." }, { status: 404 })
    }

    const serviceWithStaff = {
      ...data,
      assigned_staff_ids: data.Service_Staff.map((ss) => ss.staff_member_id),
    }

    return NextResponse.json({ service: serviceWithStaff }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in get service by ID API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT: Update an existing service
export async function PUT(request: Request, { params }: { params: { serviceId: string } }) {
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
    const { name, description, duration_minutes, price, color, is_active, assigned_staff_ids } = await request.json()

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes
    if (price !== undefined) updateData.price = price
    if (color !== undefined) updateData.color = color
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: service, error } = await supabase
      .from("Services")
      .update(updateData)
      .eq("id", serviceId)
      .eq("user_id", user.id) // Ensure owner can only update their own services
      .select()
      .single()

    if (error) {
      console.error("Error updating service:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update staff assignments for the service
    if (assigned_staff_ids !== undefined) {
      // Delete existing assignments
      const { error: deleteError } = await supabase.from("Service_Staff").delete().eq("service_id", serviceId)

      if (deleteError) {
        console.error("Error deleting existing service staff assignments during update:", deleteError)
        // Don't fail the whole request
      }

      // Insert new assignments
      if (assigned_staff_ids.length > 0) {
        const assignments = assigned_staff_ids.map((staffId: string) => ({
          service_id: serviceId,
          staff_member_id: staffId,
        }))
        const { error: insertError } = await supabase.from("Service_Staff").insert(assignments)
        if (insertError) {
          console.error("Error inserting new service staff assignments during update:", insertError)
        }
      }
    }

    return NextResponse.json({ service: { ...service, assigned_staff_ids: assigned_staff_ids || [] } }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in update service API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete a service (soft delete by setting is_active to false)
export async function DELETE(request: Request, { params }: { params: { serviceId: string } }) {
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

    // Perform a soft delete by setting is_active to false
    const { data, error } = await supabase
      .from("Services")
      .update({ is_active: false })
      .eq("id", serviceId)
      .eq("user_id", user.id) // Ensure owner can only delete their own services
      .select()
      .single()

    if (error) {
      console.error("Error deleting service:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also remove from Service_Staff table
    const { error: deleteStaffServiceError } = await supabase.from("Service_Staff").delete().eq("service_id", serviceId)

    if (deleteStaffServiceError) {
      console.error("Error deleting service staff assignments:", deleteStaffServiceError)
    }

    return NextResponse.json({ message: "Service deactivated successfully", service: data }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in delete service API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
