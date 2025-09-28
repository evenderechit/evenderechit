"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Settings } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">התראות</h2>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">מרכז התראות</h3>
          <p className="text-muted-foreground mb-4">כאן תוכל לראות את כל ההתראות שלך - תורים חדשים, ביטולים ועדכונים</p>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            הגדר התראות
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
