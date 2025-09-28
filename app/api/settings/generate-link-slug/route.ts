import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// פונקציה ליצירת slug מתוך שם עסק
function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // הסרת תווים מיוחדים
    .replace(/\s+/g, "-") // החלפת רווחים במקפים
    .replace(/-+/g, "-") // החלפת מקפים כפולים במקף יחיד
    .trim()
    .substring(0, 50) // הגבלת אורך
}

export async function POST(request: Request) {
  try {
    const { user_id, business_name } = await request.json()

    if (!user_id || !business_name) {
      return NextResponse.json({ error: "User ID and business name are required" }, { status: 400 })
    }

    const baseSlug = generateSlug(business_name)
    let finalSlug = baseSlug
    let counter = 1

    // בדיקה אם הslug כבר קיים ויצירת slug ייחודי
    while (true) {
      const { data: existingSlug, error: checkError } = await supabase
        .from("Settings")
        .select("link_slug")
        .eq("link_slug", finalSlug)
        .single()

      if (checkError && checkError.code === "PGRST116") {
        // הslug לא קיים - אפשר להשתמש בו
        break
      } else if (checkError) {
        console.error("Error checking slug uniqueness:", checkError)
        return NextResponse.json({ error: checkError.message }, { status: 500 })
      } else {
        // הslug קיים - ננסה עם מספר
        finalSlug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // יצירת או עדכון הגדרות העסק
    const { data, error } = await supabase
      .from("Settings")
      .upsert(
        {
          user_id,
          business_name,
          link_slug: finalSlug,
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("Error creating/updating settings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      link_slug: finalSlug,
      settings: data,
    })
  } catch (error) {
    console.error("Unhandled error in generate link slug API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
