USE pfe;

-- Add queue_position to appointments table
ALTER TABLE appointments 
ADD COLUMN queue_position INT DEFAULT NULL,
ADD COLUMN is_in_queue BOOLEAN DEFAULT FALSE;

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    prescription_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(id),
    FOREIGN KEY (patient_id) REFERENCES patient(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for prescriptions
CREATE INDEX idx_prescriptions_appointment ON prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);

-- Update appointments status enum to include 'in_progress'
ALTER TABLE appointments 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'in_progress', 'canceled', 'completed') DEFAULT 'pending';
