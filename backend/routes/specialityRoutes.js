const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all specialities
router.get('/', async (req, res) => {
    try {
        const [specialities] = await db.promise().query('SELECT * FROM specialities');
        res.json(specialities);
    } catch (error) {
        console.error('Error fetching specialities:', error);
        res.status(500).json({ message: 'Error fetching specialities' });
    }
});

module.exports = router;
