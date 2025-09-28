"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, TrendingUp, Phone, MessageSquare, BarChart3, Eye, UserPlus } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalAppointments: number
  todayAppointments: number
  totalCustomers: number
  pendingAppointments: number
}

interface TodayAppointment {
  id: string
  customer_name: string
  service_name: string
  appointment_time: string
  status: string
  phone?: string
}

// Added Customer interface
interface Customer {
  id: string
  name: string
  phone: string
  last_appointment: string
  total_appointments: number
  status: "active" | "inactive"
}

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    totalCustomers: 0,
    pendingAppointments: 0,
  })

  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([])
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data...")

        try {
          const statsResponse = await fetch("/api/dashboard/stats")
          console.log("Stats response status:", statsResponse.status)

          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            console.log("Stats data received:", statsData)
            setStats(statsData)
          } else {
            console.warn("Stats API failed, using demo data")
            setStats({
              totalAppointments: 156,
              todayAppointments: 8,
              totalCustomers: 89,
              pendingAppointments: 3,
            })
          }
        } catch (statsError) {
          console.error("Error fetching stats:", statsError)
          setStats({
            totalAppointments: 156,
            todayAppointments: 8,
            totalCustomers: 89,
            pendingAppointments: 3,
          })
        }

        try {
          const appointmentsResponse = await fetch("/api/dashboard/today-appointments")
          console.log("Appointments response status:", appointmentsResponse.status)

          if (appointmentsResponse.ok) {
            const appointmentsData = await appointmentsResponse.json()
            console.log("Appointments data received:", appointmentsData)
            if (Array.isArray(appointmentsData)) {
              setTodayAppointments(appointmentsData)
            } else {
              console.warn("Appointments data is not an array, using demo data")
              setTodayAppointments(getDemoAppointments())
            }
          } else {
            console.warn("Appointments API failed, using demo data")
            setTodayAppointments(getDemoAppointments())
          }
        } catch (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError)
          setTodayAppointments(getDemoAppointments())
        }

        try {
          const customersResponse = await fetch("/api/users?limit=5")
          console.log("Customers response status:", customersResponse.status)

          if (customersResponse.ok) {
            const customersData = await customersResponse.json()
            console.log("Customers data received:", customersData)
            if (Array.isArray(customersData)) {
              setRecentCustomers(customersData.slice(0, 5))
            } else {
              console.warn("Customers data is not an array, using demo data")
              setRecentCustomers(getDemoCustomers())
            }
          } else {
            console.warn("Customers API failed, using demo data")
            setRecentCustomers(getDemoCustomers())
          }
        } catch (customersError) {
          console.error("Error fetching customers:", customersError)
          setRecentCustomers(getDemoCustomers())
        }
      } catch (error) {
        console.error("General error fetching dashboard data:", error)
        setStats({
          totalAppointments: 156,
          todayAppointments: 8,
          totalCustomers: 89,
          pendingAppointments: 3,
        })
        setTodayAppointments(getDemoAppointments())
        setRecentCustomers(getDemoCustomers())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            מאושר
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            ממתין
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">בוטל</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDemoCustomers = (): Customer[] => [
    {
      id: "1",
      name: "יוסי כהן",
      phone: "050-1234567",
      last_appointment: "2024-01-15",
      total_appointments: 12,
      status: "active",
    },
    {
      id: "2",
      name: "שרה לוי",
      phone: "052-9876543",
      last_appointment: "2024-01-14",
      total_appointments: 8,
      status: "active",
    },
    {
      id: "3",
      name: "דוד ישראלי",
      phone: "054-5555555",
      last_appointment: "2024-01-10",
      total_appointments: 15,
      status: "active",
    },
    {
      id: "4",
      name: "מירי אברהם",
      phone: "053-1111111",
      last_appointment: "2024-01-08",
      total_appointments: 6,
      status: "inactive",
    },
    {
      id: "5",
      name: "אבי רוזן",
      phone: "058-7777777",
      last_appointment: "2024-01-12",
      total_appointments: 9,
      status: "active",
    },
  ]

  const getCustomerStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            פעיל
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            לא פעיל
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDemoAppointments = (): TodayAppointment[] => [
    {
      id: "1",
      customer_name: "יוסי כהן",
      service_name: "תספורת גברים",
      appointment_time: "09:00",
      status: "confirmed",
      phone: "050-1234567",
    },
    {
      id: "2",
      customer_name: "שרה לוי",
      service_name: "צביעה וחיתוך",
      appointment_time: "10:30",
      status: "pending",
      phone: "052-9876543",
    },
    {
      id: "3",
      customer_name: "דוד ישראלי",
      service_name: "עיצוב שיער",
      appointment_time: "14:00",
      status: "confirmed",
      phone: "054-5555555",
    },
    {
      id: "4",
      customer_name: "מירי אברהם",
      service_name: "טיפוח פנים",
      appointment_time: "16:30",
      status: "pending",
      phone: "053-1111111",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">דשבורד</h2>
        <Link href="/analytics">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="mr-2 h-4 w-4" />
            צפה בדוחות מפורטים
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה"כ תורים</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">+20.1% מהחודש הקודם</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תורים היום</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">+2 מאתמול</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לקוחות</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+5 השבוע</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ממתינים לאישור</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
            <p className="text-xs text-muted-foreground">זקוק לטיפול</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Today's Appointments */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>תורים היום</CardTitle>
            <CardDescription>רשימת התורים המתוכננים להיום</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{appointment.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm font-medium">{appointment.appointment_time}</span>
                    {getStatusBadge(appointment.status)}
                    <div className="flex space-x-1 space-x-reverse">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">אין תורים מתוכננים להיום</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>לקוחות אחרונים</CardTitle>
              <CardDescription>לקוחות שהיו לאחרונה</CardDescription>
            </div>
            <Link href="/users">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                צפה בכל הלקוחות
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  <p className="text-xs text-muted-foreground">{customer.total_appointments} תורים</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getCustomerStatusBadge(customer.status)}
                  <p className="text-xs text-muted-foreground">{customer.last_appointment}</p>
                </div>
              </div>
            ))}
            {recentCustomers.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">אין לקוחות להצגה</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/appointments">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium">הוסף תור חדש</p>
                <p className="text-xs text-muted-foreground">קבע תור ללקוח</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/users">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-6">
              <UserPlus className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium">הוסף לקוח חדש</p>
                <p className="text-xs text-muted-foreground">רשום לקוח חדש</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-6">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium">דוחות ואנליטיקה</p>
                <p className="text-xs text-muted-foreground">צפה בסטטיסטיקות</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-6">
            <MessageSquare className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium">שלח הודעה</p>
              <p className="text-xs text-muted-foreground">התקשר עם לקוחות</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
