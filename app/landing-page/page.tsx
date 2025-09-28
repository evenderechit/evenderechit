"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, MessageSquare, BarChart3, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const features = [
    {
      icon: Calendar,
      title: "ניהול תורים חכם",
      description: "מערכת תורים מתקדמת עם יכולות תזמון אוטומטיות",
    },
    {
      icon: MessageSquare,
      title: "הודעות WhatsApp",
      description: "שליחת הודעות אוטומטיות ותזכורות ללקוחות",
    },
    {
      icon: Users,
      title: "ניהול צוות",
      description: "ניהול מספר עובדים ושירותים במקום אחד",
    },
    {
      icon: BarChart3,
      title: "דוחות ואנליטיקה",
      description: "מעקב אחר ביצועים וסטטיסטיקות מפורטות",
    },
    {
      icon: Clock,
      title: "זמינות 24/7",
      description: "לקוחות יכולים לקבוע תורים בכל שעה",
    },
    {
      icon: Shield,
      title: "אבטחה מתקדמת",
      description: "הגנה מלאה על נתוני הלקוחות והעסק",
    },
  ]

  const plans = [
    {
      name: "בסיסי",
      price: "₪99",
      period: "לחודש",
      description: "מושלם לעסקים קטנים",
      features: ["עד 100 תורים בחודש", "שירות אחד", "הודעות SMS בסיסיות", "תמיכה באימייל"],
      popular: false,
    },
    {
      name: "מקצועי",
      price: "₪199",
      period: "לחודש",
      description: "הבחירה הפופולרית",
      features: ["תורים ללא הגבלה", "עד 5 שירותים", "הודעות WhatsApp", "ניהול צוות", "דוחות מתקדמים", "תמיכה טלפונית"],
      popular: true,
    },
    {
      name: "עסקי",
      price: "₪399",
      period: "לחודש",
      description: "לעסקים גדולים",
      features: ["כל התכונות", "שירותים ללא הגבלה", "צוות ללא הגבלה", "אינטגרציות מתקדמות", "תמיכה VIP", "הדרכה אישית"],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 ml-2" />
              <span className="text-2xl font-bold text-gray-900">AI Smart Queues</span>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/auth">
                <Button variant="outline">התחברות</Button>
              </Link>
              <Link href="/auth">
                <Button>התחל עכשיו</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            מערכת ניהול תורים
            <span className="text-blue-600 block">חכמה ומתקדמת</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            נהל את העסק שלך בצורה חכמה עם מערכת התורים המתקדמת ביותר. חסוך זמן, הגדל רווחים ושפר את חוויית הלקוחות.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 py-3">
                התחל ניסיון חינם
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
              צפה בהדגמה
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">ללא התחייבות • ביטול בכל עת • תמיכה בעברית</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">למה לבחור ב-AI Smart Queues?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              כל מה שאתה צריך כדי לנהל את העסק שלך בצורה מקצועית ויעילה
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">תוכניות מחיר שמתאימות לכל עסק</h2>
            <p className="text-xl text-gray-600">בחר את התוכנית המתאימה לך והתחל עוד היום</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? "ring-2 ring-blue-600 shadow-xl" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">הכי פופולרי</Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth" className="block mt-6">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      התחל עכשיו
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">מוכן להתחיל?</h2>
          <p className="text-xl text-blue-100 mb-8">הצטרף לאלפי עסקים שכבר משתמשים ב-AI Smart Queues</p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              התחל ניסיון חינם של 14 יום
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-blue-400 ml-2" />
                <span className="text-xl font-bold">AI Smart Queues</span>
              </div>
              <p className="text-gray-400">מערכת ניהול תורים מתקדמת לעסקים מכל הסוגים</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">מוצר</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    תכונות
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    מחירים
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    הדגמה
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">תמיכה</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    מרכז עזרה
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    צור קשר
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    הדרכות
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">חברה</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    אודות
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    בלוג
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    קריירה
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Smart Queues. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
