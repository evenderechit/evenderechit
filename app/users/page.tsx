"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Phone, Mail, Calendar, Search, Plus, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  totalAppointments: number
  lastAppointment?: string
  status: "active" | "inactive"
  notes?: string
}

export default function UsersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            setCustomers(data)
          } else {
            // אם הנתונים לא מערך, השתמש בנתוני דמו
            setCustomers(getDemoCustomers())
          }
        } else {
          // Demo data
          setCustomers(getDemoCustomers())
        }
      } catch (error) {
        console.error("Error fetching customers:", error)
        // Set demo data on error
        setCustomers(getDemoCustomers())
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const getDemoCustomers = (): Customer[] => [
    {
      id: "1",
      name: "יוסי כהן",
      phone: "050-1234567",
      email: "yossi@example.com",
      totalAppointments: 15,
      lastAppointment: "2024-01-10",
      status: "active",
      notes: "לקוח VIP",
    },
    {
      id: "2",
      name: "שרה לוי",
      phone: "052-9876543",
      email: "sara@example.com",
      totalAppointments: 8,
      lastAppointment: "2024-01-08",
      status: "active",
    },
    {
      id: "3",
      name: "דוד ישראלי",
      phone: "054-5555555",
      totalAppointments: 22,
      lastAppointment: "2024-01-12",
      status: "active",
      notes: "מעדיף בוקר",
    },
    {
      id: "4",
      name: "מירי אברהם",
      phone: "053-1111111",
      email: "miri@example.com",
      totalAppointments: 3,
      lastAppointment: "2023-12-20",
      status: "inactive",
    },
    {
      id: "5",
      name: "אבי רוזן",
      phone: "050-7777777",
      totalAppointments: 12,
      lastAppointment: "2024-01-14",
      status: "active",
    },
    {
      id: "6",
      name: "רחל גולדברג",
      phone: "052-3333333",
      email: "rachel@example.com",
      totalAppointments: 6,
      lastAppointment: "2024-01-05",
      status: "active",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">פעיל</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">לא פעיל</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const filteredCustomers = Array.isArray(customers)
    ? customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : []

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
        <h2 className="text-3xl font-bold tracking-tight">ניהול לקוחות</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          לקוח חדש
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="חפש לקוח..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה"כ לקוחות</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לקוחות פעילים</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.filter((c) => c.status === "active").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ממוצע תורים</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.length > 0
                ? Math.round(customers.reduce((sum, c) => sum + c.totalAppointments, 0) / customers.length)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/avatars/${customer.id}.jpg`} />
                    <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="font-medium text-lg">{customer.name}</span>
                      {getStatusBadge(customer.status)}
                    </div>
                    <div className="flex items-center space-x-4 space-x-reverse mt-1">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{customer.totalAppointments}</div>
                    <div className="text-xs text-muted-foreground">תורים</div>
                  </div>
                  {customer.lastAppointment && (
                    <div className="text-center">
                      <div className="text-sm font-medium">{customer.lastAppointment}</div>
                      <div className="text-xs text-muted-foreground">תור אחרון</div>
                    </div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>צפה בפרטים</DropdownMenuItem>
                      <DropdownMenuItem>עריכה</DropdownMenuItem>
                      <DropdownMenuItem>קבע תור</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">מחק</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {customer.notes && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>הערות:</strong> {customer.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredCustomers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">אין לקוחות להצגה</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "לא נמצאו לקוחות התואמים לחיפוש שלך" : "עדיין לא נוספו לקוחות למערכת"}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                הוסף לקוח ראשון
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
