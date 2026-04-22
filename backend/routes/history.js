const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /doctor/:doctorId/patient/:patientId/history
router.get('/doctor/:doctorId/patient/:patientId/history', async (req, res) => {
    const { doctorId, patientId } = req.params;
    try {
        const [rows] = await db.promise().query(
            `SELECT 
                ph.date AS history_date,
                ph.diagnosis,
                p.firstName AS patientFirstName,
                p.lastName AS patientLastName,
                d.firstName AS doctorFirstName,
                d.lastName AS doctorLastName,
                pr.prescription_text,
                pr.created_at AS prescription_date,
                a.appointment_date
            FROM patient_history ph
            JOIN patient p ON ph.patient_id = p.id
            JOIN doctor d ON ph.doctor_id = d.id
            JOIN appointments a ON ph.appointment_id = a.id
            LEFT JOIN prescriptions pr ON ph.appointment_id = pr.appointment_id
            WHERE ph.doctor_id = $1 AND ph.patient_id = $2
            ORDER BY ph.date DESC`,
            [doctorId, patientId]
        );
        res.json(rows);
    } catch (error) {
        // More detailed error logging
        console.error('Error fetching patient history:', {
            message: error.message,
            stack: error.stack,
            doctorId,
            patientId
        });
        res.status(500).json({ 
            message: 'Error fetching patient history', 
            details: error.message,
            stack: error.stack,
            doctorId,
            patientId
        });
    }
});

module.exports = router;
