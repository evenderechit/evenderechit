-- Fix appointments table relationships
-- Drop existing foreign key constraints if they exist
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_staff_id_fkey;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_staff_member_id_fkey;

-- Add staff_member_id column if it doesn't exist
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS staff_member_id UUID;

-- Update existing staff_id to staff_member_id if needed
UPDATE appointments SET staff_member_id = staff_id WHERE staff_member_id IS NULL AND staff_id IS NOT NULL;

-- Drop old staff_id column if it exists
ALTER TABLE appointments DROP COLUMN IF EXISTS staff_id;

-- Add proper foreign key constraints
ALTER TABLE appointments 
ADD CONSTRAINT appointments_service_id_fkey 
FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

ALTER TABLE appointments 
ADD CONSTRAINT appointments_staff_member_id_fkey 
FOREIGN KEY (staff_member_id) REFERENCES staff_members(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_member_id ON appointments(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Ensure RLS is enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointments;

CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments" ON appointments
    FOR DELETE USING (auth.uid() = user_id);
