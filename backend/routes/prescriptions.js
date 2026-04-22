const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, doctorOnly } = require('../middleware/auth');

// Create a new prescription
router.post('/', protect, doctorOnly, async (req, res) => {
    try {
        const { appointmentId, prescription_text } = req.body;
        const doctorId = req.user.id;

        // Validate prescription_text
        if (!prescription_text || !prescription_text.trim()) {
            return res.status(400).json({ message: 'Prescription text is required' });
        }

        // Get patient ID from appointment
        const [appointment] = await db.promise().query(
            'SELECT patient_id FROM appointments WHERE id = $1 AND doctor_id = $2',
            [appointmentId, doctorId]
        );

        if (!appointment || appointment.length === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Create prescription
        const [result] = await db.promise().query(
            `INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, prescription_text)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [appointmentId, doctorId, appointment[0].patient_id, prescription_text]
        );

        // --- Ensure patient_history is updated ---
        const [history] = await db.promise().query(
            `SELECT id FROM patient_history WHERE appointment_id = $1`,
            [appointmentId]
        );

        if (history.length > 0) {
            // Update existing patient_history row
            await db.promise().query(
                `UPDATE patient_history 
                 SET prescription_id = $1, diagnosis = $2, doctor_id = $3
                 WHERE appointment_id = $4`,
                [result.insertId, prescription_text, doctorId, appointmentId]
            );
        } else {
            // Insert a new patient_history row if it doesn't exist
            await db.promise().query(
                `INSERT INTO patient_history (patient_id, doctor_id, appointment_id, diagnosis, prescription_id, date)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [appointment[0].patient_id, doctorId, appointmentId, prescription_text, result.insertId]
            );
        }
        // ----------------------------------------

        res.status(201).json({
            message: "Prescription created successfully",
            prescriptionId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating prescription" });
    }
});

// Get prescriptions by appointment
router.get('/appointment/:appointmentId', protect, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id;

        const [prescriptions] = await db.promise().query(
            `SELECT p.*, d.firstName as doctor_firstName, d.lastName as doctor_lastName
             FROM prescriptions p
             JOIN doctor d ON p.doctor_id = d.id
             WHERE p.appointment_id = $1
             AND (p.doctor_id = $2 OR p.patient_id = $3)`,
            [appointmentId, userId, userId]
        );

        res.json(prescriptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching prescriptions" });
    }
});

// Remove: Get patient's prescription history
router.get('/patient/:patientId', protect, doctorOnly, async (req, res) => {
    res.status(404).json({ message: 'Not available' });
});

module.exports = router;
