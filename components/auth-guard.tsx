"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isSupabaseConfigured || !supabase) {
          setError("Missing or invalid Supabase environment variables. Please check Project Settings.")
          setLoading(false)
          return
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          // Redirect to auth page if not authenticated
          if (pathname !== "/auth" && pathname !== "/auth/login" && pathname !== "/auth/signup") {
            router.push("/auth/login")
            return
          }
        }

        setUser(user)
      } catch (error: any) {
        console.error("Auth check error:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4"
        dir="rtl"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">שגיאה בהגדרות המערכת</CardTitle>
            <CardDescription>לא ניתן להתחבר למסד הנתונים</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-red-50 p-4 rounded-lg text-right">
              <p className="text-sm text-red-800 font-medium mb-2">שגיאה טכנית:</p>
              <p className="text-xs text-red-600 font-mono">{error}</p>
            </div>

            <div className="text-right space-y-2">
              <p className="text-sm font-medium">לתיקון הבעיה:</p>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. לך ל-Project Settings (פינה ימנית עליונה)</li>
                <li>2. לחץ על Environment Variables</li>
                <li>3. ודא שקיימים המשתנים:</li>
                <li className="font-mono">NEXT_PUBLIC_SUPABASE_URL</li>
                <li className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ol>
            </div>

            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              נסה שוב
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user && (pathname === "/auth" || pathname === "/auth/login" || pathname === "/auth/signup")) {
    return <>{children}</>
  }

  // Require user for all other pages
  if (!user) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
