"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">שגיאה באימות</h2>
          <p className="mt-2 text-sm text-gray-600">אירעה שגיאה בתהליך ההתחברות</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>שגיאה באימות</CardTitle>
            <CardDescription>לא הצלחנו לאמת את זהותך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>אירעה שגיאה בתהליך האימות. ייתכן שהקישור פג תוקף או שהוא לא תקין.</AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">אפשרויות לפתרון הבעיה:</p>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>נסה להתחבר שוב</li>
                <li>בדוק שהקישור באימייל עדיין תקף</li>
                <li>נסה לבקש קישור חדש</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Button asChild>
                <Link href="/auth">
                  <ArrowRight className="ml-2 h-4 w-4" />
                  חזור לעמוד ההתחברות
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/auth/reset-password">
                  <RefreshCw className="ml-2 h-4 w-4" />
                  בקש קישור חדש
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
