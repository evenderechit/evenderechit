-- הוספת טבלה לתבניות הודעות WhatsApp
CREATE TABLE IF NOT EXISTS Whatsapp_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES Users(id) ON DELETE CASCADE,
    template_type text NOT NULL, -- 'confirmation', 'reminder', 'cancellation', 'custom'
    template_name text NOT NULL,
    message_template text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT current_timestamp
);

-- הוספת טבלה לניהול הודעות WhatsApp שנשלחו
CREATE TABLE IF NOT EXISTS Whatsapp_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid REFERENCES Appointments(id) ON DELETE CASCADE,
    user_id uuid REFERENCES Users(id) ON DELETE CASCADE,
    phone_number text NOT NULL,
    message_content text NOT NULL,
    message_type text NOT NULL, -- 'confirmation', 'reminder', 'cancellation'
    status text DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    sent_at timestamp,
    delivered_at timestamp,
    error_message text,
    created_at timestamp DEFAULT current_timestamp
);

-- הוספת טבלה לתזכורות מתוזמנות
CREATE TABLE IF NOT EXISTS Scheduled_reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid REFERENCES Appointments(id) ON DELETE CASCADE,
    user_id uuid REFERENCES Users(id) ON DELETE CASCADE,
    reminder_type text NOT NULL, -- '24h', '2h', '30m'
    scheduled_time timestamp NOT NULL,
    status text DEFAULT 'pending', -- 'pending', 'sent', 'cancelled'
    created_at timestamp DEFAULT current_timestamp
);

-- הוספת עמודות לטבלת הגדרות עסק
ALTER TABLE Business_settings 
ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number text,
ADD COLUMN IF NOT EXISTS whatsapp_business_token text,
ADD COLUMN IF NOT EXISTS reminder_24h_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_2h_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_30m_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_confirmation_enabled boolean DEFAULT true;

-- אינדקסים
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_appointment ON Whatsapp_messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON Whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_time ON Scheduled_reminders(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_status ON Scheduled_reminders(status);

-- הכנסת תבניות ברירת מחדל
INSERT INTO Whatsapp_templates (user_id, template_type, template_name, message_template) 
SELECT 
    id as user_id,
    'confirmation' as template_type,
    'אישור תור' as template_name,
    'שלום {{customer_name}}! 👋

התור שלך אושר בהצלחה ✅

📅 תאריך: {{date}}
🕐 שעה: {{time}}
🏢 עסק: {{business_name}}
{{#service_name}}🔧 שירות: {{service_name}}{{/service_name}}
{{#service_duration}}⏱️ משך זמן: {{service_duration}} דקות{{/service_duration}}

תודה שבחרת בנו! 
נתראה בקרוב 😊

לביטול או שינוי תור, אנא צור קשר.' as message_template
FROM Users 
WHERE NOT EXISTS (
    SELECT 1 FROM Whatsapp_templates 
    WHERE user_id = Users.id AND template_type = 'confirmation'
);

INSERT INTO Whatsapp_templates (user_id, template_type, template_name, message_template) 
SELECT 
    id as user_id,
    'reminder' as template_type,
    'תזכורת תור' as template_name,
    'שלום {{customer_name}}! 🔔

תזכורת לתור שלך {{reminder_time}}:

📅 תאריך: {{date}}
🕐 שעה: {{time}}
🏢 עסק: {{business_name}}
📍 כתובת: {{business_address}}
{{#service_name}}🔧 שירות: {{service_name}}{{/service_name}}

נתראה בקרוב! 😊
אם אתה צריך לבטל או לשנות, אנא צור קשר בהקדם.' as message_template
FROM Users 
WHERE NOT EXISTS (
    SELECT 1 FROM Whatsapp_templates 
    WHERE user_id = Users.id AND template_type = 'reminder'
);
