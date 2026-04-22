const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get doctor from token
            const [doctors] = await db.promise().query(
                'SELECT id, email, firstName, lastName FROM doctor WHERE id = ?',
                [decoded.id]
            );

            if (doctors.length === 0) {
                return res.status(401).json({ message: 'Doctor not found in database' });
            }

            // Add doctor info to request object
            req.user = {
                ...doctors[0],
                role: 'doctor' // Always set role to 'doctor' for doctor routes
            };
            next();
        } catch (jwtError) {
            return res.status(401).json({ 
                message: 'Invalid token',
                details: jwtError.message
            });
        }
    } catch (error) {
        res.status(401).json({ 
            message: 'Authentication failed',
            details: error.message
        });
    }
};

const doctorOnly = (req, res, next) => {
    if (req.user && req.user.role === 'doctor') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Doctors only.' });
    }
};

module.exports = { protect, doctorOnly };
