import { NextResponse } from "next/server"

const demoUsers = [
  {
    id: "1",
    email: "admin@example.com",
    full_name: "מנהל המערכת",
    role_id: "1",
    role_name: "מנהל ראשי",
    status: "active",
    last_login: "2024-01-15T10:30:00Z",
    created_at: "2024-01-01T08:00:00Z",
    phone: "050-1234567",
    total_appointments: 25,
    last_appointment: "2024-01-14T14:00:00Z",
  },
  {
    id: "2",
    email: "john@example.com",
    full_name: "יוחנן כהן",
    role_id: "2",
    role_name: "לקוח",
    status: "active",
    last_login: "2024-01-14T16:45:00Z",
    created_at: "2024-01-05T12:15:00Z",
    phone: "052-9876543",
    total_appointments: 12,
    last_appointment: "2024-01-13T10:30:00Z",
  },
  {
    id: "3",
    email: "sarah@example.com",
    full_name: "שרה לוי",
    role_id: "3",
    role_name: "לקוח",
    status: "active",
    last_login: "2024-01-10T09:20:00Z",
    created_at: "2024-01-03T14:30:00Z",
    phone: "054-5555555",
    total_appointments: 8,
    last_appointment: "2024-01-12T16:00:00Z",
  },
  {
    id: "4",
    email: "david@example.com",
    full_name: "דוד אברהם",
    role_id: "3",
    role_name: "לקוח",
    status: "active",
    last_login: "2024-01-13T11:15:00Z",
    created_at: "2024-01-08T09:45:00Z",
    phone: "053-7777777",
    total_appointments: 15,
    last_appointment: "2024-01-11T13:30:00Z",
  },
  {
    id: "5",
    email: "rachel@example.com",
    full_name: "רחל מזרחי",
    role_id: "3",
    role_name: "לקוח",
    status: "inactive",
    last_login: "2024-01-05T14:20:00Z",
    created_at: "2024-01-02T16:30:00Z",
    phone: "050-9999999",
    total_appointments: 3,
    last_appointment: "2024-01-05T15:00:00Z",
  },
]

export async function GET() {
  try {
    return NextResponse.json({ users: demoUsers })
  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { email, full_name, role_id, phone } = await request.json()

    if (!email || !full_name || !role_id) {
      return NextResponse.json({ error: "Email, full_name, and role_id are required" }, { status: 400 })
    }

    const existingUser = demoUsers.find((user) => user.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const newUser = {
      id: String(demoUsers.length + 1),
      email,
      full_name,
      role_id,
      role_name: role_id === "1" ? "מנהל ראשי" : "לקוח",
      status: "active",
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      phone: phone || "",
      total_appointments: 0,
      last_appointment: null,
    }

    // הוספה לרשימת הדמו (זה לא יישמר בין רענונים)
    demoUsers.push(newUser)

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error("Error in POST users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
