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

    // שליפת פרטי המנוי
    const { data: subscription, error: subscriptionError } = await supabase
      .from("Users")
      .select("subscription_status, subscription_plan, subscription_expires_at")
      .eq("id", user.id)
      .single()

    if (subscriptionError) {
      console.error("Error fetching subscription:", subscriptionError)
      return NextResponse.json({ error: subscriptionError.message }, { status: 500 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Unexpected error in subscription API:", error)
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

    const { plan } = await request.json()

    if (!plan || !["free", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 })
    }

    // עדכון המנוי
    const expiresAt =
      plan === "premium"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 ימים מהיום
        : null

    const { data: subscription, error: updateError } = await supabase
      .from("Users")
      .update({
        subscription_status: plan,
        subscription_plan: plan,
        subscription_expires_at: expiresAt?.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("subscription_status, subscription_plan, subscription_expires_at")
      .single()

    if (updateError) {
      console.error("Error updating subscription:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Unexpected error in update subscription API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
