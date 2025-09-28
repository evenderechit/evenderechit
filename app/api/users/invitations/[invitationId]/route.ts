import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// ביטול הזמנה
export async function DELETE(request: Request, { params }: { params: { invitationId: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { invitationId } = params

    // Get invitation details before deletion
    const { data: invitation } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("business_owner_id", user.id)
      .eq("id", invitationId)
      .single()

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    // Delete invitation
    const { error: deleteError } = await supabase
      .from("user_invitations")
      .delete()
      .eq("business_owner_id", user.id)
      .eq("id", invitationId)

    if (deleteError) {
      console.error("Error deleting invitation:", deleteError)
      return NextResponse.json({ error: "Failed to delete invitation" }, { status: 500 })
    }

    // Log activity
    await supabase.rpc("log_user_activity", {
      p_business_owner_id: user.id,
      p_user_id: user.id,
      p_action: "cancel_invitation",
      p_resource_type: "user_invitation",
      p_resource_id: invitationId,
      p_details: { email: invitation.email },
    })

    return NextResponse.json({ message: "Invitation cancelled successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error in invitation DELETE API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// שליחה מחדש של הזמנה
export async function POST(request: Request, { params }: { params: { invitationId: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { invitationId } = params

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from("user_invitations")
      .select(`
        *,
        role:roles(display_name)
      `)
      .eq("business_owner_id", user.id)
      .eq("id", invitationId)
      .eq("status", "pending")
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ error: "Invitation not found or already processed" }, { status: 404 })
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Update status to expired
      await supabase.from("user_invitations").update({ status: "expired" }).eq("id", invitationId)

      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
    }

    // TODO: Resend invitation email
    // await sendInvitationEmail(invitation.email, invitation.token, invitation.role.display_name)

    // Log activity
    await supabase.rpc("log_user_activity", {
      p_business_owner_id: user.id,
      p_user_id: user.id,
      p_action: "resend_invitation",
      p_resource_type: "user_invitation",
      p_resource_id: invitationId,
      p_details: { email: invitation.email },
    })

    return NextResponse.json({ message: "Invitation resent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error in invitation POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
