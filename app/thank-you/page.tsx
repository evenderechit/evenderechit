"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Share2,
  Download,
  Settings,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { he } from "date-fns/locale"
import { toast } from "sonner"
import { Header } from "@/components/header"

interface AppointmentData {
  id: string
  customer_name: string
  customer_phone?: string
  date: string
  time: string
  service_description?: string
  duration_minutes: number
  Users: {
    name: string
    email: string
    business_address?: string
    Settings: {
      business_name: string
      link_slug: string
    }
  }
  Services?: {
    name: string
    price?: number
    color: string
  }
  Staff_members?: {
    name: string
  }
}

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("appointmentId")
  const [appointment, setAppointment] = useState<AppointmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails()
    } else {
      setError("לא נמצא מזהה תור")
      setIsLoading(false)
    }
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    try {
      const response = await fetch(`/api/appointments/get-by-id?appointmentId=${appointmentId}`)
      if (!response.ok) {
        throw new Error("שגיאה בטעינת פרטי התור")
      }
      const data = await response.json()
      setAppointment(data.appointment)
    } catch (err: any) {
      console.error("Error fetching appointment:", err)
      setError(err.message || "שגיאה בטעינת פרטי התור")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
    }).format(amount)
  }

  const getDayName = (dateString: string) => {
    const date = parseISO(dateString)
    return format(date, "EEEE", { locale: he })
  }

  const addToGoogleCalendar = () => {
    if (!appointment) return

    const startDate = new Date(`${appointment.date}T${appointment.time}`)
    const endDate = new Date(startDate.getTime() + appointment.duration_minutes * 60000)

    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const details = [
      `שירות: ${appointment.service_description || appointment.Services?.name || "לא צוין"}`,
      appointment.Staff_members?.name && `עם: ${appointment.Staff_members.name}`,
      appointment.Users.business_address && `כתובת: ${appointment.Users.business_address}`,
      appointment.Users.email && `אימייל: ${appointment.Users.email}`,
    ]
      .filter(Boolean)
      .join("\\n")

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `תור ב${appointment.Users.Settings.business_name}`,
    )}&dates=${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}&details=${encodeURIComponent(
      details,
    )}&location=${encodeURIComponent(appointment.Users.business_address || "")}`

    window.open(googleCalendarUrl, "_blank")
  }

  const shareAppointment = async () => {
    if (!appointment) return

    const shareData = {
      title: `תור ב${appointment.Users.Settings.business_name}`,
      text: `התור שלי ב${appointment.Users.Settings.business_name} ב-${getDayName(appointment.date)} ${format(
        parseISO(appointment.date),
        "dd/MM/yyyy",
        { locale: he },
      )} בשעה ${appointment.time}`,
      url: `${window.location.origin}/book/${appointment.Users.Settings.link_slug}?appointmentId=${appointment.id}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url)
      toast.success("קישור הועתק ללוח!")
    }
  }

  const downloadAppointmentDetails = () => {
    if (!appointment) return

    const details = [
      `פרטי התור - ${appointment.Users.Settings.business_name}`,
      "=".repeat(50),
      `שם: ${appointment.customer_name}`,
      appointment.customer_phone && `טלפון: ${appointment.customer_phone}`,
      `תאריך: ${getDayName(appointment.date)} ${format(parseISO(appointment.date), "dd/MM/yyyy", { locale: he })}`,
      `שעה: ${appointment.time}`,
      `משך: ${appointment.duration_minutes} דקות`,
      appointment.service_description && `שירות: ${appointment.service_description}`,
      appointment.Services?.name && `שירות: ${appointment.Services.name}`,
      appointment.Services?.price && `מחיר: ${formatCurrency(appointment.Services.price)}`,
      appointment.Staff_members?.name && `איש צוות: ${appointment.Staff_members.name}`,
      "",
      "פרטי העסק:",
      `שם: ${appointment.Users.Settings.business_name}`,
      `איש קשר: ${appointment.Users.name}`,
      appointment.Users.email && `אימייל: ${appointment.Users.email}`,
      appointment.Users.business_address && `כתובת: ${appointment.Users.business_address}`,
      "",
      `קישור לניהול התור: ${window.location.origin}/book/${appointment.Users.Settings.link_slug}?appointmentId=${appointment.id}`,
    ]
      .filter(Boolean)
      .join("\n")

    const blob = new Blob([details], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `תור-${appointment.Users.Settings.business_name}-${appointment.date}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Header />
        <Card className="w-full max-w-2xl mt-8">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>טוען פרטי התור...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Header />
        <Card className="w-full max-w-2xl mt-8">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error || "לא נמצאו פרטי התור"}</p>
            <Button asChild>
              <Link href="/">חזור לדף הבית</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Header />
      <div className="w-full max-w-2xl mt-8 space-y-6">
        {/* Success Header */}
        <Card className="text-center bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">התור נקבע בהצלחה! 🎉</h1>
            <p className="text-green-100">תודה רבה, התור שלך אושר ונשמר במערכת</p>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              פרטי התור
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-semibold">{getDayName(appointment.date)}</p>
                    <p className="text-sm text-gray-600">
                      {format(parseISO(appointment.date), "dd/MM/yyyy", { locale: he })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-semibold">{appointment.time}</p>
                    <p className="text-sm text-gray-600">{appointment.duration_minutes} דקות</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg">{appointment.customer_name}</p>
                  {appointment.customer_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {appointment.customer_phone}
                    </div>
                  )}
                </div>
                {(appointment.service_description || appointment.Services?.name) && (
                  <div>
                    <p className="text-sm text-gray-500">שירות:</p>
                    <div className="flex items-center gap-2">
                      {appointment.Services?.color && (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: appointment.Services.color }} />
                      )}
                      <p className="font-medium">{appointment.service_description || appointment.Services?.name}</p>
                      {appointment.Services?.price && (
                        <Badge variant="secondary">{formatCurrency(appointment.Services.price)}</Badge>
                      )}
                    </div>
                  </div>
                )}
                {appointment.Staff_members?.name && (
                  <div>
                    <p className="text-sm text-gray-500">איש צוות:</p>
                    <p className="font-medium">{appointment.Staff_members.name}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              פרטי העסק
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold text-lg">{appointment.Users.Settings.business_name}</p>
              <p className="text-gray-600">{appointment.Users.name}</p>
            </div>
            {appointment.Users.business_address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <p className="text-gray-600">{appointment.Users.business_address}</p>
              </div>
            )}
            {appointment.Users.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <p className="text-gray-600">{appointment.Users.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>פעולות שימושיות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={addToGoogleCalendar} variant="outline" className="w-full bg-transparent">
                <Calendar className="ml-2 h-4 w-4" />
                הוסף ליומן Google
              </Button>
              <Button onClick={shareAppointment} variant="outline" className="w-full bg-transparent">
                <Share2 className="ml-2 h-4 w-4" />
                שתף
              </Button>
              <Button onClick={downloadAppointmentDetails} variant="outline" className="w-full bg-transparent">
                <Download className="ml-2 h-4 w-4" />
                הורד פרטים
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link
                  href={`/book/${appointment.Users.Settings.link_slug}?appointmentId=${appointment.id}`}
                  target="_blank"
                >
                  <Settings className="ml-2 h-4 w-4" />
                  נהל תור
                  <ExternalLink className="mr-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">הערות חשובות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-800">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-1 flex-shrink-0" />
              <p className="text-sm">
                <strong>הגעה:</strong> מומלץ להגיע 5-10 דקות לפני השעה הקבועה
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
              <p className="text-sm">
                <strong>תזכורות:</strong> תקבל הודעת תזכורת בוואטסאפ לפני התור (אם סופק מספר טלפון)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 mt-1 flex-shrink-0" />
              <p className="text-sm">
                <strong>שינויים:</strong> ניתן לבטל או לדחות את התור דרך קישור "נהל תור" למעלה
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-1 flex-shrink-0" />
              <p className="text-sm">
                <strong>שאלות:</strong> לשאלות ניתן לפנות ישירות לעסק בפרטי הקשר למעלה
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/">חזור לדף הבית</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
