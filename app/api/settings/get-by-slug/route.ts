import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    // שליפת הגדרות העסק לפי slug
    const { data, error } = await supabase.from("Settings").select("*").eq("link_slug", slug).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Business not found" }, { status: 404 })
      }
      console.error("Supabase error fetching settings by slug:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error("Unhandled error in get settings by slug API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
