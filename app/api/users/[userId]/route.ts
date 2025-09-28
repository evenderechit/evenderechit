import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params

    // Get user details
    const { data: businessUser, error: userError } = await supabase
      .from("business_users")
      .select(`
        *,
        user:auth.users!business_users_user_id_fkey(
          id,
          email,
          user_metadata,
          created_at,
          last_sign_in_at
        ),
        role:roles(
          id,
          name,
          display_name,
          description,
          permissions
        ),
        invited_by_user:auth.users!business_users_invited_by_fkey(
          email,
          user_metadata
        )
      `)
      .eq("business_owner_id", user.id)
      .eq("user_id", userId)
      .single()

    if (userError || !businessUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user activity (last 50 activities)
    const { data: activities } = await supabase
      .from("user_activity")
      .select("*")
      .eq("business_owner_id", user.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    return NextResponse.json({
      user: businessUser,
      activities: activities || [],
    })
  } catch (error) {
    console.error("Error in user GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { userId: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params
    const body = await request.json()
    const { role_id, status, notes } = body

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from("business_users")
      .update({
        role_id,
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("business_owner_id", user.id)
      .eq("user_id", userId)
      .select(`
        *,
        user:auth.users!business_users_user_id_fkey(
          id,
          email,
          user_metadata
        ),
        role:roles(
          display_name
        )
      `)
      .single()

    if (updateError) {
      console.error("Error updating user:", updateError)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    // Log activity
    await supabase.rpc("log_user_activity", {
      p_business_owner_id: user.id,
      p_user_id: user.id,
      p_action: "update_user",
      p_resource_type: "business_user",
      p_resource_id: updatedUser.id,
      p_details: { role_id, status, notes },
    })

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error in user PUT API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params

    // Cannot delete self
    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
    }

    // Get user details before deletion
    const { data: businessUser } = await supabase
      .from("business_users")
      .select(`
        *,
        user:auth.users!business_users_user_id_fkey(email)
      `)
      .eq("business_owner_id", user.id)
      .eq("user_id", userId)
      .single()

    if (!businessUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user from business
    const { error: deleteError } = await supabase
      .from("business_users")
      .delete()
      .eq("business_owner_id", user.id)
      .eq("user_id", userId)

    if (deleteError) {
      console.error("Error deleting user:", deleteError)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    // Log activity
    await supabase.rpc("log_user_activity", {
      p_business_owner_id: user.id,
      p_user_id: user.id,
      p_action: "remove_user",
      p_resource_type: "business_user",
      p_resource_id: businessUser.id,
      p_details: { email: businessUser.user.email },
    })

    return NextResponse.json({
      message: "User removed successfully",
    })
  } catch (error) {
    console.error("Error in user DELETE API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
