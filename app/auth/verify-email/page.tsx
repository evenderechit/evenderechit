"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true)

  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const supabase = createClient()

  useEffect(() => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsSupabaseConfigured(false)
    }

    // Check for cooldown in localStorage
    const lastResend = localStorage.getItem("lastEmailResend")
    if (lastResend) {
      const timeDiff = Date.now() - Number.parseInt(lastResend)
      const remainingCooldown = Math.max(0, 60000 - timeDiff) // 1 minute cooldown
      if (remainingCooldown > 0) {
        setCooldown(Math.ceil(remainingCooldown / 1000))
      }
    }
  }, [])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResendEmail = async () => {
    if (!email || cooldown > 0) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (!isSupabaseConfigured) {
        setMessage("אימייל אימות נשלח בהצלחה! (מצב פיתוח)")
        setCooldown(60)
        localStorage.setItem("lastEmailResend", Date.now().toString())
        return
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        throw error
      }

      setMessage("אימייל אימות נשלח בהצלחה! אנא בדוק את תיבת הדואר שלך.")
      setCooldown(60) // 1 minute cooldown
      localStorage.setItem("lastEmailResend", Date.now().toString())
    } catch (err: any) {
      console.error("Resend email error:", err)
      setError(err.message || "שגיאה בשליחת אימייל האימות")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">אמת את האימייל שלך</h2>
          <p className="mt-2 text-sm text-gray-600">שלחנו לך אימייל עם קישור לאימות החשבון</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>אימות אימייל</CardTitle>
            <CardDescription>
              {email ? `שלחנו אימייל אימות לכתובת: ${email}` : "אנא בדוק את תיבת הדואר שלך"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSupabaseConfigured && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>מצב פיתוח - Supabase לא מוגדר</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <p className="text-sm text-gray-600">הוראות:</p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>בדוק את תיבת הדואר שלך (כולל תיקיית הספאם)</li>
                <li>לחץ על הקישור באימייל לאימות החשבון</li>
                <li>חזור לעמוד ההתחברות</li>
              </ol>
            </div>

            <div className="flex flex-col space-y-3">
              <Button onClick={handleResendEmail} disabled={loading || cooldown > 0 || !email} variant="outline">
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    שולח...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="ml-2 h-4 w-4" />
                    שלח שוב בעוד {cooldown} שניות
                  </>
                ) : (
                  <>
                    <Mail className="ml-2 h-4 w-4" />
                    שלח אימייל שוב
                  </>
                )}
              </Button>

              <Button asChild>
                <Link href="/auth">חזור לעמוד ההתחברות</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
