"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, TrendingDown, Calendar, Users, DollarSign, Download } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

export default function AnalyticsPage() {
  const monthlyStats = {
    totalAppointments: 156,
    completedAppointments: 142,
    cancelledAppointments: 14,
    revenue: 12500,
    newCustomers: 23,
    returningCustomers: 89,
  }

  const popularServices = [
    { name: "תספורת", appointments: 45, revenue: 2250, color: "#8884d8" },
    { name: "צביעה", appointments: 32, revenue: 4800, color: "#82ca9d" },
    { name: "עיצוב", appointments: 28, revenue: 2800, color: "#ffc658" },
    { name: "טיפוח", appointments: 25, revenue: 1875, color: "#ff7300" },
    { name: "פן", appointments: 15, revenue: 900, color: "#00ff88" },
  ]

  const busyHours = [
    { hour: "09:00", appointments: 12, revenue: 600 },
    { hour: "10:00", appointments: 18, revenue: 900 },
    { hour: "11:00", appointments: 22, revenue: 1100 },
    { hour: "12:00", appointments: 15, revenue: 750 },
    { hour: "13:00", appointments: 8, revenue: 400 },
    { hour: "14:00", appointments: 20, revenue: 1000 },
    { hour: "15:00", appointments: 25, revenue: 1250 },
    { hour: "16:00", appointments: 19, revenue: 950 },
    { hour: "17:00", appointments: 14, revenue: 700 },
  ]

  const weeklyData = [
    { day: "ראשון", appointments: 22, revenue: 1100, completed: 20, cancelled: 2 },
    { day: "שני", appointments: 28, revenue: 1400, completed: 26, cancelled: 2 },
    { day: "שלישי", appointments: 25, revenue: 1250, completed: 23, cancelled: 2 },
    { day: "רביעי", appointments: 30, revenue: 1500, completed: 28, cancelled: 2 },
    { day: "חמישי", appointments: 32, revenue: 1600, completed: 30, cancelled: 2 },
    { day: "שישי", appointments: 19, revenue: 950, completed: 17, cancelled: 2 },
    { day: "שבת", appointments: 0, revenue: 0, completed: 0, cancelled: 0 },
  ]

  const monthlyTrend = [
    { month: "ינואר", appointments: 120, revenue: 9500, customers: 45 },
    { month: "פברואר", appointments: 135, revenue: 10800, customers: 52 },
    { month: "מרץ", appointments: 142, revenue: 11200, customers: 48 },
    { month: "אפריל", appointments: 156, revenue: 12500, customers: 58 },
    { month: "מאי", appointments: 168, revenue: 13400, customers: 62 },
    { month: "יוני", appointments: 145, revenue: 11600, customers: 55 },
  ]

  const customerSatisfaction = [
    { name: "מצוין", value: 65, color: "#00C49F" },
    { name: "טוב", value: 25, color: "#FFBB28" },
    { name: "בסדר", value: 8, color: "#FF8042" },
    { name: "לא מרוצה", value: 2, color: "#FF6B6B" },
  ]

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff88", "#ff6b6b", "#4ecdc4", "#45b7d1"]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">דוחות ואנליטיקה - BI מתקדם</h2>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          ייצא דוח
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה"כ תורים</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +12% מהחודש הקודם
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הכנסות</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{monthlyStats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +8% מהחודש הקודם
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לקוחות חדשים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.newCustomers}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +15% מהחודש הקודם
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אחוז השלמה</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((monthlyStats.completedAppointments / monthlyStats.totalAppointments) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              -2% מהחודש הקודם
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="services">שירותים</TabsTrigger>
          <TabsTrigger value="hours">שעות עמוסות</TabsTrigger>
          <TabsTrigger value="weekly">נתונים שבועיים</TabsTrigger>
          <TabsTrigger value="trends">מגמות</TabsTrigger>
          <TabsTrigger value="satisfaction">שביעות רצון</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>הכנסות לפי שירותים</CardTitle>
                <CardDescription>התפלגות הכנסות החודש</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={popularServices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ₪${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {popularServices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₪${value}`, "הכנסות"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>תורים לפי שעות</CardTitle>
                <CardDescription>התפלגות תורים במהלך היום</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={busyHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "תורים"]} />
                    <Area type="monotone" dataKey="appointments" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>שירותים פופולריים - ניתוח מפורט</CardTitle>
              <CardDescription>השירותים הנבחרים ביותר החודש</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={popularServices} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="appointments" fill="#8884d8" name="מספר תורים" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="הכנסות (₪)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ניתוח שעות עמוסות</CardTitle>
              <CardDescription>תורים והכנסות לפי שעות היום</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={busyHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="appointments"
                    stroke="#8884d8"
                    strokeWidth={3}
                    name="תורים"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    name="הכנסות (₪)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ביצועים שבועיים מפורטים</CardTitle>
              <CardDescription>ניתוח מקיף לפי ימי השבוע</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#00C49F" name="הושלמו" />
                  <Bar dataKey="cancelled" stackId="a" fill="#FF8042" name="בוטלו" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>מגמות חודשיות</CardTitle>
              <CardDescription>התפתחות הביצועים לאורך זמן</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="appointments"
                    stroke="#8884d8"
                    strokeWidth={3}
                    name="תורים"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    name="הכנסות (₪)"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="customers"
                    stroke="#ffc658"
                    strokeWidth={3}
                    name="לקוחות חדשים"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>שביעות רצון לקוחות</CardTitle>
              <CardDescription>דירוג שביעות רצון מהשירות</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerSatisfaction}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerSatisfaction.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {customerSatisfaction.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-2xl font-bold">{item.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
