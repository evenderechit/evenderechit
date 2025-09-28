import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // שליפת הגדרות העסק
    const { data, error } = await supabase.from("Settings").select("*").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // לא נמצאו הגדרות - זה תקין למשתמש חדש
        return NextResponse.json({ settings: null }, { status: 404 })
      }
      console.error("Supabase error fetching settings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error("Unhandled error in get settings API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
