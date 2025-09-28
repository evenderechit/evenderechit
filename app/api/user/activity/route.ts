import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const supabaseServer = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // שליפת פעילות המשתמש
    const { data: activities, error: activitiesError } = await supabase
      .from("user_activity_log")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (activitiesError) {
      console.error("Error fetching user activities:", activitiesError)
      return NextResponse.json({ error: activitiesError.message }, { status: 500 })
    }

    return NextResponse.json({ activities: activities || [] })
  } catch (error) {
    console.error("Unexpected error in user activity API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseServer = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, details } = await request.json()

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    // רישום פעילות חדשה
    const { data: activity, error: insertError } = await supabase
      .from("user_activity_log")
      .insert({
        user_id: user.id,
        action,
        details: details || {},
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error logging user activity:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ activity })
  } catch (error) {
    console.error("Unexpected error in log user activity API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
