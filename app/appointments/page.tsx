"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { he } from "date-fns/locale"

interface Appointment {
  id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  service_name: string
  appointment_date: string
  appointment_time: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
  notes?: string
  created_at: string
}

const statusLabels = {
  scheduled: "מתוזמן",
  confirmed: "מאושר",
  completed: "הושלם",
  cancelled: "בוטל",
  no_show: "לא הגיע",
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-orange-100 text-orange-800",
}

const demoAppointments: Appointment[] = [
  {
    id: "1",
    customer_name: "יוסי כהן",
    customer_phone: "050-1234567",
    customer_email: "yossi@example.com",
    service_name: "טיפול שיניים",
    appointment_date: "2024-01-15",
    appointment_time: "10:30",
    status: "confirmed",
    notes: "בדיקה שגרתיית",
    created_at: "2024-01-10T08:00:00Z",
  },
  {
    id: "2",
    customer_name: "שרה לוי",
    customer_phone: "052-9876543",
    customer_email: "sara@example.com",
    service_name: "בדיקה כללית",
    appointment_date: "2024-01-15",
    appointment_time: "11:00",
    status: "scheduled",
    notes: "",
    created_at: "2024-01-12T10:30:00Z",
  },
  {
    id: "3",
    customer_name: "דוד אברהם",
    customer_phone: "054-5555555",
    service_name: "ייעוץ",
    appointment_date: "2024-01-15",
    appointment_time: "11:30",
    status: "scheduled",
    created_at: "2024-01-13T14:15:00Z",
  },
]

