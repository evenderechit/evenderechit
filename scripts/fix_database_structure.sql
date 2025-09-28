-- Drop existing tables if they exist
DROP TABLE IF EXISTS "Appointments" CASCADE;
DROP TABLE IF EXISTS "Services" CASCADE;
DROP TABLE IF EXISTS "Availability" CASCADE;
DROP TABLE IF EXISTS "Business_settings" CASCADE;
DROP TABLE IF EXISTS "Staff_members" CASCADE;
DROP TABLE IF EXISTS "Service_Staff" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TABLE IF EXISTS "user_activity_log" CASCADE;
DROP TABLE IF EXISTS "user_sessions" CASCADE;

-- Create Users table
CREATE TABLE "Users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "business_name" VARCHAR(255),
  "business_address" TEXT,
  "business_description" TEXT,
  "timezone" VARCHAR(50) DEFAULT 'Asia/Jerusalem',
  "subscription_type" VARCHAR(20) DEFAULT 'free',
  "subscription_status" VARCHAR(20) DEFAULT 'active',
  "subscription_end_date" TIMESTAMP WITH TIME ZONE,
  "notification_preferences" JSONB DEFAULT '{"email": true, "sms": false}',
  "last_login" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Services table
CREATE TABLE "Services" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "duration_minutes" INTEGER NOT NULL DEFAULT 60,
  "price" DECIMAL(10,2),
  "color" VARCHAR(7) DEFAULT '#0077B6',
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Staff_members table
CREATE TABLE "Staff_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(20),
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Service_Staff junction table
CREATE TABLE "Service_Staff" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "service_id" UUID NOT NULL REFERENCES "Services"("id") ON DELETE CASCADE,
  "staff_member_id" UUID NOT NULL REFERENCES "Staff_members"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("service_id", "staff_member_id")
);

-- Create Availability table
CREATE TABLE "Availability" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "staff_member_id" UUID REFERENCES "Staff_members"("id") ON DELETE CASCADE,
  "day_of_week" INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Business_settings table
CREATE TABLE "Business_settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE UNIQUE,
  "buffer_time_minutes" INTEGER DEFAULT 15,
  "advance_booking_days" INTEGER DEFAULT 30,
  "min_advance_hours" INTEGER DEFAULT 2,
  "allow_cancellation" BOOLEAN DEFAULT true,
  "cancellation_hours" INTEGER DEFAULT 24,
  "allow_rescheduling" BOOLEAN DEFAULT true,
  "reschedule_hours" INTEGER DEFAULT 24,
  "booking_link_slug" VARCHAR(50) UNIQUE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Appointments table
CREATE TABLE "Appointments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "service_id" UUID NOT NULL REFERENCES "Services"("id") ON DELETE CASCADE,
  "staff_member_id" UUID REFERENCES "Staff_members"("id") ON DELETE SET NULL,
  "client_name" VARCHAR(255) NOT NULL,
  "client_phone" VARCHAR(20) NOT NULL,
  "client_email" VARCHAR(255),
  "appointment_date" DATE NOT NULL,
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  "status" VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activity_log table
CREATE TABLE "user_activity_log" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "action" VARCHAR(100) NOT NULL,
  "details" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE "user_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "session_token" VARCHAR(255) NOT NULL UNIQUE,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_appointments_user_date ON "Appointments"("user_id", "appointment_date");
CREATE INDEX idx_appointments_status ON "Appointments"("status");
CREATE INDEX idx_services_user_active ON "Services"("user_id", "is_active");
CREATE INDEX idx_availability_user_day ON "Availability"("user_id", "day_of_week");
CREATE INDEX idx_staff_user_active ON "Staff_members"("user_id", "is_active");

-- Enable Row Level Security
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Availability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Business_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointments" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON "Users" FOR ALL USING (auth.uid() = id);
CREATE POLICY "Services belong to user" ON "Services" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Staff belongs to user" ON "Staff_members" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Availability belongs to user" ON "Availability" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Settings belong to user" ON "Business_settings" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Appointments belong to user" ON "Appointments" FOR ALL USING (auth.uid() = user_id);

-- Insert demo data
INSERT INTO "Users" (id, email, name, business_name, phone) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'demo@smartqueues.com', 'דמו משתמש', 'עסק הדמו', '050-1234567');

INSERT INTO "Services" (user_id, name, description, duration_minutes, price, color) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'תספורת גברים', 'תספורת קלאסית לגברים', 30, 50.00, '#0077B6'),
('550e8400-e29b-41d4-a716-446655440000', 'עיצוב שיער', 'עיצוב שיער מקצועי', 60, 120.00, '#FF6B6B');

INSERT INTO "Business_settings" (user_id, buffer_time_minutes, advance_booking_days, booking_link_slug) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 15, 30, 'demo-business');

INSERT INTO "Availability" (user_id, day_of_week, start_time, end_time) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 1, '09:00', '17:00'),
('550e8400-e29b-41d4-a716-446655440000', 2, '09:00', '17:00'),
('550e8400-e29b-41d4-a716-446655440000', 3, '09:00', '17:00'),
('550e8400-e29b-41d4-a716-446655440000', 4, '09:00', '17:00'),
('550e8400-e29b-41d4-a716-446655440000', 5, '09:00', '15:00');
