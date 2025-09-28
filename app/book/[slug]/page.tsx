"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format, parseISO, isBefore, addHours } from "date-fns"
import { CalendarIcon, Phone, Loader2, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/header"
import CalendarBooking from "@/components/calendar-booking" // ייבוא קומפוננטת בחירת תאריך/שעה/שירות
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { he } from "date-fns/locale"

interface BookingPageProps {
  params: {
    slug: string
  }
  searchParams?: {
    appointmentId?: string
  }
}

interface AppointmentDetails {
  id: string
  customer_name: string
  customer_phone?: string
  date: string
  time: string
  service_description?: string
  status: string
  service_id?: string
  duration_minutes?: number
  staff_member_id?: string // New: staff_member_id
  Users: {
    id: string
    name: string
    email: string
    business_address?: string
    Settings: {
      business_name: string
      link_slug: string
    }
    Business_settings: {
      allow_cancellation: boolean
      cancellation_hours: number
      allow_rescheduling: boolean
      reschedule_hours: number
    }
  }
  Services?: {
    id: string
    name: string
    duration_minutes: number
    price?: number
    color: string
  }
  Staff_members?: {
    // New: Staff member details
    name: string
  }
}

export default function BookingPage({ params, searchParams }: BookingPageProps) {
  const { slug } = params
  const appointmentId = searchParams?.appointmentId

  const [businessName, setBusinessName] = useState("טוען שם עסק...")
  const [businessUserId, setBusinessUserId] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [serviceDescription, setServiceDescription] = useState("")
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined)
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>(undefined) // New: selected staff ID

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAppointment, setCurrentAppointment] = useState<AppointmentDetails | null>(null)
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        if (appointmentId) {
          // Fetch specific appointment details
          const response = await fetch(`/api/appointments/get-by-id?appointmentId=${appointmentId}`)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to load appointment details.")
          }
          const data = await response.json()
          if (data.appointment) {
            setCurrentAppointment(data.appointment)
            setBusinessName(data.appointment.Users.Settings.business_name)
            setBusinessUserId(data.appointment.Users.id)
            setCustomerName(data.appointment.customer_name)
            setCustomerPhone(data.appointment.customer_phone || "")
            setSelectedDate(parseISO(data.appointment.date))
            setSelectedTime(data.appointment.time)
            setServiceDescription(data.appointment.service_description || data.appointment.Services?.name || "")
            setSelectedServiceId(data.appointment.service_id || undefined)
            setSelectedStaffId(data.appointment.staff_member_id || undefined) // Set initial staff ID
          } else {
            setError("התור לא נמצא. וודא שהקישור נכון.")
          }
        } else if (slug) {
          // Fetch business details for new booking
          const response = await fetch(`/api/settings/get-by-slug?slug=${slug}`)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to load business details.")
          }
          const data = await response.json()
          if (data.settings) {
            setBusinessName(data.settings.business_name)
            setBusinessUserId(data.settings.user_id)
          } else {
            setError("העסק לא נמצא. וודא שהקישור נכון.")
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "שגיאה בטעינת פרטי העסק/תור.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [slug, appointmentId])

  const handleNewBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!businessUserId) {
      setError("שגיאה: לא ניתן לשייך את התור לעסק. נסה לרענן את העמוד.")
      setIsLoading(false)
      return
    }

    if (!customerName || !selectedDate || !selectedTime || (!serviceDescription && !selectedServiceId)) {
      setError("אנא מלא את כל השדות הנדרשים.")
      setIsLoading(false)
      return
    }

    const service = currentAppointment?.Services || null // If rescheduling, use the service from the current appointment
    const finalServiceId = selectedServiceId || service?.id || null
    const finalServiceDescription = serviceDescription || service?.name || null
    const finalDurationMinutes = service?.duration_minutes || 60 // Default to 60 if no service or duration

    try {
      const response = await fetch("/api/appointments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: businessUserId,
          customer_name: customerName,
          customer_phone: customerPhone,
          date: format(selectedDate, "yyyy-MM-dd"),
          time: selectedTime,
          service_id: finalServiceId,
          service_description: finalServiceDescription,
          duration_minutes: finalDurationMinutes,
          rescheduled_from: isRescheduling && currentAppointment ? currentAppointment.id : null, // Link to old appointment if rescheduling
          staff_member_id: selectedStaffId || null, // Pass selected staff ID
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "שגיאה בקביעת התור. נסה שוב.")
      }

      const data = await response.json()

      // If rescheduling, update the old appointment's status and link
      if (isRescheduling && currentAppointment) {
        await fetch("/api/appointments/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: currentAppointment.id,
            status: "rescheduled",
            rescheduled_to: data.appointment.id, // Link old appointment to new one
          }),
        })
      }

      // Redirect to thank you page instead of showing inline success
      window.location.href = `/thank-you?appointmentId=${data.appointment.id}`

      setIsRescheduling(false) // Reset rescheduling state

      if (data.whatsappSent) {
        toast.success("התור נקבע בהצלחה! הודעת אישור נשלחה אליך בוואטסאפ 📱")
      } else {
        toast.success("התור נקבע בהצלחה!")
      }
    } catch (err: any) {
      console.error("Error submitting appointment:", err)
      setError(err.message || "שגיאה בלתי צפויה בקביעת התור.")
      toast.error("שגיאה בקביעת התור.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelAppointment = async () => {
    if (!currentAppointment) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/appointments/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentAppointment.id,
          status: "canceled",
          cancellation_reason: "Cancelled by client via public link",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "שגיאה בביטול התור. נסה שוב.")
      }

      setCurrentAppointment({ ...currentAppointment, status: "canceled" })
      toast.success("התור בוטל בהצלחה.")
    } catch (err: any) {
      console.error("Error canceling appointment:", err)
      setError(err.message || "שגיאה בלתי צפויה בביטול התור.")
      toast.error("שגיאה בביטול התור.")
    } finally {
      setIsLoading(false)
      setIsCancelConfirmOpen(false)
    }
  }

  const handleBookingSelectFromCalendar = (date: Date, time: string, serviceId?: string, staffMemberId?: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setSelectedServiceId(serviceId)
    setSelectedStaffId(staffMemberId) // Update selected staff ID
    // If rescheduling, pre-fill service description from selected service
    if (isRescheduling && serviceId) {
      // This would require fetching service details or passing them down
      // For now, we'll rely on the service_id to be passed to the add API
    }
  }

  const isCancellationAllowed = () => {
    if (!currentAppointment || !currentAppointment.Users.Business_settings.allow_cancellation) return false
    const appointmentDateTime = parseISO(`${currentAppointment.date}T${currentAppointment.time}`)
    const minCancellationTime = addHours(new Date(), currentAppointment.Users.Business_settings.cancellation_hours)
    return isBefore(minCancellationTime, appointmentDateTime)
  }

  const isReschedulingAllowed = () => {
    if (!currentAppointment || !currentAppointment.Users.Business_settings.allow_rescheduling) return false
    const appointmentDateTime = parseISO(`${currentAppointment.date}T${currentAppointment.time}`)
    const minRescheduleTime = addHours(new Date(), currentAppointment.Users.Business_settings.reschedule_hours)
    return isBefore(minRescheduleTime, appointmentDateTime)
  }

  if (isLoading) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gray-50 p-4 text-right">
        <Header />
        <Card className="w-full max-w-md mt-8 text-center">
          <CardHeader>
            <CardTitle>טוען פרטים...</CardTitle>
          </CardHeader>
          <CardContent>
            <Loader2 className="h-8 w-8 animate-spin text-tornet-blue mx-auto" />
            <p className="mt-2">אנא המתן...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gray-50 p-4 text-right">
        <Header />
        <Card className="w-full max-w-md mt-8 text-center">
          <CardHeader>
            <CardTitle>שגיאה</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/">חזור לדף הבית</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!businessUserId) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gray-50 p-4 text-right">
        <Header />
        <Card className="w-full max-w-md mt-8 text-center">
          <CardHeader>
            <CardTitle>טוען פרטי עסק...</CardTitle>
          </CardHeader>
          <CardContent>
            <Loader2 className="h-8 w-8 animate-spin text-tornet-blue mx-auto" />
            <p className="mt-2">אנא המתן...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Display for existing appointment management
  if (appointmentId && currentAppointment) {
    const appointmentDateTime = parseISO(`${currentAppointment.date}T${currentAppointment.time}`)
    const isPastAppointment = isBefore(appointmentDateTime, new Date())

    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gray-50 p-4 text-right">
        <Header />
        <Card className="w-full max-w-md mt-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{isRescheduling ? "דחיית תור" : `ניהול תור ל${businessName}`}</CardTitle>
            <CardDescription>
              {isRescheduling ? "בחר תאריך ושעה חדשים לתור שלך." : "צפה ונהל את התור הקיים שלך."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {currentAppointment.status === "canceled" ? (
              <div className="text-center text-red-600 font-semibold text-lg flex flex-col items-center">
                <XCircle className="h-12 w-12 mb-2" />
                התור בוטל
                <p className="text-sm text-gray-500 mt-1">
                  {currentAppointment.cancellation_reason || "התור בוטל על ידך או על ידי העסק."}
                </p>
              </div>
            ) : currentAppointment.status === "rescheduled" && currentAppointment.rescheduled_to ? (
              <div className="text-center text-yellow-600 font-semibold text-lg flex flex-col items-center">
                <Clock className="h-12 w-12 mb-2" />
                התור נדחה
                <p className="text-sm text-gray-500 mt-1">
                  תור זה נדחה לתור חדש.
                  <Link
                    href={`/book/${slug}?appointmentId=${currentAppointment.rescheduled_to}`}
                    className="underline mr-1"
                  >
                    צפה בתור החדש
                  </Link>
                </p>
              </div>
            ) : isPastAppointment ? (
              <div className="text-center text-gray-600 font-semibold text-lg flex flex-col items-center">
                <CheckCircle className="h-12 w-12 mb-2" />
                תור שהתקיים
                <p className="text-sm text-gray-500 mt-1">תור זה כבר עבר.</p>
              </div>
            ) : isRescheduling ? (
              <>
                <p className="text-center text-gray-700">
                  התור הנוכחי:{" "}
                  <span className="font-semibold">
                    {format(parseISO(currentAppointment.date), "dd/MM/yyyy", { locale: he })} בשעה{" "}
                    {currentAppointment.time}
                  </span>
                  {currentAppointment.service_description && ` - ${currentAppointment.service_description}`}
                  {currentAppointment.Staff_members?.name && ` (עם ${currentAppointment.Staff_members.name})`}
                </p>
                <CalendarBooking
                  userId={businessUserId}
                  businessName={businessName}
                  onBookingSelect={handleBookingSelectFromCalendar}
                  initialSelectedServiceId={currentAppointment.service_id}
                  initialSelectedStaffId={currentAppointment.staff_member_id}
                />
                <Button onClick={handleNewBookingSubmit} disabled={isLoading || !selectedDate || !selectedTime}>
                  {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? "דוחה תור..." : "אשר דחייה"}
                </Button>
                <Button variant="outline" onClick={() => setIsRescheduling(false)} disabled={isLoading}>
                  בטל דחייה
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{currentAppointment.customer_name}</p>
                  {currentAppointment.customer_phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {currentAppointment.customer_phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(parseISO(currentAppointment.date), "dd/MM/yyyy", { locale: he })} בשעה{" "}
                    {currentAppointment.time}
                  </p>
                  {currentAppointment.service_description && (
                    <p className="text-sm text-gray-600">שירות: {currentAppointment.service_description}</p>
                  )}
                  {currentAppointment.Services?.name && (
                    <p className="text-sm text-gray-600">שירות: {currentAppointment.Services.name}</p>
                  )}
                  {currentAppointment.Staff_members?.name && (
                    <p className="text-sm text-gray-600">עם: {currentAppointment.Staff_members.name}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => setIsRescheduling(true)}
                    disabled={isLoading || !isReschedulingAllowed()}
                    className="w-full"
                  >
                    דחה תור
                  </Button>
                  {!isReschedulingAllowed() && (
                    <p className="text-xs text-red-500 text-center">
                      לא ניתן לדחות תור פחות מ-{currentAppointment.Users.Business_settings.reschedule_hours} שעות מראש.
                    </p>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => setIsCancelConfirmOpen(true)}
                    disabled={isLoading || !isCancellationAllowed()}
                    className="w-full"
                  >
                    בטל תור
                  </Button>
                  {!isCancellationAllowed() && (
                    <p className="text-xs text-red-500 text-center">
                      לא ניתן לבטל תור פחות מ-{currentAppointment.Users.Business_settings.cancellation_hours} שעות מראש.
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Alert Dialog for Cancel Confirmation */}
        <AlertDialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח שברצונך לבטל את התור?</AlertDialogTitle>
              <AlertDialogDescription>פעולה זו בלתי הפיכה. התור יבוטל ולא תוכל לשחזר אותו.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>בטל</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelAppointment} disabled={isLoading}>
                {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "מבטל..." : "אשר ביטול"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // Display for new booking
  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gray-50 p-4 text-right">
      <Header />
      <Card className="w-full max-w-md mt-8">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">קביעת תור ל{businessName}</CardTitle>
          <CardDescription>אנא מלא את הפרטים לקביעת התור שלך.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleNewBookingSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="customerName">שם מלא</Label>
              <Input
                id="customerName"
                type="text"
                placeholder="שם פרטי ומשפחה"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                מספר טלפון
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="054-1234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="appointmentDate">תאריך התור</Label>
              <Input
                id="appointmentDate"
                type="date"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="appointmentTime">שעה התור</Label>
              <Input
                id="appointmentTime"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceDescription">תיאור השירות</Label>
              <Input
                id="serviceDescription"
                type="text"
                placeholder="תיאור השירות או שם השירות"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="staffMember">שם המوظף</Label>
              <Input
                id="staffMember"
                type="text"
                placeholder="שם המوظף או ריק אם לא ידוע"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "קביעת תור..." : "קביעת תור"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
