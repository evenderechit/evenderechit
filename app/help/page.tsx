"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HelpCircle, Search, Book, MessageCircle, Phone, Mail } from "lucide-react"

export default function HelpPage() {
  const faqItems = [
    {
      question: "איך אני מוסיף תור חדש?",
      answer: 'לחץ על כפתור "תור חדש" בדף התורים ומלא את הפרטים הנדרשים.',
    },
    {
      question: "איך אני משנה את שעות הפעילות?",
      answer: 'עבור לדף ההגדרות ובחר בטאב "שעות פעילות" כדי לעדכן את השעות.',
    },
    {
      question: "איך לקוחות יכולים לקבוע תורים?",
      answer: "שתף עם הלקוחות את קישור ההזמנות שמופיע בהגדרות.",
    },
    {
      question: "איך אני מבטל תור?",
      answer: 'בדף התורים, לחץ על התור הרלוונטי ובחר "ביטול".',
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">עזרה ותמיכה</h2>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input placeholder="חפש בעזרה..." className="pl-10" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              שאלות נפוצות
            </CardTitle>
            <CardDescription>תשובות לשאלות הנפוצות ביותר</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h4 className="font-medium mb-2">{item.question}</h4>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              צור קשר עם התמיכה
            </CardTitle>
            <CardDescription>זקוק לעזרה נוספת? אנחנו כאן בשבילך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              צ'אט חי
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              שלח אימייל
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              התקשר אלינו
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Book className="mr-2 h-4 w-4" />
              מדריך למשתמש
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>טיפים מהירים</CardTitle>
          <CardDescription>כמה טיפים שיעזרו לך להפיק את המקסימום מהמערכת</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">הגדר שעות פעילות</h4>
              <p className="text-sm text-muted-foreground">
                עדכן את שעות הפעילות שלך כדי שלקוחות יוכלו לקבוע תורים בזמנים הנכונים
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">הפעל תזכורות</h4>
              <p className="text-sm text-muted-foreground">הפעל תזכורות אוטומטיות כדי להפחית ביטולים ואי-הגעות</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">שתף קישור הזמנות</h4>
              <p className="text-sm text-muted-foreground">שתף את קישור ההזמנות באתר שלך ובמדיה החברתית</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
