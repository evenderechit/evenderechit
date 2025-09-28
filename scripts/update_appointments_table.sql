-- הוספת עמודות חסרות לטבלת Appointments
ALTER TABLE Appointments 
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES Services(id),
ADD COLUMN IF NOT EXISTS staff_member_id UUID REFERENCES Staff_members(id),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS rescheduled_from UUID REFERENCES Appointments(id),
ADD COLUMN IF NOT EXISTS rescheduled_to UUID REFERENCES Appointments(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT current_timestamp;

-- הוספת אינדקסים לביצועים טובים יותר
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON Appointments(user_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON Appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON Appointments(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON Appointments(service_id);

-- עדכון trigger לupdated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = current_timestamp;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_appointments_updated_at ON Appointments;
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON Appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