const formatAppointmentDate = (dateString: string) => {
  try {
    if (!dateString || typeof dateString !== "string" || dateString.trim() === "") {
      return "תאריך לא תקין"
    }

    // Handle different date formats
    let date: Date

    // Check if it's already a valid date string that can be parsed directly
    if (dateString.includes("T") || dateString.includes("Z")) {
      // ISO format date
      date = new Date(dateString)
    } else if (dateString.includes("-") && dateString.length === 10) {
      // Handle date-only strings like "2024-01-15"
      const parts = dateString.split("-")
      if (parts.length !== 3) {
        return "תאריך לא תקין"
      }

      const [year, month, day] = parts.map(Number)

      // Validate that all parts are valid numbers
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return "תאריך לא תקין"
      }

      // Validate date ranges
      if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        return "תאריך לא תקין"
      }

      date = new Date(year, month - 1, day) // month is 0-indexed
    } else {
      // Try to parse as-is
      date = new Date(dateString)
    }

    // Check if the date is valid
    if (isNaN(date.getTime()) || !isFinite(date.getTime())) {
      return "תאריך לא תקין"
    }

    // Additional check for reasonable date range
    const now = new Date()
    const minDate = new Date(now.getFullYear() - 10, 0, 1)
    const maxDate = new Date(now.getFullYear() + 10, 11, 31)

    if (date < minDate || date > maxDate) {
      return "תאריך לא תקין"
    }

    return format(date, "dd/MM/yyyy", { locale: he })
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString)
    return "תאריך לא תקין"
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(demoAppointments)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    service_name: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  })

  const handleAddAppointment = async () => {
    try {
      if (!formData.customer_name.trim() || !formData.appointment_date || !formData.appointment_time) {
        toast.error("אנא מלא את כל השדות הנדרשים")
        return
      }

      const newAppointment: Appointment = {
        id: Date.now().toString(),
        ...formData,
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim(),
        service_name: formData.service_name.trim(),
        notes: formData.notes.trim(),
        status: "scheduled" as const,
        created_at: new Date().toISOString(),
      }

      setAppointments((prev) => [newAppointment, ...prev])
      toast.success("התור נוסף בהצלחה")
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error:", error)
      toast.error("שגיאה בהוספת התור")
    }
  }

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status: newStatus as any } : appointment,
        ),
      )
      toast.success("הסטטוס עודכן בהצלחה")
    } catch (error) {
      console.error("Error:", error)
      toast.error("שגיאה בעדכון הסטטוס")
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את התור?")) {
      return
    }

    try {
      setAppointments((prev) => prev.filter((appointment) => appointment.id !== appointmentId))
      toast.success("התור נמחק בהצלחה")
    } catch (error) {
      console.error("Error:", error)
      toast.error("שגיאה במחיקת התור")
    }
  }

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      service_name: "",
      appointment_date: "",
      appointment_time: "",
      notes: "",
    })
    setEditingAppointment(null)
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.customer_phone.includes(searchTerm) ||
      appointment.service_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "no_show":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="space-y-4 p-4 md:p-8 pt-6" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ניהול תורים</h1>
            <p className="text-gray-600 mt-2">נהל את כל התורים שלך במקום אחד</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                תור חדש
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>הוספת תור חדש</DialogTitle>
                <DialogDescription>מלא את הפרטים להוספת תור חדש</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customer_name" className="text-right">
                    שם הלקוח
                  </Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="col-span-3"
                    placeholder="הכנס שם הלקוח"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customer_phone" className="text-right">
                    טלפון
                  </Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="col-span-3"
                    placeholder="050-1234567"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customer_email" className="text-right">
                    אימייל
                  </Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="col-span-3"
                    placeholder="example@email.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="service_name" className="text-right">
                    שירות
                  </Label>
                  <Input
                    id="service_name"
                    value={formData.service_name}
                    onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                    className="col-span-3"
                    placeholder="סוג השירות"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="appointment_date" className="text-right">
                    תאריך
                  </Label>
                  <Input
                    id="appointment_date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="appointment_time" className="text-right">
                    שעה
                  </Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    הערות
                  </Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="col-span-3"
                    placeholder="הערות נוספות"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddAppointment} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  הוסף תור
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">חיפוש</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="חפש לפי שם, טלפון או שירות..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="status-filter">סטטוס</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="scheduled">מתוזמן</SelectItem>
                    <SelectItem value="confirmed">מאושר</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                    <SelectItem value="no_show">לא הגיע</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              רשימת תורים ({filteredAppointments.length})
            </CardTitle>
            <CardDescription>נהל את כל התורים שלך, עדכן סטטוסים ופרטי לקוחות</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">אין תורים להצגה</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "לא נמצאו תורים התואמים לחיפוש שלך"
                    : "עדיין לא נקבעו תורים במערכת"}
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף תור ראשון
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">לקוח</TableHead>
                      <TableHead className="text-right">שירות</TableHead>
                      <TableHead className="text-right">תאריך ושעה</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                {appointment.customer_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{appointment.customer_name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {appointment.customer_phone}
                              </div>
                              {appointment.customer_email && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {appointment.customer_email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{appointment.service_name}</div>
                          {appointment.notes && <div className="text-sm text-gray-500">{appointment.notes}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{formatAppointmentDate(appointment.appointment_date)}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {appointment.appointment_time}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={appointment.status}
                            onValueChange={(value) => handleUpdateStatus(appointment.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(appointment.status)}
                                <Badge className={statusColors[appointment.status]}>
                                  {statusLabels[appointment.status]}
                                </Badge>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">מתוזמן</SelectItem>
                              <SelectItem value="confirmed">מאושר</SelectItem>
                              <SelectItem value="completed">הושלם</SelectItem>
                              <SelectItem value="cancelled">בוטל</SelectItem>
                              <SelectItem value="no_show">לא הגיע</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingAppointment(appointment)
                                setFormData({
                                  customer_name: appointment.customer_name,
                                  customer_phone: appointment.customer_phone,
                                  customer_email: appointment.customer_email || "",
                                  service_name: appointment.service_name,
                                  appointment_date: appointment.appointment_date,
                                  appointment_time: appointment.appointment_time,
                                  notes: appointment.notes || "",
                                })
                                setIsAddDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
