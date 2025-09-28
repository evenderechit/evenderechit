"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Settings, CreditCard, Phone, MapPin, Clock, Bell, Shield, Crown } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/header"

interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  business_address?: string
  business_description?: string
  timezone: string
  notification_preferences: {
    email: boolean
    whatsapp: boolean
    reminders: boolean
  }
  subscription_status: string
  subscription_expires_at?: string
  created_at: string
  last_login: string
}

interface SubscriptionInfo {
  status: string
  expires_at?: string
  member_since: string
  total_appointments: number
  monthly_appointments: number
  limits: {
    free: { appointments_per_month: number; features: string[] }
    premium: { appointments_per_month: number; features: string[] }
  }
}

interface UserActivity {
  id: string
  action: string
  details: any
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: "demo-user-1",
    email: "demo@example.com",
    name: "יוסי כהן",
    phone: "050-1234567",
    business_address: "רחוב הרצל 123, תל אביב",
    business_description: "מספרה מקצועית עם ניסיון של 15 שנה",
    timezone: "Asia/Jerusalem",
    notification_preferences: {
      email: true,
      whatsapp: true,
      reminders: true,
    },
    subscription_status: "premium",
    subscription_expires_at: "2024-12-31",
    created_at: "2023-01-15T10:00:00Z",
    last_login: "2024-01-15T14:30:00Z",
  })

  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: "premium",
    expires_at: "2024-12-31",
    member_since: "2023-01-15",
    total_appointments: 1247,
    monthly_appointments: 89,
    limits: {
      free: {
        appointments_per_month: 50,
        features: ["הזמנת תורים בסיסית", "קישור אישי"],
      },
      premium: {
        appointments_per_month: -1,
        features: ["תורים ללא הגבלה", "התראות WhatsApp", "תזכורות אוטומטיות", "אנליטיקס ודוחות", "מיתוג אישי"],
      },
    },
  })

  const [activities, setActivities] = useState<UserActivity[]>([
    {
      id: "1",
      action: "profile_updated",
      details: { field: "phone" },
      created_at: "2024-01-15T14:30:00Z",
    },
    {
      id: "2",
      action: "appointment_created",
      details: { client: "דני לוי", time: "16:00" },
      created_at: "2024-01-15T13:15:00Z",
    },
    {
      id: "3",
      action: "login",
      details: null,
      created_at: "2024-01-15T09:00:00Z",
    },
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // נתוני דמו כבר טעונים
  }, [])

  const handleSaveProfile = async () => {
    if (!profile) return

    setIsSaving(true)

    setTimeout(() => {
      toast.success("הפרופיל עודכן בהצלחה!")

      // הוספת פעילות חדשה
      const newActivity: UserActivity = {
        id: Date.now().toString(),
        action: "profile_updated",
        details: { timestamp: new Date().toISOString() },
        created_at: new Date().toISOString(),
      }
      setActivities([newActivity, ...activities])
      setIsSaving(false)
    }, 1000)
  }

  const getActionText = (action: string) => {
    const actions: { [key: string]: string } = {
      profile_updated: "עדכון פרופיל",
      subscription_updated: "עדכון מנוי",
      appointment_created: "יצירת תור",
      appointment_deleted: "מחיקת תור",
      login: "התחברות",
    }
    return actions[action] || action
  }

  if (isLoading) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gray-50 p-4">
        <Header />
        <div className="w-full max-w-4xl mt-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p>טוען פרטי חשבון...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gray-50 p-4">
        <Header />
        <div className="w-full max-w-4xl mt-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500">שגיאה בטעינת פרטי החשבון</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gray-50 p-4">
      <Header />
      <div className="w-full max-w-4xl mt-8 space-y-6">
        {/* כותרת עם פרטי משתמש */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-gray-600">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={profile.subscription_status === "premium" ? "default" : "secondary"}>
                      {profile.subscription_status === "premium" ? (
                        <div className="flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          פרימיום
                        </div>
                      ) : (
                        "חינם"
                      )}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      חבר מאז {new Date(profile.created_at).toLocaleDateString("he-IL")}
                    </span>
                  </div>
                </div>
              </div>
              {subscription && (
                <div className="text-left">
                  <div className="text-sm text-gray-500">תורים החודש</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {subscription.monthly_appointments}
                    {subscription.status === "free" && (
                      <span className="text-sm text-gray-500">/{subscription.limits.free.appointments_per_month}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* טאבים */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              פרופיל
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              הגדרות
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              מנוי
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              פעילות
            </TabsTrigger>
          </TabsList>

          {/* טאב פרופיל */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>פרטים אישיים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">שם מלא</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">אימייל</Label>
                    <Input id="email" value={profile.email} disabled className="bg-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      טלפון
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="050-1234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      אזור זמן
                    </Label>
                    <Input
                      id="timezone"
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    כתובת העסק
                  </Label>
                  <Input
                    id="address"
                    value={profile.business_address || ""}
                    onChange={(e) => setProfile({ ...profile, business_address: e.target.value })}
                    placeholder="רחוב, עיר"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">תיאור העסק</Label>
                  <Textarea
                    id="description"
                    value={profile.business_description || ""}
                    onChange={(e) => setProfile({ ...profile, business_description: e.target.value })}
                    placeholder="ספר על העסק שלך..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                  {isSaving ? "שומר..." : "שמור שינויים"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* טאב הגדרות */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  הגדרות התראות
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>התראות אימייל</Label>
                    <p className="text-sm text-gray-500">קבל התראות על תורים חדשים באימייל</p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.email}
                    onCheckedChange={(checked) =>
                      setProfile({
                        ...profile,
                        notification_preferences: {
                          ...profile.notification_preferences,
                          email: checked,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>התראות WhatsApp</Label>
                    <p className="text-sm text-gray-500">קבל התראות בוואטסאפ</p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.whatsapp}
                    onCheckedChange={(checked) =>
                      setProfile({
                        ...profile,
                        notification_preferences: {
                          ...profile.notification_preferences,
                          whatsapp: checked,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>תזכורות אוטומטיות</Label>
                    <p className="text-sm text-gray-500">שלח תזכורות ללקוחות לפני התור</p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences.reminders}
                    onCheckedChange={(checked) =>
                      setProfile({
                        ...profile,
                        notification_preferences: {
                          ...profile.notification_preferences,
                          reminders: checked,
                        },
                      })
                    }
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                  {isSaving ? "שומר..." : "שמור הגדרות"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  אבטחה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>שינוי סיסמה</Label>
                    <p className="text-sm text-gray-500">עדכן את הסיסמה שלך</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info("פיצ'ר זה יתווסף בקרוב")
                    }}
                  >
                    שנה סיסמה
                  </Button>
                </div>
                <Separator />
                <div>
                  <Label>התחברות אחרונה</Label>
                  <p className="text-sm text-gray-500">{new Date(profile.last_login).toLocaleString("he-IL")}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* טאב מנוי */}
          <TabsContent value="subscription" className="space-y-6">
            {subscription && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      מידע על המנוי
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{subscription.total_appointments}</div>
                        <div className="text-sm text-gray-500">סה"כ תורים</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{subscription.monthly_appointments}</div>
                        <div className="text-sm text-gray-500">תורים החודש</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {subscription.status === "premium"
                            ? "∞"
                            : subscription.limits.free.appointments_per_month - subscription.monthly_appointments}
                        </div>
                        <div className="text-sm text-gray-500">תורים נותרו</div>
                      </div>
                    </div>

                    {subscription.status === "free" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-800">מנוי חינם</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          אתה משתמש במנוי החינם. שדרג לפרימיום לתכונות מתקדמות!
                        </p>
                        <Button className="mt-3" onClick={() => toast.info("פיצ'ר זה יתווסף בקרוב")}>
                          שדרג לפרימיום
                        </Button>
                      </div>
                    )}

                    {subscription.status === "premium" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          מנוי פרימיום פעיל
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          {subscription.expires_at
                            ? `המנוי שלך פעיל עד ${new Date(subscription.expires_at).toLocaleDateString("he-IL")}`
                            : "המנוי שלך פעיל"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>תכונות זמינות</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">מנוי חינם</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• עד {subscription.limits.free.appointments_per_month} תורים בחודש</li>
                          <li>• הזמנת תורים בסיסית</li>
                          <li>• קישור אישי</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          מנוי פרימיום
                        </h4>
                        <ul className="space-y-1 text-sm">
                          <li>• תורים ללא הגבלה</li>
                          <li>• התראות WhatsApp</li>
                          <li>• תזכורות אוטומטיות</li>
                          <li>• אנליטיקס ודוחות</li>
                          <li>• מיתוג אישי</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* טאב פעילות */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  פעילות אחרונה
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">אין פעילות להצגה</p>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{getActionText(activity.action)}</p>
                            {activity.details && (
                              <p className="text-sm text-gray-500">
                                {activity.details.client && `לקוח: ${activity.details.client}`}
                                {activity.details.time && ` בשעה ${activity.details.time}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleString("he-IL")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
