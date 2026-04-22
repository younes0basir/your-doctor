const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get the two latest activities (account creation or appointment creation)
router.get('/latest', async (req, res) => {
  try {
    // Get latest account creation (patients and doctors)
    const [latestAccount] = await db.promise().query(`
      SELECT 
        id, 
        firstName, 
        lastName, 
        email, 
        'patient' AS type, 
        createdAt 
      FROM patient
      UNION ALL
      SELECT 
        id, 
        firstName, 
        lastName, 
        email, 
        'doctor' AS type, 
        createdAt 
      FROM doctor
      ORDER BY createdAt DESC
      LIMIT 1
    `);

    // Get latest appointment creation
    const [latestAppointment] = await db.promise().query(`
      SELECT 
        a.id, 
        a.createdAt, 
        a.status,
        CONCAT(d.firstName, ' ', d.lastName) AS doctorName,
        CONCAT(p.firstName, ' ', p.lastName) AS patientName
      FROM appointments a
      JOIN doctor d ON a.doctor_id = d.id
      JOIN patient p ON a.patient_id = p.id
      ORDER BY a.createdAt DESC
      LIMIT 1
    `);

    // Build activity array (most recent first)
    let activities = [];
    if (latestAccount.length > 0) {
      const acc = latestAccount[0];
      activities.push({
        type: 'user',
        createdAt: acc.createdAt,
        name: `${acc.firstName || ''} ${acc.lastName || ''}`.trim(),
        role: acc.type,
        email: acc.email
      });
    }
    if (latestAppointment.length > 0) {
      const appt = latestAppointment[0];
      activities.push({
        type: 'appointment',
        createdAt: appt.createdAt,
        doctor: appt.doctorName,
        patient: appt.patientName,
        status: appt.status
      });
    }
    // Sort by createdAt descending and take up to 2
    activities = activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 2);

    res.json(activities);
  } catch (err) {
    console.error('Activity fetch error:', err);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
});

module.exports = router;
