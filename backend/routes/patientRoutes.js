const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware to protect patient routes
function patientProtect(req, res, next) {
  const token = req.headers['patient-token'];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Get logged-in patient profile
router.get('/profile', patientProtect, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT id, email, firstname as "firstName", lastname as "lastName", phoneNumber, age, cin FROM patient WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Patient not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update logged-in patient profile
router.put('/profile', patientProtect, async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, age, cin } = req.body;
    // Only allow updating these fields
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required.' });
    }
    await db.promise().query(
      'UPDATE patient SET firstName = $1, lastName = $2, phoneNumber = $3, age = $4, cin = $5 WHERE id = $6',
      [firstName, lastName, phoneNumber || null, age || null, cin || null, req.user.id]
    );
    // Return updated profile
    const [rows] = await db.promise().query(
      'SELECT id, email, firstname as "firstName", lastname as "lastName", phoneNumber, age, cin FROM patient WHERE id = $1',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
