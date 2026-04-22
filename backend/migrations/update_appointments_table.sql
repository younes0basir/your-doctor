-- Backup existing appointments
CREATE TABLE appointments_backup AS SELECT * FROM appointments;

-- Drop existing table
DROP TABLE appointments;

-- Create new appointments table with updated schema
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    type ENUM('physical', 'video') NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'canceled') DEFAULT 'pending',
    is_in_queue ENUM('not_inqueue', 'pending', 'in_queue') DEFAULT 'not_inqueue',
    queue_position INT DEFAULT NULL,
    meeting_link VARCHAR(255) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctor(id),
    FOREIGN KEY (patient_id) REFERENCES patient(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restore data from backup
INSERT INTO appointments (
    id, doctor_id, patient_id, appointment_date, type, status, 
    meeting_link, createdAt, updatedAt
)
SELECT 
    id, doctor_id, patient_id, appointment_date, type, 
    CASE 
        WHEN status = 'confirmed' THEN 'confirmed'
        WHEN status = 'completed' THEN 'completed'
        WHEN status = 'canceled' THEN 'canceled'
        ELSE 'pending'
    END as status,
    meeting_link, createdAt, updatedAt
FROM appointments_backup;

-- Update queue status for confirmed appointments
UPDATE appointments 
SET is_in_queue = TRUE,
    queue_position = (
        SELECT position 
        FROM (
            SELECT id, @row_number:=@row_number+1 as position
            FROM appointments a, (SELECT @row_number:=0) r
            WHERE status = 'confirmed'
            ORDER BY appointment_date
        ) as subquery
        WHERE subquery.id = appointments.id
    )
WHERE status = 'confirmed';

-- Create indexes
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_queue ON appointments(doctor_id, is_in_queue, queue_position);

-- Drop backup table
DROP TABLE appointments_backup;
