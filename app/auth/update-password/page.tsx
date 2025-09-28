"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Lock, Check, X } from "lucide-react"

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "bg-gray-200",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsSupabaseConfigured(false)
    }
  }, [])

  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push("לפחות 8 תווים")
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push("אות גדולה אחת לפחות")
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push("אות קטנה אחת לפחות")
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push("מספר אחד לפחות")
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      feedback.push("תו מיוחד אחד לפחות")
    }

    let color = "bg-red-500"
    if (score >= 4) color = "bg-green-500"
    else if (score >= 3) color = "bg-yellow-500"
    else if (score >= 2) color = "bg-orange-500"

    return { score, feedback, color }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordStrength(checkPasswordStrength(value))
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!password || !confirmPassword) {
        throw new Error("אנא מלא את כל השדות")
      }

      if (password !== confirmPassword) {
        throw new Error("הסיסמאות אינן תואמות")
      }

      if (passwordStrength.score < 3) {
        throw new Error("הסיסמה חלשה מדי. אנא בחר סיסמה חזקה יותר")
      }

      if (!isSupabaseConfigured) {
        setSuccess("הסיסמה עודכנה בהצלחה! (מצב פיתוח)")
        setTimeout(() => {
          router.push("/auth?message=" + encodeURIComponent("הסיסמה עודכנה בהצלחה"))
        }, 2000)
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        throw error
      }

      setSuccess("הסיסמה עודכנה בהצלחה! מפנה לעמוד ההתחברות...")
      setTimeout(() => {
        router.push("/auth?message=" + encodeURIComponent("הסיסמה עודכנה בהצלחה"))
      }, 2000)
    } catch (err: any) {
      console.error("Update password error:", err)
      setError(err.message || "שגיאה בעדכון הסיסמה")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">עדכון סיסמה</h2>
          <p className="mt-2 text-sm text-gray-600">הכנס סיסמה חדשה לחשבון שלך</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>עדכון סיסמה</CardTitle>
            <CardDescription>בחר סיסמה חזקה וחדשה לחשבון שלך</CardDescription>
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

            {success && (
              <Alert className="mb-4" variant="default" className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="password">סיסמה חדשה</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    placeholder="הכנס סיסמה חדשה"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 space-x-reverse mb-1">
                      <div className="flex-1">
                        <Progress value={(passwordStrength.score / 5) * 100} className="h-2" />
                      </div>
                      <span className="text-xs text-gray-600">
                        {passwordStrength.score < 2 && "חלשה"}
                        {passwordStrength.score >= 2 && passwordStrength.score < 4 && "בינונית"}
                        {passwordStrength.score >= 4 && "חזקה"}
                      </span>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <p>נדרש:</p>
                        <ul className="list-none space-y-1">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index} className="flex items-center space-x-1 space-x-reverse">
                              <X className="h-3 w-3 text-red-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">אימות סיסמה</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="הכנס שוב את הסיסמה החדשה"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">הסיסמאות אינן תואמות</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-xs text-green-600 mt-1 flex items-center space-x-1 space-x-reverse">
                    <Check className="h-3 w-3" />
                    <span>הסיסמאות תואמות</span>
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    מעדכן סיסמה...
                  </>
                ) : (
                  <>
                    <Lock className="ml-2 h-4 w-4" />
                    עדכן סיסמה
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
