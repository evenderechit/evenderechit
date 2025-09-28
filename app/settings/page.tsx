"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building, Clock, Bell, Users, Calendar, Save, Copy, ExternalLink } from "lucide-react"

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("העסק שלי")
  const [businessPhone, setBusinessPhone] = useState("03-1234567")
  const [businessEmail, setBusinessEmail] = useState("info@business.com")
  const [businessAddress, setBusinessAddress] = useState("רחוב הראשי 123, תל אביב")
  const [businessDescription, setBusinessDescription] = useState("עסק מוביל בתחום השירותים")

  const [workingHours, setWorkingHours] = useState({
    sunday: { enabled: true, start: "09:00", end: "17:00" },
    monday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    friday: { enabled: true, start: "09:00", end: "14:00" },
    saturday: { enabled: false, start: "09:00", end: "17:00" },
  })

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: true,
    whatsappReminders: false,
    newAppointments: true,
    cancellations: true,
  })

  const [bookingSettings, setBookingSettings] = useState({
    allowOnlineBooking: true,
    requireApproval: false,
    advanceBookingDays: 30,
    cancellationHours: 24,
  })

  const bookingLink = "https://smartqueues.app/book/my-business"

  const dayNames = {
    sunday: "ראשון",
    monday: "שני",
    tuesday: "שלישי",
    wednesday: "רביעי",
    thursday: "חמישי",
    friday: "שישי",
    saturday: "שבת",
  }

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving settings...")
  }

  const copyBookingLink = () => {
    navigator.clipboard.writeText(bookingLink)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">הגדרות</h2>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          שמור שינויים
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business">עסק</TabsTrigger>
          <TabsTrigger value="hours">שעות פעילות</TabsTrigger>
          <TabsTrigger value="booking">הזמנות</TabsTrigger>
          <TabsTrigger value="notifications">התראות</TabsTrigger>
          <TabsTrigger value="team">צוות</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                פרטי העסק
              </CardTitle>
              <CardDescription>עדכן את המידע הבסיסי של העסק שלך</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">שם העסק</Label>
                  <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">טלפון</Label>
                  <Input id="businessPhone" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">אימייל</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">כתובת</Label>
                <Input
                  id="businessAddress"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessDescription">תיאור העסק</Label>
                <Textarea
                  id="businessDescription"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                שעות פעילות
              </CardTitle>
              <CardDescription>הגדר את שעות הפעילות של העסק לכל יום בשבוע</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(workingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <Switch
                      checked={hours.enabled}
                      onCheckedChange={(checked) =>
                        setWorkingHours((prev) => ({
                          ...prev,
                          [day]: { ...prev[day], enabled: checked },
                        }))
                      }
                    />
                    <span className="font-medium w-16">{dayNames[day]}</span>
                  </div>
                  {hours.enabled && (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Input
                        type="time"
                        value={hours.start}
                        onChange={(e) =>
                          setWorkingHours((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], start: e.target.value },
                          }))
                        }
                        className="w-24"
                      />
                      <span>עד</span>
                      <Input
                        type="time"
                        value={hours.end}
                        onChange={(e) =>
                          setWorkingHours((prev) => ({
                            ...prev,
                            [day]: { ...prev[day], end: e.target.value },
                          }))
                        }
                        className="w-24"
                      />
                    </div>
                  )}
                  {!hours.enabled && <Badge variant="secondary">סגור</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                הגדרות הזמנות
              </CardTitle>
              <CardDescription>נהל את אופן קבלת ההזמנות באתר שלך</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>אפשר הזמנות אונליין</Label>
                  <p className="text-sm text-muted-foreground">לקוחות יוכלו לקבוע תורים דרך האתר</p>
                </div>
                <Switch
                  checked={bookingSettings.allowOnlineBooking}
                  onCheckedChange={(checked) =>
                    setBookingSettings((prev) => ({ ...prev, allowOnlineBooking: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>דרוש אישור לתורים</Label>
                  <p className="text-sm text-muted-foreground">תורים יחכו לאישור שלך לפני אישור סופי</p>
                </div>
                <Switch
                  checked={bookingSettings.requireApproval}
                  onCheckedChange={(checked) => setBookingSettings((prev) => ({ ...prev, requireApproval: checked }))}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advanceBooking">ימים מראש להזמנה</Label>
                  <Input
                    id="advanceBooking"
                    type="number"
                    value={bookingSettings.advanceBookingDays}
                    onChange={(e) =>
                      setBookingSettings((prev) => ({
                        ...prev,
                        advanceBookingDays: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancellationHours">שעות לביטול</Label>
                  <Input
                    id="cancellationHours"
                    type="number"
                    value={bookingSettings.cancellationHours}
                    onChange={(e) =>
                      setBookingSettings((prev) => ({
                        ...prev,
                        cancellationHours: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>קישור להזמנות</Label>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Input value={bookingLink} readOnly className="flex-1" />
                  <Button variant="outline" size="sm" onClick={copyBookingLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">שתף קישור זה עם לקוחות כדי שיוכלו לקבוע תורים</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                הגדרות התראות
              </CardTitle>
              <CardDescription>בחר איך תרצה לקבל התראות על פעילות במערכת</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">תזכורות ללקוחות</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>תזכורות באימייל</Label>
                    <p className="text-sm text-muted-foreground">שלח תזכורות ללקוחות באימייל</p>
                  </div>
                  <Switch
                    checked={notifications.emailReminders}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailReminders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>תזכורות ב-SMS</Label>
                    <p className="text-sm text-muted-foreground">שלח תזכורות ללקוחות בהודעות טקסט</p>
                  </div>
                  <Switch
                    checked={notifications.smsReminders}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, smsReminders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>תזכורות בוואטסאפ</Label>
                    <p className="text-sm text-muted-foreground">שלח תזכורות ללקוחות בוואטסאפ</p>
                  </div>
                  <Switch
                    checked={notifications.whatsappReminders}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, whatsappReminders: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">התראות אישיות</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>תורים חדשים</Label>
                    <p className="text-sm text-muted-foreground">קבל התראה על תורים חדשים שנקבעו</p>
                  </div>
                  <Switch
                    checked={notifications.newAppointments}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, newAppointments: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>ביטולים</Label>
                    <p className="text-sm text-muted-foreground">קבל התראה על תורים שבוטלו</p>
                  </div>
                  <Switch
                    checked={notifications.cancellations}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, cancellations: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                ניהול צוות
              </CardTitle>
              <CardDescription>נהל את חברי הצוות והרשאות שלהם</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">ניהול צוות</h3>
                <p className="text-muted-foreground mb-4">תכונה זו תהיה זמינה בקרוב</p>
                <Button variant="outline">הוסף חבר צוות</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
