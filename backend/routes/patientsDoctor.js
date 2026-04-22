const express = require('express');
const db = require('../config/db');

const router = express.Router();

// GET /patients/doctor/:doctorId
router.get('/doctor/:doctorId', async (req, res) => {
    const doctorId = req.params.doctorId;
    try {
        const [rows] = await db.promise().query(
            `SELECT DISTINCT p.*
             FROM appointments a
             JOIN patient p ON a.patient_id = p.id
             WHERE a.doctor_id = $1`,
            [doctorId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

module.exports = router;