import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    // מחיקת התור מהטבלה
    const { error } = await supabase.from("Appointments").delete().eq("id", id)

    if (error) {
      console.error("Supabase error deleting appointment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Appointment deleted successfully" })
  } catch (error) {
    console.error("Unhandled error in delete appointment API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
