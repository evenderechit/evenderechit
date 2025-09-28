// app/api/cron/process-reminders/route.ts
import { NextResponse } from "next/server"

// פונקציה זו תופעל על ידי Vercel Cron Jobs
export async function GET(request: Request) {
  try {
    // בדיקת authorization (אופציונלי - להגנה על ה-endpoint)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // קריאה לפונקציית עיבוד התזכורות
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/process-reminders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data, { status: 200 })
    } else {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
