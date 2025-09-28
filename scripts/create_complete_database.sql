-- Create complete database schema for SmartQueues

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS whatsapp_messages CASCADE;

-- Create business_settings table
CREATE TABLE business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_description TEXT,
    business_address TEXT,
    business_phone VARCHAR(20),
    business_email VARCHAR(255),
    working_hours_start TIME DEFAULT '09:00',
    working_hours_end TIME DEFAULT '17:00',
    working_days TEXT[] DEFAULT ARRAY['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    buffer_time_minutes INTEGER DEFAULT 15,
    max_advance_booking_days INTEGER DEFAULT 30,
    booking_link_slug VARCHAR(100) UNIQUE,
    whatsapp_enabled BOOLEAN DEFAULT false,
    whatsapp_phone VARCHAR(20),
    whatsapp_api_token TEXT,
    email_notifications_enabled BOOLEAN DEFAULT true,
    sms_notifications_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2),
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_members table
CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availability_slots table
CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    rescheduled_from UUID REFERENCES appointments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create whatsapp_messages table
CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'reminder' CHECK (message_type IN ('reminder', 'confirmation', 'cancellation', 'custom')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_business_settings_user_id ON business_settings(user_id);
CREATE INDEX idx_business_settings_slug ON business_settings(booking_link_slug);
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_staff_members_user_id ON staff_members(user_id);
CREATE INDEX idx_staff_members_active ON staff_members(is_active);
CREATE INDEX idx_availability_slots_user_id ON availability_slots(user_id);
CREATE INDEX idx_availability_slots_staff ON availability_slots(staff_member_id);
CREATE INDEX idx_availability_slots_day ON availability_slots(day_of_week);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_service ON appointments(service_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_member_id);
CREATE INDEX idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);
CREATE INDEX idx_whatsapp_messages_appointment ON whatsapp_messages(appointment_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);

-- Enable Row Level Security (RLS)
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can manage their own business settings" ON business_settings
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own services" ON services
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own staff" ON staff_members
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own availability" ON availability_slots
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own appointments" ON appointments
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own WhatsApp messages" ON whatsapp_messages
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Public policies for booking pages
CREATE POLICY "Public can view business settings by slug" ON business_settings
    FOR SELECT USING (booking_link_slug IS NOT NULL);

CREATE POLICY "Public can view active services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active staff" ON staff_members
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view availability" ON availability_slots
    FOR SELECT USING (true);

CREATE POLICY "Public can create appointments" ON appointments
    FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_business_settings_updated_at 
    BEFORE UPDATE ON business_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at 
    BEFORE UPDATE ON staff_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at 
    BEFORE UPDATE ON availability_slots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data for development
INSERT INTO business_settings (
    user_id, 
    business_name, 
    business_description, 
    business_phone, 
    business_email,
    booking_link_slug
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'עסק הדמו',
    'עסק לדמו של מערכת SmartQueues',
    '050-1234567',
    'demo@smartqueues.com',
    'demo-business'
);

INSERT INTO services (user_id, name, description, duration_minutes, price, color) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'תספורת גברים', 'תספורת מקצועית לגברים', 30, 50.00, '#3B82F6'),
('550e8400-e29b-41d4-a716-446655440000', 'צביעת שיער', 'צביעה מקצועית לנשים', 120, 200.00, '#EF4444'),
('550e8400-e29b-41d4-a716-446655440000', 'עיסוי רפואי', 'עיסוי טיפולי מקצועי', 60, 150.00, '#10B981'),
('550e8400-e29b-41d4-a716-446655440000', 'טיפול פנים', 'טיפול פנים מקצועי', 90, 180.00, '#F59E0B');

INSERT INTO staff_members (user_id, name, phone, description) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'דני הספר', '050-1111111', 'ספר מקצועי עם 10 שנות ניסיון'),
('550e8400-e29b-41d4-a716-446655440000', 'מיכל הסטייליסטית', '050-2222222', 'סטייליסטית מומחית לצביעות'),
('550e8400-e29b-41d4-a716-446655440000', 'רונית המטפלת', '050-3333333', 'מטפלת רפואית מוסמכת');

-- Insert availability slots (Sunday to Thursday, 9:00-17:00)
INSERT INTO availability_slots (user_id, staff_member_id, day_of_week, start_time, end_time)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    sm.id,
    day_num,
    '09:00'::time,
    '17:00'::time
FROM staff_members sm
CROSS JOIN generate_series(0, 4) AS day_num
WHERE sm.user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert sample appointments
INSERT INTO appointments (
    user_id, 
    service_id, 
    staff_member_id, 
    customer_name, 
    customer_phone, 
    appointment_date, 
    appointment_time, 
    status
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    (SELECT id FROM services WHERE name = 'תספורת גברים' LIMIT 1),
    (SELECT id FROM staff_members WHERE name = 'דני הספר' LIMIT 1),
    'יוסי כהן',
    '050-1234567',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00',
    'confirmed'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    (SELECT id FROM services WHERE name = 'צביעת שיער' LIMIT 1),
    (SELECT id FROM staff_members WHERE name = 'מיכל הסטייליסטית' LIMIT 1),
    'שרה לוי',
    '052-9876543',
    CURRENT_DATE + INTERVAL '1 day',
    '11:30',
    'confirmed'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    (SELECT id FROM services WHERE name = 'עיסוי רפואי' LIMIT 1),
    (SELECT id FROM staff_members WHERE name = 'רונית המטפלת' LIMIT 1),
    'דוד ישראל',
    '054-5555555',
    CURRENT_DATE + INTERVAL '1 day',
    '14:00',
    'pending'
);
