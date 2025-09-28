-- הוספת עמודה לקישור תורים שנדחו
ALTER TABLE Appointments
ADD COLUMN IF NOT EXISTS rescheduled_to uuid REFERENCES Appointments(id);
