USE pfe;

-- Update appointments table to include in_progress status
ALTER TABLE appointments 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'in_progress', 'canceled', 'completed') DEFAULT 'pending';

-- Add indexes for better performance
CREATE INDEX idx_appointment_status ON appointments(status);
CREATE INDEX idx_appointment_date ON appointments(appointment_date);

-- Add trigger to automatically add confirmed appointments to queue
DELIMITER //
CREATE TRIGGER after_appointment_confirm 
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        INSERT INTO queue_entries (
            appointment_id,
            doctor_id,
            patient_id,
            queue_position,
            status
        )
        SELECT 
            NEW.id,
            NEW.doctor_id,
            NEW.patient_id,
            COALESCE(
                (SELECT MAX(queue_position) + 1 
                 FROM queue_entries 
                 WHERE doctor_id = NEW.doctor_id 
                 AND DATE(entry_time) = CURDATE()),
                1
            ),
            'waiting';
    END IF;
END;
//
DELIMITER ;

-- Add trigger to update queue positions when an appointment starts
DELIMITER //
CREATE TRIGGER after_appointment_start
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
        -- Update the queue entry status
        UPDATE queue_entries 
        SET status = 'in_progress',
            start_time = CURRENT_TIMESTAMP
        WHERE appointment_id = NEW.id;

        -- Reorder remaining queue positions
        UPDATE queue_entries 
        SET queue_position = queue_position - 1
        WHERE doctor_id = NEW.doctor_id 
        AND status = 'waiting'
        AND queue_position > (
            SELECT original_position FROM (
                SELECT queue_position as original_position 
                FROM queue_entries 
                WHERE appointment_id = NEW.id
            ) as subquery
        );
    END IF;
END;
//
DELIMITER ;

-- Add trigger to mark queue entry as completed
DELIMITER //
CREATE TRIGGER after_appointment_complete
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE queue_entries 
        SET status = 'completed',
            completion_time = CURRENT_TIMESTAMP
        WHERE appointment_id = NEW.id;
    END IF;
END;
//
DELIMITER ;
