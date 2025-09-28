import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">מערכת ניהול תורים</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תורים היום</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 מאתמול</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לקוחות פעילים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">ממתינים כעת</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">זמן המתנה ממוצע</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 דק'</div>
            <p className="text-xs text-muted-foreground">-5 דק' מהממוצע</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">יעילות</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+1.2% מהשבוע שעבר</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>תורים קרובים</CardTitle>
            <CardDescription>התורים הבאים בתור</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">1</div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">יוסי כהן</p>
                <p className="text-sm text-muted-foreground">טיפול שיניים - 10:30</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                2
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">שרה לוי</p>
                <p className="text-sm text-muted-foreground">בדיקה כללית - 11:00</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                3
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">דוד אברהם</p>
                <p className="text-sm text-muted-foreground">ייעוץ - 11:30</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>פעולות מהירות</CardTitle>
            <CardDescription>ניהול התורים שלך</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button asChild className="w-full">
                <Link href="/appointments">
                  <Calendar className="mr-2 h-4 w-4" />
                  ניהול תורים
                </Link>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/users">
                    <Users className="mr-2 h-4 w-4" />
                    רשימת לקוחות
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent">
                  <Link href="/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    דוחות וסטטיסטיקות
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ניהול לקוחות מהיר</CardTitle>
            <CardDescription>פעולות מהירות לניהול לקוחות</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/users?action=new">
                <Users className="mr-2 h-4 w-4" />
                הוסף לקוח חדש
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/users?filter=active">
                <Users className="mr-2 h-4 w-4" />
                לקוחות פעילים
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/users?export=true">
                <Users className="mr-2 h-4 w-4" />
                ייצא רשימת לקוחות
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">דוחות מהירים</CardTitle>
            <CardDescription>גישה מהירה לדוחות עסקיים</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/analytics?tab=overview">
                <BarChart3 className="mr-2 h-4 w-4" />
                סקירה כללית
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/analytics?tab=services">
                <BarChart3 className="mr-2 h-4 w-4" />
                דוח שירותים
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/analytics?export=monthly">
                <BarChart3 className="mr-2 h-4 w-4" />
                דוח חודשי
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">סטטיסטיקות מהירות</CardTitle>
            <CardDescription>נתונים חשובים במבט מהיר</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">לקוחות חדשים השבוע</span>
              <span className="font-bold text-green-600">+12</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">הכנסות השבוע</span>
              <span className="font-bold text-blue-600">₪3,240</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">אחוז השלמה</span>
              <span className="font-bold text-purple-600">94%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
