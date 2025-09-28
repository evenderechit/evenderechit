"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send, Mail } from "lucide-react"

export default function MessagesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">הודעות</h2>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">מערכת הודעות</h3>
          <p className="text-muted-foreground mb-4">
            תכונה זו תהיה זמינה בקרוב - שלח הודעות ללקוחות דרך SMS, WhatsApp ואימייל
          </p>
          <div className="flex justify-center space-x-4 space-x-reverse">
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              SMS
            </Button>
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              אימייל
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
