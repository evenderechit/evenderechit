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

    // שליפת פרופיל המשתמש
    const { data: profile, error: profileError } = await supabase.from("Users").select("*").eq("id", user.id).single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Unexpected error in user profile API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabaseServer = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updateData = await request.json()

    // עדכון פרופיל המשתמש
    const { data: profile, error: updateError } = await supabase
      .from("Users")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating user profile:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Unexpected error in update user profile API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
