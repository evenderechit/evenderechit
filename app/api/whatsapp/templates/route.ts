import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// קבלת תבניות הודעות
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

    const { data, error } = await supabaseServer
      .from("Whatsapp_templates")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("template_type")
      .order("template_name")

    if (error) {
      console.error("Error fetching WhatsApp templates:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ templates: data }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in get WhatsApp templates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// עדכון תבנית הודעה
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

    const { template_id, message_template } = await request.json()

    if (!template_id || !message_template) {
      return NextResponse.json({ error: "Template ID and message template are required" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("Whatsapp_templates")
      .update({ message_template })
      .eq("id", template_id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating WhatsApp template:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template: data }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error in update WhatsApp template:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
