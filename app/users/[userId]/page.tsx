"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Clock, Shield, Activity, ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface UserDetails {
  id: string
  user_id: string
  status: string
  invited_at: string
  joined_at: string
  last_login: string
  notes: string
  user: {
    id: string
    email: string
    user_metadata: {
      full_name?: string
      avatar_url?: string
    }
    created_at: string
    last_sign_in_at: string
  }
  role: {
    id: string
    name: string
    display_name: string
    description: string
    permissions: any
  }
  invited_by_user?: {
    email: string
    user_metadata: {
      full_name?: string
    }
  }
}

interface UserActivity {
  id: string
  action: string
  resource_type: string
  resource_id: string
  details: any
  created_at: string
}

export default function UserDetailsPage() {
  const params = useParams()
  const userId = params.userId as string

  const [user, setUser] = useState<UserDetails | null>(null)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      loadUserDetails()
    }
  }, [userId])

  const loadUserDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/users/${userId}`)

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setActivities(data.activities)
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (err) {
      console.error("Error loading user details:", err)
      setError("שגיאה בטעינת פרטי המשתמש")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">פעיל</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">ממתין</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">מושעה</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">לא פעיל</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "suspended":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const formatActionName = (action: string) => {
    const actionMap: Record<string, string> = {
      login: "התחברות",
      logout: "התנתקות",
      create_appointment: "יצירת תור",
      update_appointment: "עדכון תור",
      delete_appointment: "מחיקת תור",
      create_service: "יצירת שירות",
      update_service: "עדכון שירות",
      delete_service: "מחיקת שירות",
      invite_user: "הזמנת משתמש",
      update_user: "עדכון משתמש",
      remove_user: "הסרת משתמש",
    }
    return actionMap[action] || action
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען פרטי משתמש...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "משתמש לא נמצא"}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/users">
                <ArrowLeft className="h-4 w-4 ml-2" />
                חזור לרשימת המשתמשים
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button asChild variant="outline">
                <Link href="/users">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  חזור
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">פרטי משתמש</h1>
                <p className="text-gray-600 mt-1">צפה בפרטים מלאים על המשתמש</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 ml-2" />
                  פרופיל משתמש
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={user.user.user_metadata?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {user.user.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
                        user.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">{user.user.user_metadata?.full_name || user.user.email}</h3>
                  <p className="text-gray-600">{user.user.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">סטטוס:</span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getStatusIcon(user.status)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">תפקיד:</span>
                    <Badge variant="outline">{user.role.display_name}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">הצטרף ב:</span>
                    <span className="text-sm">
                      {user.joined_at ? new Date(user.joined_at).toLocaleDateString("he-IL") : "טרם הצטרף"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">התחברות אחרונה:</span>
                    <span className="text-sm">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString("he-IL") : "מעולם לא התחבר"}
                    </span>
                  </div>

                  {user.invited_by_user && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">הוזמן על ידי:</span>
                      <span className="text-sm">
                        {user.invited_by_user.user_metadata?.full_name || user.invited_by_user.email}
                      </span>
                    </div>
                  )}
                </div>

                {user.notes && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">הערות:</h4>
                    <p className="text-sm text-gray-600">{user.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role Permissions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 ml-2" />
                  הרשאות תפקיד
                </CardTitle>
                <CardDescription>{user.role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(user.role.permissions).map(([resource, permissions]) => (
                    <div key={resource} className="border rounded-lg p-3">
                      <h5 className="font-medium mb-2 capitalize">{resource}</h5>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(permissions as Record<string, boolean>).map(([action, allowed]) => (
                          <Badge
                            key={action}
                            variant={allowed ? "default" : "secondary"}
                            className={`text-xs ${
                              allowed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 ml-2" />
                  פעילות אחרונה
                </CardTitle>
                <CardDescription>רשימת הפעולות האחרונות שביצע המשתמש</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-4 space-x-reverse p-4 border rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{formatActionName(activity.action)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleString("he-IL")}
                            </p>
                          </div>
                          {activity.resource_type && (
                            <p className="text-xs text-gray-600 mt-1">
                              {activity.resource_type}: {activity.resource_id}
                            </p>
                          )}
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              <pre className="whitespace-pre-wrap">{JSON.stringify(activity.details, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">אין פעילות להצגה</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
