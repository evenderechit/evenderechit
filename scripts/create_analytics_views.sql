-- Create analytics views for better performance
-- Daily appointment statistics
CREATE OR REPLACE VIEW daily_appointment_stats AS
SELECT 
    DATE(appointment_date) as date,
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
    COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_appointments,
    SUM(CASE WHEN status = 'completed' AND s.price IS NOT NULL THEN s.price ELSE 0 END) as total_revenue,
    AVG(CASE WHEN status = 'completed' AND s.price IS NOT NULL THEN s.price ELSE 0 END) as avg_revenue_per_appointment
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
WHERE a.user_id = auth.uid()
GROUP BY DATE(appointment_date)
ORDER BY date DESC;

-- Service performance view
CREATE OR REPLACE VIEW service_performance AS
SELECT 
    s.id,
    s.name,
    s.price,
    COUNT(a.id) as total_bookings,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_bookings,
    ROUND(
        (COUNT(CASE WHEN a.status = 'completed' THEN 1 END)::float / 
         NULLIF(COUNT(a.id), 0) * 100), 2
    ) as completion_rate,
    SUM(CASE WHEN a.status = 'completed' AND s.price IS NOT NULL THEN s.price ELSE 0 END) as total_revenue
FROM services s
LEFT JOIN appointments a ON s.id = a.service_id AND a.user_id = auth.uid()
WHERE s.user_id = auth.uid()
GROUP BY s.id, s.name, s.price
ORDER BY total_bookings DESC;

-- Staff performance view
CREATE OR REPLACE VIEW staff_performance AS
SELECT 
    COALESCE(sm.id, 'owner') as staff_id,
    COALESCE(sm.name, 'בעל העסק') as staff_name,
    COUNT(a.id) as total_appointments,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
    ROUND(
        (COUNT(CASE WHEN a.status = 'completed' THEN 1 END)::float / 
         NULLIF(COUNT(a.id), 0) * 100), 2
    ) as completion_rate,
    SUM(CASE WHEN a.status = 'completed' AND s.price IS NOT NULL THEN s.price ELSE 0 END) as total_revenue
FROM appointments a
LEFT JOIN staff_members sm ON a.staff_member_id = sm.id
LEFT JOIN services s ON a.service_id = s.id
WHERE a.user_id = auth.uid()
GROUP BY sm.id, sm.name
ORDER BY total_appointments DESC;

-- Popular time slots view
CREATE OR REPLACE VIEW popular_time_slots AS
SELECT 
    EXTRACT(HOUR FROM appointment_date) as hour,
    COUNT(*) as booking_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
FROM appointments
WHERE user_id = auth.uid()
    AND appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM appointment_date)
ORDER BY hour;

-- Weekly patterns view
CREATE OR REPLACE VIEW weekly_patterns AS
SELECT 
    EXTRACT(DOW FROM appointment_date) as day_of_week,
    CASE EXTRACT(DOW FROM appointment_date)
        WHEN 0 THEN 'ראשון'
        WHEN 1 THEN 'שני'
        WHEN 2 THEN 'שלישי'
        WHEN 3 THEN 'רביעי'
        WHEN 4 THEN 'חמישי'
        WHEN 5 THEN 'שישי'
        WHEN 6 THEN 'שבת'
    END as day_name,
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
    ROUND(AVG(CASE WHEN status = 'completed' AND s.price IS NOT NULL THEN s.price ELSE 0 END), 2) as avg_revenue
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
WHERE a.user_id = auth.uid()
    AND a.appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY EXTRACT(DOW FROM appointment_date)
ORDER BY day_of_week;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON appointments(user_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_member ON appointments(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_services_user ON services(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_user ON staff_members(user_id);
