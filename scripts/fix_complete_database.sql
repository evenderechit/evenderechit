-- Drop existing tables if they exist
DROP TABLE IF EXISTS whatsapp_templates CASCADE;
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS appointment_reminders CASCADE;
DROP TABLE IF EXISTS user_invitations CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS staff_services CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table (phone-based authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    phone_verified BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_settings table
CREATE TABLE business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_description TEXT,
    business_address TEXT,
    business_phone VARCHAR(20),
    business_email VARCHAR(255),
    working_hours JSONB DEFAULT '{"sunday":{"start":"09:00","end":"17:00","enabled":true},"monday":{"start":"09:00","end":"17:00","enabled":true},"tuesday":{"start":"09:00","end":"17:00","enabled":true},"wednesday":{"start":"09:00","end":"17:00","enabled":true},"thursday":{"start":"09:00","end":"17:00","enabled":true},"friday":{"start":"09:00","end":"14:00","enabled":true},"saturday":{"start":"09:00","end":"17:00","enabled":false}}',
    booking_link_slug VARCHAR(100) UNIQUE,
    advance_booking_days INTEGER DEFAULT 30,
    cancellation_policy TEXT,
    whatsapp_enabled BOOLEAN DEFAULT false,
    whatsapp_phone_number VARCHAR(20),
    whatsapp_api_token TEXT,
    reminder_settings JSONB DEFAULT '{"enabled":true,"hours_before":24,"message":"היי {customer_name}, רק להזכיר שיש לך תור מחר ב-{appointment_time} ל{service_name}. נתראה!"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10,2),
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_members table
CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    specialization TEXT,
    is_active BOOLEAN DEFAULT true,
    working_hours JSONB DEFAULT '{"sunday":{"start":"09:00","end":"17:00","enabled":true},"monday":{"start":"09:00","end":"17:00","enabled":true},"tuesday":{"start":"09:00","end":"17:00","enabled":true},"wednesday":{"start":"09:00","end":"17:00","enabled":true},"thursday":{"start":"09:00","end":"17:00","enabled":true},"friday":{"start":"09:00","end":"14:00","enabled":true},"saturday":{"start":"09:00","end":"17:00","enabled":false}}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    rescheduled_from UUID REFERENCES appointments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo data
INSERT INTO users (id, phone, full_name, business_name, phone_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', '+972501234567', 'דמו משתמש', 'עסק הדמו', true);

INSERT INTO business_settings (user_id, business_name, business_description, business_phone, booking_link_slug) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'עסק הדמו', 'עסק לדמו של המערכת', '+972501234567', 'demo-business');

INSERT INTO services (user_id, name, description, duration, price) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'שירות דמו', 'שירות לדמו', 60, 100.00),
('550e8400-e29b-41d4-a716-446655440000', 'תספורת', 'תספורת מקצועית', 30, 50.00),
('550e8400-e29b-41d4-a716-446655440000', 'טיפול פנים', 'טיפול פנים מקצועי', 90, 150.00);

INSERT INTO staff_members (user_id, name, phone, specialization) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'עובד דמו', '+972501111111', 'כללי'),
('550e8400-e29b-41d4-a716-446655440000', 'יוסי כהן', '+972502222222', 'ספר');

INSERT INTO appointments (user_id, service_id, staff_id, customer_name, customer_phone, appointment_date, appointment_time, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM services WHERE name = 'שירות דמו' LIMIT 1), (SELECT id FROM staff_members WHERE name = 'עובד דמו' LIMIT 1), 'לקוח דמו', '+972502222222', CURRENT_DATE + INTERVAL '1 day', '10:00', 'confirmed'),
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM services WHERE name = 'תספורת' LIMIT 1), (SELECT id FROM staff_members WHERE name = 'יוסי כהן' LIMIT 1), 'אבי ישראל', '+972503333333', CURRENT_DATE + INTERVAL '2 days', '14:00', 'confirmed');

-- Create indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_staff_members_user_id ON staff_members(user_id);
CREATE INDEX idx_business_settings_user_id ON business_settings(user_id);
CREATE INDEX idx_business_settings_slug ON business_settings(booking_link_slug);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY "Users can view own business settings" ON business_settings FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own services" ON services FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own staff" ON staff_members FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own appointments" ON appointments FOR ALL USING (auth.uid()::text = user_id::text);

-- Public policies for booking pages
CREATE POLICY "Public can view business settings by slug" ON business_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active staff" ON staff_members FOR SELECT USING (is_active = true);
CREATE POLICY "Public can insert appointments" ON appointments FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
