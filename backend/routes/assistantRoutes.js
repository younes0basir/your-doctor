const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { protect, doctorOnly, adminOnly } = require('../middleware/auth');

// Register assistant (doctor-token required, auto-assign to doctor)
router.post('/register', protect, doctorOnly, async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const firstName = req.body.firstName || req.body.firstname;
        const lastName = req.body.lastName || req.body.lastname;
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if assistant already exists
        const [existing] = await db.promise().query('SELECT id FROM assistant WHERE email = $1', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Assistant with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().query(
            'INSERT INTO assistant (doctor_id, email, password, firstname, lastname) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [req.user.id, email, hashedPassword, firstName, lastName]
        );
        res.status(201).json({ message: 'Assistant registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering assistant' });
    }
});

// Assistant login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.promise().query('SELECT id, email, password, doctor_id, firstname AS "firstName", lastname AS "lastName" FROM assistant WHERE email = $1', [email]);
        if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
        const assistant = rows[0];
        const valid = await bcrypt.compare(password, assistant.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign(
            { id: assistant.id, doctor_id: assistant.doctor_id, role: 'assistant' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        delete assistant.password;
        res.json({ token, assistant });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Get all assistants for the logged-in doctor
router.get('/my', protect, doctorOnly, async (req, res) => {
    try {
        const [assistants] = await db.promise().query(
            'SELECT id, email, firstname AS "firstName", lastname AS "lastName" FROM assistant WHERE doctor_id = $1',
            [req.user.id]
        );
        res.json(assistants);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching assistants' });
    }
});

// Get assistant profile (requires assistant-token)
router.get('/profile', async (req, res) => {
    try {
        // Accept token from header
        const token = req.headers['assistant-token'];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        // Find assistant by id
        const [rows] = await db.promise().query(
            'SELECT id, doctor_id, email, firstname AS "firstName", lastname AS "lastName" FROM assistant WHERE id = $1',
            [decoded.id]
        );
        if (!rows.length) {
            return res.status(404).json({ message: 'Assistant not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching assistant profile' });
    }
});

// ADMIN: Get all assistants
router.get('/admin/assistants', protect, adminOnly, async (req, res) => {
    try {
        const [assistants] = await db.promise().query(
            'SELECT id, doctor_id, email, firstname AS "firstName", lastname AS "lastName" FROM assistant'
        );
        res.json(assistants);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching assistants' });
    }
});

// ADMIN: Delete assistant by id
router.delete('/admin/assistants/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        await db.promise().query('DELETE FROM assistant WHERE id = $1', [id]);
        res.json({ message: 'Assistant deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting assistant' });
    }
});

// ADMIN: Update assistant by id
router.put('/admin/assistants/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { email, firstName, lastName, doctor_id } = req.body;
        // Only update provided fields
        const fields = [];
        const values = [];
        if (email) {
            fields.push('email = $1');
            values.push(email);
        }
        if (firstName) {
            fields.push('firstname = $2');
            values.push(firstName);
        }
        if (lastName) {
            fields.push('lastname = $3');
            values.push(lastName);
        }
        if (doctor_id) {
            fields.push('doctor_id = $4');
            values.push(doctor_id);
        }
        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        values.push(id);
        const [result] = await db.promise().query(
            `UPDATE assistant SET ${fields.join(', ')} WHERE id = $5`,
            values
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Assistant not found' });
        }
        // Return updated assistant
        const [rows] = await db.promise().query(
            'SELECT id, doctor_id, email, firstname AS "firstName", lastname AS "lastName" FROM assistant WHERE id = $1',
            [id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error updating assistant' });
    }
});

module.exports = router;
