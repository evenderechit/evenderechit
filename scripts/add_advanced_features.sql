-- הוספת טבלה לסוגי שירותים
CREATE TABLE IF NOT EXISTS Services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES Users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    duration_minutes integer NOT NULL DEFAULT 60,
    price decimal(10,2),
    color text DEFAULT '#0077B6',
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT current_timestamp
);

-- הוספת טבלה להגדרות זמינות
CREATE TABLE IF NOT EXISTS Availability (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES Users(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL, -- 0=ראשון, 1=שני, וכו'
    start_time time NOT NULL,
    end_time time NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT current_timestamp
);

-- הוספת טבלה לחסימת תאריכים
CREATE TABLE IF NOT EXISTS Blocked_dates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES Users(id) ON DELETE CASCADE,
    blocked_date date NOT NULL,
    reason text,
    created_at timestamp DEFAULT current_timestamp
);

-- הוספת טבלה להגדרות עסק מתקדמות
CREATE TABLE IF NOT EXISTS Business_settings (
    user_id uuid PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE,
    buffer_time_minutes integer DEFAULT 15,
    advance_booking_days integer DEFAULT 30,
    min_advance_hours integer DEFAULT 2,
    allow_cancellation boolean DEFAULT true,
    cancellation_hours integer DEFAULT 24,
    allow_rescheduling boolean DEFAULT true,
    reschedule_hours integer DEFAULT 24,
    timezone text DEFAULT 'Asia/Jerusalem',
    created_at timestamp DEFAULT current_timestamp,
    updated_at timestamp DEFAULT current_timestamp
);

-- עדכון טבלת התורים
ALTER TABLE Appointments 
ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES Services(id),
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS end_time time,
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp,
ADD COLUMN IF NOT EXISTS rescheduled_from uuid REFERENCES Appointments(id);

-- אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS idx_services_user_id ON Services(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_user_day ON Availability(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_user_date ON Blocked_dates(user_id, blocked_date);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON Appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON Appointments(date, time);
