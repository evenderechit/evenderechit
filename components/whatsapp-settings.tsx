"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageCircle, Clock, Eye, Edit } from "lucide-react"
import { toast } from "sonner"

interface WhatsAppTemplate {
  id: string
  template_type: string
  template_name: string
  message_template: string
}

interface WhatsAppSettings {
  whatsapp_enabled: boolean
  whatsapp_phone_number?: string
  whatsapp_business_token?: string
  reminder_24h_enabled: boolean
  reminder_2h_enabled: boolean
  reminder_30m_enabled: boolean
  auto_confirmation_enabled: boolean
}

export default function WhatsAppSettings() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [settings, setSettings] = useState<WhatsAppSettings>({
    whatsapp_enabled: false,
    reminder_24h_enabled: true,
    reminder_2h_enabled: true,
    reminder_30m_enabled: false,
    auto_confirmation_enabled: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [previewVariables, setPreviewVariables] = useState({
    customer_name: "יוסי כהן",
    date: "15/01/2024",
    time: "14:30",
    business_name: "המספרה של דני",
    business_address: "רחוב הרצל 123, תל אביב",
    service_name: "תספורת גברים",
    service_duration: "45",
    reminder_time: "מחר",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      await Promise.all([fetchTemplates(), fetchSettings()])
    } catch (error) {
      console.error("Error fetching WhatsApp data:", error)
      toast.error("שגיאה בטעינת הגדרות WhatsApp")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/whatsapp/templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/business-settings")
      if (response.ok) {
        const data = await response.json()
        setSettings({
          whatsapp_enabled: data.settings.whatsapp_enabled || false,
          whatsapp_phone_number: data.settings.whatsapp_phone_number || "",
          whatsapp_business_token: data.settings.whatsapp_business_token || "",
          reminder_24h_enabled: data.settings.reminder_24h_enabled ?? true,
          reminder_2h_enabled: data.settings.reminder_2h_enabled ?? true,
          reminder_30m_enabled: data.settings.reminder_30m_enabled ?? false,
          auto_confirmation_enabled: data.settings.auto_confirmation_enabled ?? true,
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/business-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success("הגדרות WhatsApp נשמרו בהצלחה!")
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("שגיאה בשמירת ההגדרות")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/whatsapp/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: editingTemplate.id,
          message_template: editingTemplate.message_template,
        }),
      })

      if (response.ok) {
        toast.success("תבנית עודכנה בהצלחה!")
        setIsTemplateDialogOpen(false)
        setEditingTemplate(null)
        fetchTemplates()
      } else {
        throw new Error("Failed to save template")
      }
    } catch (error) {
      console.error("Error saving template:", error)
      toast.error("שגיאה בשמירת התבנית")
    } finally {
      setIsSaving(false)
    }
  }

  const processPreview = (template: string) => {
    let processed = template
    Object.keys(previewVariables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      processed = processed.replace(regex, previewVariables[key])
    })

    // טיפול במשתנים מותנים
    const conditionalRegex = /{{#(\w+)}}(.*?){{\/\1}}/gs
    processed = processed.replace(conditionalRegex, (match, variable, content) => {
      return previewVariables[variable]
        ? content.replace(new RegExp(`{{${variable}}}`, "g"), previewVariables[variable])
        : ""
    })

    return processed
  }

  const getTemplateTypeLabel = (type: string) => {
    const labels = {
      confirmation: "אישור תור",
      reminder: "תזכורת",
      cancellation: "ביטול תור",
      custom: "מותאם אישית",
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>טוען הגדרות WhatsApp...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            הגדרות WhatsApp Business
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>הפעל WhatsApp</Label>
              <p className="text-sm text-gray-500">אפשר שליחת הודעות דרך WhatsApp Business API</p>
            </div>
            <Switch
              checked={settings.whatsapp_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, whatsapp_enabled: checked })}
            />
          </div>

          {settings.whatsapp_enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsappToken">WhatsApp Business Token</Label>
                  <Input
                    id="whatsappToken"
                    type="password"
                    value={settings.whatsapp_business_token || ""}
                    onChange={(e) => setSettings({ ...settings, whatsapp_business_token: e.target.value })}
                    placeholder="הכנס את ה-Token מ-Meta Business"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    קבל Token מ-{" "}
                    <a
                      href="https://developers.facebook.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Meta for Developers
                    </a>
                  </p>
                </div>
                <div>
                  <Label htmlFor="whatsappPhone">מספר טלפון WhatsApp Business</Label>
                  <Input
                    id="whatsappPhone"
                    value={settings.whatsapp_phone_number || ""}
                    onChange={(e) => setSettings({ ...settings, whatsapp_phone_number: e.target.value })}
                    placeholder="972501234567"
                  />
                </div>
              </div>
            </>
          )}

          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              הגדרות תזכורות
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>אישור אוטומטי</Label>
                  <p className="text-sm text-gray-500">שלח הודעת אישור מיד עם קביעת תור</p>
                </div>
                <Switch
                  checked={settings.auto_confirmation_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, auto_confirmation_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>תזכורת 24 שעות מראש</Label>
                  <p className="text-sm text-gray-500">שלח תזכורת יום לפני התור</p>
                </div>
                <Switch
                  checked={settings.reminder_24h_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, reminder_24h_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>תזכורת 2 שעות מראש</Label>
                  <p className="text-sm text-gray-500">שלח תזכורת שעתיים לפני התור</p>
                </div>
                <Switch
                  checked={settings.reminder_2h_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, reminder_2h_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>תזכורת 30 דקות מראש</Label>
                  <p className="text-sm text-gray-500">שלח תזכורת חצי שעה לפני התור</p>
                </div>
                <Switch
                  checked={settings.reminder_30m_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, reminder_30m_enabled: checked })}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
            {isSaving ? "שומר..." : "שמור הגדרות"}
          </Button>
        </CardContent>
      </Card>

      {/* ניהול תבניות */}
      <Card>
        <CardHeader>
          <CardTitle>תבניות הודעות</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-gray-500 text-center py-4">אין תבניות זמינות</p>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{template.template_name}</h3>
                      <Badge variant="outline">{getTemplateTypeLabel(template.template_type)}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>תצוגה מקדימה</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-green-50 p-3 rounded-lg border-r-4 border-green-500">
                              <div className="whitespace-pre-wrap text-sm">
                                {processPreview(template.message_template)}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">* זוהי תצוגה מקדימה עם נתונים לדוגמה</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(template)
                          setIsTemplateDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded font-mono">
                    {template.message_template.substring(0, 100)}
                    {template.message_template.length > 100 && "..."}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* דיאלוג עריכת תבנית */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>עריכת תבנית הודעה</DialogTitle>
            <DialogDescription>
              השתמש במשתנים כמו {`{{customer_name}}`}, {`{{date}}`}, {`{{time}}`} וכו'
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">עריכה</TabsTrigger>
                <TabsTrigger value="preview">תצוגה מקדימה</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="space-y-4">
                <div>
                  <Label htmlFor="templateContent">תוכן התבנית</Label>
                  <Textarea
                    id="templateContent"
                    value={editingTemplate.message_template}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        message_template: e.target.value,
                      })
                    }
                    rows={10}
                    className="font-mono"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p className="font-semibold mb-1">משתנים זמינים:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span>• {`{{customer_name}}`} - שם הלקוח</span>
                    <span>• {`{{date}}`} - תאריך התור</span>
                    <span>• {`{{time}}`} - שעת התור</span>
                    <span>• {`{{business_name}}`} - שם העסק</span>
                    <span>• {`{{service_name}}`} - שם השירות</span>
                    <span>• {`{{reminder_time}}`} - זמן התזכורת</span>
                  </div>
                  <p className="mt-2">
                    <strong>משתנים מותנים:</strong> {`{{#service_name}}יש שירות: {{service_name}}{{/service_name}}`}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border-r-4 border-green-500">
                  <div className="whitespace-pre-wrap">{processPreview(editingTemplate.message_template)}</div>
                </div>
                <p className="text-xs text-gray-500">* זוהי תצוגה מקדימה עם נתונים לדוגמה</p>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              {isSaving ? "שומר..." : "שמור תבנית"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
