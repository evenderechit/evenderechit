"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, CalendarIcon, Users } from "lucide-react" // Import Users icon
import { format, addDays, startOfDay } from "date-fns"
import { he } from "date-fns/locale"

interface Service {
  id: string
  name: string
  description?: string
  duration_minutes: number
  price?: number
  color: string
  assigned_staff_ids?: string[] // New: for assigning staff to services
}

interface StaffMember {
  id: string
  name: string
  is_active: boolean // Assuming this property exists to filter active staff
}

interface CalendarBookingProps {
  userId: string
  businessName: string
  onBookingSelect: (date: Date, time: string, serviceId?: string, staffMemberId?: string) => void // Updated callback
  initialSelectedServiceId?: string
  initialSelectedStaffId?: string
}

export default function CalendarBooking({
  userId,
  businessName,
  onBookingSelect,
  initialSelectedServiceId,
  initialSelectedStaffId,
}: CalendarBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedService, setSelectedService] = useState<string>(initialSelectedServiceId || "defaultServiceId")
  const [selectedStaff, setSelectedStaff] = useState<string>(initialSelectedStaffId || "") // New state for selected staff
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]) // New state for staff members
  const [isLoading, setIsLoading] = useState(false)

  // Load services and staff members on component mount
  useEffect(() => {
    fetchServices()
    fetchStaffMembers()
  }, [userId])

  // Load available slots when date, service, or staff changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots()
    } else {
      setAvailableSlots([]) // Clear slots if service or date is not selected
    }
  }, [selectedDate, selectedService, selectedStaff])

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/services?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch(`/api/staff?userId=${userId}`) // Assuming staff API can filter by userId
      if (response.ok) {
        const data = await response.json()
        setStaffMembers(data.staffMembers || [])
      }
    } catch (error) {
      console.error("Error fetching staff members:", error)
    }
  }

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !selectedService) return

    setIsLoading(true)
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      let url = `/api/available-slots?userId=${userId}&date=${dateString}&serviceId=${selectedService}`

      if (selectedStaff) {
        url += `&staffMemberId=${selectedStaff}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.slots || [])
      }
    } catch (error) {
      console.error("Error fetching available slots:", error)
      setAvailableSlots([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      onBookingSelect(selectedDate, time, selectedService || undefined, selectedStaff || undefined)
    }
  }

  const getSelectedService = () => {
    return services.find((s) => s.id === selectedService)
  }

  const getStaffMembersForSelectedService = () => {
    const service = getSelectedService()
    if (!service || !service.assigned_staff_ids || service.assigned_staff_ids.length === 0) {
      // If no specific staff assigned to service, or no staff assigned at all, show all active staff
      return staffMembers.filter((staff) => staff.is_active)
    }

    // Filter staff members who are assigned to this service and are active
    return staffMembers.filter((staff) => service.assigned_staff_ids?.includes(staff.id) && staff.is_active)
  }

  // Prevent selecting past dates
  const disabledDays = {
    before: startOfDay(new Date()),
    after: addDays(new Date(), 30), // 30 days limit
  }

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              בחר סוג שירות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="בחר שירות..." />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{service.name}</span>
                      <div className="flex items-center gap-2 mr-2">
                        <Badge variant="outline">{service.duration_minutes} דק'</Badge>
                        {service.price && <Badge variant="secondary">₪{service.price}</Badge>}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getSelectedService() && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{getSelectedService()?.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge style={{ backgroundColor: getSelectedService()?.color }}>
                    {getSelectedService()?.duration_minutes} דקות
                  </Badge>
                  {getSelectedService()?.price && <Badge variant="outline">₪{getSelectedService()?.price}</Badge>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Staff Selection (only if a service is selected and there are staff members) */}
      {selectedService && getStaffMembersForSelectedService().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              בחר איש צוות (אופציונלי)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="בחר איש צוות..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allStaff">כל איש צוות זמין</SelectItem> {/* Option for any available staff */}
                {getStaffMembersForSelectedService().map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            בחר תאריך
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledDays}
            locale={he}
            className="rounded-md border"
            dir="rtl"
          />
        </CardContent>
      </Card>

      {/* Time Selection */}
      {selectedDate && selectedService && (
        <Card>
          <CardHeader>
            <CardTitle>זמנים זמינים ל-{format(selectedDate, "dd/MM/yyyy", { locale: he })}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <p>טוען זמנים זמינים...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">אין זמנים זמינים לתאריך זה</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {availableSlots.map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    onClick={() => handleTimeSelect(time)}
                    className="h-12 text-sm hover:bg-tornet-blue hover:text-white"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
