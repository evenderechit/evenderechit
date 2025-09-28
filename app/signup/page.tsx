"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Phone, Building, Lock, User } from 'lucide-react'
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    phone: "",
    businessName: "",
    ownerName: "",
    password: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate form
      if (!formData.phone || !formData.businessName || !formData.ownerName || !formData.password) {
        setError("אנא מלא את כל השדות")
        return
      }

      // Demo signup - create user data
      const userData = {
        id: "demo-user-" + Date.now(),
        phone: formData.phone,
        business_name: formData.businessName,
        owner_name: formData.ownerName,
        email: `${formData.phone}@demo.com`,
        created_at: new Date().toISOString()
      }

      localStorage.setItem('demo_user', JSON.stringify(userData))
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      router.push("/dashboard")
    } catch (error) {
      setError("שגיאה בהרשמה. נסה שוב.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">הרשמה</CardTitle>
            <CardDescription>
              צור חשבון חדש כדי להתחיל לנהל תורים
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">מספר טלפון</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="050-1234567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">שם העסק</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    placeholder="שם העסק שלך"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">שם בעל העסק</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    placeholder="השם המלא שלך"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="בחר סיסמה חזקה"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    נרשם...
                  </>
                ) : (
                  "הירשם"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                כבר יש לך חשבון?{" "}
                <Link href="/auth" className="font-medium text-blue-600 hover:text-blue-500">
                  התחבר כאן
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-800 text-center">
                <strong>מצב דמו:</strong> מלא את הפרטים כדי ליצור חשבון דמו
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
