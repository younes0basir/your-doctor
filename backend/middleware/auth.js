const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = (req, res, next) => {
    // Check for patient, doctor, assistant, and admin tokens
    const patientToken = req.headers['patient-token'];
    const doctorToken = req.headers['doctor-token'];
    const assistantToken = req.headers['assistant-token'];
    const adminToken = req.headers['admin-token'];
    const token = patientToken || doctorToken || assistantToken || adminToken;
    
    if (!token) {
        return res.status(401).json({ message: "Token d'authentification requis" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        // Set token type for role-based middleware
        if (adminToken) {
            req.tokenType = 'admin';
        } else if (doctorToken) {
            req.tokenType = 'doctor';
        } else if (assistantToken) {
            req.tokenType = 'assistant';
        } else {
            req.tokenType = 'patient';
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide" });
    }
};

const isPatientOrAssistant = (req, res, next) => {
    if (req.tokenType === 'patient' && (req.user.role === 'patient' || req.user.role === 'assistant')) {
        next();
    } else {
        res.status(403).json({ message: "Accès non autorisé" });
    }
};

const doctorOnly = async (req, res, next) => {
    if (req.tokenType !== 'doctor') {
        return res.status(403).json({ message: "Accès réservé aux médecins" });
    }

    try {
        // Check if user exists in doctor table
        const [doctors] = await db.promise().query(
            'SELECT id, role FROM doctor WHERE id = $1',
            [req.user.id]
        );

        if (doctors.length > 0) {
            next();
        } else {
            res.status(403).json({ message: "Accès réservé aux médecins" });
        }
    } catch (error) {
        console.error('Doctor verification error:', error);
        res.status(500).json({ message: "Erreur lors de la vérification du médecin" });
    }
};

const adminOnly = (req, res, next) => {
    if (
        req.tokenType === 'admin' ||
        (req.user && (req.user.role === 'admin' || req.user.isAdmin))
    ) {
        return next();
    }
    return res.status(403).json({ message: 'Admin access only' });
};

module.exports = {
    protect,
    isPatientOrAssistant,
    doctorOnly,
    adminOnly
};
