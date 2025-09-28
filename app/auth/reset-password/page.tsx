"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, AlertCircle, Loader2, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const loadSupabase = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client")
        const client = createClient()
        setSupabase(client)
      } catch (error) {
        console.error("Failed to create Supabase client:", error)
        setIsSupabaseConfigured(false)
      }
    }

    loadSupabase()

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsSupabaseConfigured(false)
    }

    const lastReset = localStorage.getItem("lastPasswordReset")
    if (lastReset) {
      const timeDiff = Date.now() - Number.parseInt(lastReset)
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || cooldown > 0) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (!isSupabaseConfigured || !supabase) {
        setMessage("קישור איפוס סיסמה נשלח בהצלחה! (מצב פיתוח)")
        setCooldown(60)
        localStorage.setItem("lastPasswordReset", Date.now().toString())
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        throw error
      }

      setMessage("קישור איפוס סיסמה נשלח לאימייל שלך! אנא בדוק את תיבת הדואר.")
      setCooldown(60) // 1 minute cooldown
      localStorage.setItem("lastPasswordReset", Date.now().toString())
    } catch (err: any) {
      console.error("Reset password error:", err)
      setError(err.message || "שגיאה בשליחת קישור איפוס הסיסמה")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">איפוס סיסמה</h2>
          <p className="mt-2 text-sm text-gray-600">הכנס את כתובת האימייל שלך לקבלת קישור איפוס</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>איפוס סיסמה</CardTitle>
            <CardDescription>נשלח לך קישור לאיפוס הסיסמה באימייל</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSupabaseConfigured && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>מצב פיתוח - Supabase לא מוגדר</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="email">כתובת אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="הכנס את כתובת האימייל שלך"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || cooldown > 0 || !email}>
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    שולח...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="ml-2 h-4 w-4" />
                    נסה שוב בעוד {cooldown} שניות
                  </>
                ) : (
                  <>
                    <Mail className="ml-2 h-4 w-4" />
                    שלח קישור איפוס
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/auth"
                  className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center"
                >
                  <ArrowRight className="ml-1 h-4 w-4" />
                  חזור לעמוד ההתחברות
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
