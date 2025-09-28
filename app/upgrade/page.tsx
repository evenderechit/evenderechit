"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"

export default function UpgradePage() {
  const plans = [
    {
      name: "בסיסי",
      price: "₪49",
      period: "לחודש",
      description: "מושלם לעסקים קטנים",
      features: ["עד 100 תורים בחודש", "לוח זמנים בסיסי", "התראות SMS", "דוחות בסיסיים", "תמיכה במייל"],
      current: true,
      popular: false,
    },
    {
      name: "מקצועי",
      price: "₪99",
      period: "לחודש",
      description: "הכי פופולרי לעסקים בינוניים",
      features: [
        "תורים ללא הגבלה",
        "לוח זמנים מתקדם",
        "התראות SMS + WhatsApp",
        "דוחות מתקדמים",
        "ניהול צוות",
        "אינטגרציה עם יומן Google",
        "תמיכה טלפונית",
      ],
      current: false,
      popular: true,
    },
    {
      name: "עסקי",
      price: "₪199",
      period: "לחודש",
      description: "לעסקים גדולים ורשתות",
      features: [
        "כל התכונות של המקצועי",
        "מספר סניפים",
        "API מתקדם",
        "דוחות מותאמים אישית",
        "ניהול משתמשים מתקדם",
        "גיבוי אוטומטי",
        "תמיכה VIP 24/7",
      ],
      current: false,
      popular: false,
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">שדרוג חבילה</h2>
      </div>

      <div className="text-center space-y-4 mb-8">
        <h3 className="text-2xl font-semibold">בחר את החבילה המתאימה לך</h3>
        <p className="text-muted-foreground">שדרג את החבילה שלך וקבל גישה לתכונות מתקדמות יותר</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, index) => (
          <Card key={index} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  הכי פופולרי
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-2">
                {plan.name === "בסיסי" && <Zap className="w-6 h-6 text-blue-500" />}
                {plan.name === "מקצועי" && <Star className="w-6 h-6 text-purple-500" />}
                {plan.name === "עסקי" && <Crown className="w-6 h-6 text-gold-500" />}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                disabled={plan.current}
              >
                {plan.current ? "החבילה הנוכחית" : "שדרג עכשיו"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center space-y-4">
        <h3 className="text-xl font-semibold">יש לך שאלות?</h3>
        <p className="text-muted-foreground">צור קשר עם צוות התמיכה שלנו לקבלת ייעוץ אישי</p>
        <div className="flex justify-center space-x-4 space-x-reverse">
          <Button variant="outline">צור קשר</Button>
          <Button variant="outline">שאלות נפוצות</Button>
        </div>
      </div>
    </div>
  )
}
