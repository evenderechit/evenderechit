-- טבלה: StaffMembers (אנשי צוות)
CREATE TABLE IF NOT EXISTS Staff_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES Users(id) ON DELETE CASCADE, -- מפתח זר לטבלת Users (בעל העסק)
    name text NOT NULL,
    email text UNIQUE, -- אופציונלי, למקרה שאיש הצוות יתחבר בעתיד
    phone text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT current_timestamp,
    updated_at timestamp DEFAULT current_timestamp
);

-- עדכון טבלת Appointments (תורים) להוספת איש צוות
ALTER TABLE Appointments
ADD COLUMN IF NOT EXISTS staff_member_id uuid REFERENCES Staff_members(id);

-- עדכון טבלת Availability (זמינות) לקישור לאיש צוות ספציפי
-- אם staff_member_id הוא NULL, הזמינות שייכת לבעל העסק הראשי
ALTER TABLE Availability
ADD COLUMN IF NOT EXISTS staff_member_id uuid REFERENCES Staff_members(id);

-- יצירת טבלת קישור בין Services (שירותים) ל-Staff_members (אנשי צוות)
-- שירות יכול להיות מסופק על ידי מספר אנשי צוות
CREATE TABLE IF NOT EXISTS Service_Staff (
    service_id uuid REFERENCES Services(id) ON DELETE CASCADE,
    staff_member_id uuid REFERENCES Staff_members(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, staff_member_id)
);

-- אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON Staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_member_id ON Appointments(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_availability_staff_member_id ON Availability(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_service_staff_service_id ON Service_Staff(service_id);
CREATE INDEX IF NOT EXISTS idx_service_staff_staff_member_id ON Service_Staff(staff_member_id);
