const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, doctorOnly } = require('../middleware/auth');

// Get all appointments for a doctor
router.get('/doctor/:doctorId', protect, doctorOnly, async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        // Verify the doctor is accessing their own appointments
        if (req.user.id !== parseInt(doctorId)) {
            return res.status(403).json({ message: "Not authorized to view these appointments" });
        }

        const [appointments] = await db.promise().query(
            `SELECT a.*, p.firstName, p.lastName, p.email, p.phoneNumber 
             FROM appointments a 
             JOIN patient p ON a.patient_id = p.id 
             WHERE a.doctor_id = $1 
             ORDER BY a.appointment_date DESC`,
            [doctorId]
        );
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching appointments" });
    }
});

// Get all appointments for a patient
router.get('/patient', protect, async (req, res) => {
    try {
        const patientId = req.user.id;
        const [appointments] = await db.promise().query(
            `SELECT a.*, d.firstName as doctor_firstName, d.lastName as doctor_lastName, 
                    d.speciality_id, s.name as specialityName,
                    CASE 
                        WHEN a.status = 'in_progress' THEN 'Currently with Doctor'
                        ELSE a.status 
                    END as display_status
             FROM appointments a 
             JOIN doctor d ON a.doctor_id = d.id 
             JOIN specialities s ON d.speciality_id = s.id
             WHERE a.patient_id = $1 
             ORDER BY a.appointment_date DESC`,
            [patientId]
        );
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching appointments" });
    }
});

// Create a new appointment
router.post('/', async (req, res) => {
    try {
        // Debug: Log incoming request body and headers
        console.log('POST /api/appointments body:', req.body);
        console.log('POST /api/appointments headers:', req.headers);

        const { doctor_id, patient_id, appointment_date, type } = req.body;

        // Accept tokens from doctor, assistant, or patient
        const doctorToken = req.headers['doctor-token'];
        const assistantToken = req.headers['assistant-token'];
        const patientToken = req.headers['patient-token'];
        let userRole = null;
        let userId = null;

        if (doctorToken) {
            const decoded = require('jsonwebtoken').verify(doctorToken, process.env.JWT_SECRET);
            userRole = 'doctor';
            userId = decoded.id;
        } else if (assistantToken) {
            const decoded = require('jsonwebtoken').verify(assistantToken, process.env.JWT_SECRET);
            userRole = 'assistant';
            userId = decoded.id;
        } else if (patientToken) {
            const decoded = require('jsonwebtoken').verify(patientToken, process.env.JWT_SECRET);
            userRole = 'patient';
            userId = decoded.id;
        } else if (req.user && req.user.id && req.user.role) {
            userRole = req.user.role;
            userId = req.user.id;
        } else {
            return res.status(401).json({ message: "No token provided" });
        }

        // Validate required fields
        if (!doctor_id || !patient_id || !appointment_date || !type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate type
        if (!['physical', 'video'].includes(type)) {
            return res.status(400).json({ message: "Type must be 'physical' or 'video'" });
        }

        // Only allow:
        // - patient to create for self
        // - doctor to create for their own patient
        // - assistant to create for their assigned doctor
        if (userRole === 'patient' && String(userId) !== String(patient_id)) {
            return res.status(403).json({ message: "Patients can only create appointments for themselves" });
        }
        if (userRole === 'doctor' && String(userId) !== String(doctor_id)) {
            return res.status(403).json({ message: "Doctors can only create appointments for themselves" });
        }
        if (userRole === 'assistant') {
            // Check if assistant is assigned to this doctor
            const [assistants] = await db.promise().query(
                'SELECT * FROM assistant WHERE id = $1 AND doctor_id = $2',
                [userId, doctor_id]
            );
            if (!assistants || assistants.length === 0) {
                return res.status(403).json({ message: "Assistant not assigned to this doctor" });
            }
        }

        const [result] = await db.promise().query(
            `INSERT INTO appointments (doctor_id, patient_id, appointment_date, type, status)
             VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
            [doctor_id, patient_id, appointment_date, type]
        );

        res.status(201).json({
            message: "Appointment created successfully",
            appointmentId: result.insertId
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: "Error creating appointment" });
    }
});

// Cancel appointment
router.put('/:id/cancel', async (req, res) => {
    const doctorToken = req.headers['doctor-token'];
    const assistantToken = req.headers['assistant-token'];
    const patientToken = req.headers['patient-token'];
    let userId = null;
    let isAssistant = false;
    let isPatient = false;
    let doctorId = null;

    try {
        if (doctorToken) {
            const decoded = require('jsonwebtoken').verify(doctorToken, process.env.JWT_SECRET);
            userId = decoded.id;
            isAssistant = false;
        } else if (assistantToken) {
            const decoded = require('jsonwebtoken').verify(assistantToken, process.env.JWT_SECRET);
            userId = decoded.id;
            isAssistant = true;
        } else if (patientToken) {
            const decoded = require('jsonwebtoken').verify(patientToken, process.env.JWT_SECRET);
            userId = decoded.id;
            isPatient = true;
        } else {
            return res.status(401).json({ message: "No token provided" });
        }

        const { id } = req.params;

        // Get appointment and doctor_id
        const [appointments] = await db.promise().query(
            'SELECT * FROM appointments WHERE id = $1',
            [id]
        );
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        doctorId = appointments[0].doctor_id;

        // If assistant, check assignment
        if (isAssistant) {
            const [assistants] = await db.promise().query(
                'SELECT * FROM assistant WHERE id = $1 AND doctor_id = $2',
                [userId, doctorId]
            );
            if (!assistants || assistants.length === 0) {
                return res.status(403).json({ message: "Not authorized" });
            }
        } else if (isPatient) {
            // If patient, check patient owns appointment
            if (userId !== appointments[0].patient_id) {
                return res.status(403).json({ message: "Not authorized" });
            }
        } else {
            // If doctor, check doctor owns appointment
            if (userId !== doctorId) {
                return res.status(403).json({ message: "Not authorized" });
            }
        }

        // Only allow cancellation if appointment is not already completed or canceled
        if (['completed', 'canceled'].includes(appointments[0].status)) {
            return res.status(400).json({ message: "Cannot cancel completed or already canceled appointments" });
        }

        await db.promise().query(
            'UPDATE appointments SET status = $1 WHERE id = $2',
            ['canceled', id]
        );

        res.json({ message: "Appointment cancelled successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error cancelling appointment", details: error.message });
    }
});

// Status Transition Matrix
const STATUS_TRANSITIONS = {
    'pending': ['confirmed', 'canceled', 'in_progress'],
    'confirmed': ['in_progress', 'completed', 'canceled'],
    'in_progress': ['completed', 'canceled'],
    'completed': [],
    'canceled': []
};

// Update appointment status with comprehensive validation
router.put('/:id/update-status', protect, async (req, res) => {
    const { id } = req.params;
    const { newStatus } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // Fetch current appointment details
        const [appointments] = await db.promise().query(
            `SELECT a.*, 
                    d.id as doctorId, 
                    p.id as patientId 
             FROM appointments a
             JOIN doctor d ON a.doctor_id = d.id
             JOIN patient p ON a.patient_id = p.id
             WHERE a.id = $1`,
            [id]
        );

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        const currentAppointment = appointments[0];

        // Authorization check
        const isDoctor = userRole === 'doctor' && userId === currentAppointment.doctorId;
        const isPatient = userRole === 'patient' && userId === currentAppointment.patientId;

        if (!isDoctor && !isPatient) {
            return res.status(403).json({ 
                message: "Not authorized to update this appointment",
                userRole: userRole,
                requiredRoles: ['doctor', 'patient']
            });
        }

        // Validate status transition
        const allowedTransitions = STATUS_TRANSITIONS[currentAppointment.status] || [];
        if (!allowedTransitions.includes(newStatus)) {
            return res.status(400).json({
                message: "Invalid status transition",
                currentStatus: currentAppointment.status,
                requestedStatus: newStatus,
                allowedTransitions: allowedTransitions
            });
        }

        // Perform status update
        await db.promise().query(
            'UPDATE appointments SET status = $1, updatedAt = CURRENT_TIMESTAMP WHERE id = $2',
            [newStatus, id]
        );

        res.json({ 
            message: "Appointment status updated successfully",
            oldStatus: currentAppointment.status,
            newStatus: newStatus
        });

    } catch (error) {
        console.error('Error updating appointment status:', {
            errorMessage: error.message,
            appointmentId: id,
            requestedStatus: newStatus,
            userId: userId
        });

        res.status(500).json({ 
            message: "Error updating appointment status",
            details: error.message
        });
    }
});

// Confirm appointment (doctors and assistants only)
router.put('/:id/confirm', async (req, res) => {
    // Accept both doctor-token and assistant-token
    const doctorToken = req.headers['doctor-token'];
    const assistantToken = req.headers['assistant-token'];
    let userId = null;
    let isAssistant = false;
    let doctorId = null;

    try {
        if (doctorToken) {
            const decoded = require('jsonwebtoken').verify(doctorToken, process.env.JWT_SECRET);
            userId = decoded.id;
            isAssistant = false;
        } else if (assistantToken) {
            const decoded = require('jsonwebtoken').verify(assistantToken, process.env.JWT_SECRET);
            userId = decoded.id;
            isAssistant = true;
        } else {
            return res.status(401).json({ message: "No token provided" });
        }

        const { id } = req.params;

        // Get appointment and doctor_id
        const [appointments] = await db.promise().query(
            'SELECT * FROM appointments WHERE id = $1',
            [id]
        );
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        doctorId = appointments[0].doctor_id;

        // If assistant, check assignment
        if (isAssistant) {
            const [assistants] = await db.promise().query(
                'SELECT * FROM assistant WHERE id = $1 AND doctor_id = $2',
                [userId, doctorId]
            );
            if (!assistants || assistants.length === 0) {
                return res.status(403).json({ message: "Not authorized" });
            }
        } else {
            // If doctor, check doctor owns appointment
            if (userId !== doctorId) {
                return res.status(403).json({ message: "Not authorized" });
            }
        }

        // Get the last queue position
        const [lastQueue] = await db.promise().query(
            `SELECT MAX(queue_position) as lastPosition 
             FROM appointments 
             WHERE doctor_id = $1 AND is_in_queue = 'in_queue'`,
            [doctorId]
        );
        const nextPosition = (lastQueue[0].lastPosition || 0) + 1;

        // Update appointment status and add to queue in one transaction
        await db.promise().query(
            `UPDATE appointments 
             SET status = 'confirmed',
                 is_in_queue = 'in_queue',
                 queue_position = \,
                 updatedAt = CURRENT_TIMESTAMP
             WHERE id = $1 AND status = 'pending'`,
            [nextPosition, id]
        );

        res.json({ message: "Appointment confirmed and added to queue successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error confirming appointment",
            details: error.message
        });
    }
});

// Get doctor's office queue
router.get('/queue/:doctorId', protect, doctorOnly, async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        // Verify the doctor is accessing their own queue
        if (req.user.id !== parseInt(doctorId)) {
            return res.status(403).json({ message: "Not authorized to view this queue" });
        }

        const [queuedAppointments] = await db.promise().query(
            `SELECT a.*, p.firstName, p.lastName, p.email, p.phoneNumber 
             FROM appointments a 
             JOIN patient p ON a.patient_id = p.id 
             WHERE a.doctor_id = $1 
             AND (
                (a.status = 'confirmed' AND a.is_in_queue != 'not_inqueue')
                OR a.is_in_queue = 'in_queue'
             )
             ORDER BY a.queue_position ASC, a.appointment_date ASC`,
            [doctorId]
        );
        res.json(queuedAppointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching office queue" });
    }
});

// Add appointment to queue
router.put('/:id/add-to-queue', protect, doctorOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = req.user.id;

        // Get the last queue position
        const [lastQueue] = await db.promise().query(
            `SELECT MAX(queue_position) as lastPosition 
             FROM appointments 
             WHERE doctor_id = $1 AND is_in_queue = 'in_queue'`,
            [doctorId]
        );

        const nextPosition = (lastQueue[0].lastPosition || 0) + 1;

        // Add to queue
        await db.promise().query(
            `UPDATE appointments 
             SET is_in_queue = 'in_queue', 
                 queue_position = $1,
                 status = 'canceled'
             WHERE id = $2 AND doctor_id = $3`,
            [nextPosition, id, doctorId]
        );

        res.json({ message: "Appointment added to queue successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding appointment to queue" });
    }
});

// Start appointment (move to in-progress)
router.put('/:id/start', protect, doctorOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = req.user.id;

        const [appointment] = await db.promise().query(
            'SELECT * FROM appointments WHERE id = $1 AND doctor_id = $2 AND status = $3',
            [id, doctorId, 'confirmed']
        );

        if (!appointment || appointment.length === 0) {
            return res.status(404).json({ message: "Confirmed appointment not found" });
        }

        // Update to in-progress but keep in queue
        await db.promise().query(
            `UPDATE appointments 
             SET status = 'in_progress'
             WHERE id = $1`,
            [id]
        );

        // Get updated appointment data
        const [updatedAppointment] = await db.promise().query(
            `SELECT a.*, d.firstName as doctor_firstName, d.lastName as doctor_lastName 
             FROM appointments a 
             JOIN doctor d ON a.doctor_id = d.id 
             WHERE a.id = $1`,
            [id]
        );

        // Emit update event to patient
        req.app.get('io').to(`patient_${appointment[0].patient_id}`).emit('appointment_update', {
            id: id,
            status: 'in_progress',
            message: 'Your appointment has started',
            appointment: updatedAppointment[0]
        });

        res.json({ message: "Appointment started successfully" });
    } catch (error) {
        console.error('Error starting appointment:', error);
        res.status(500).json({ message: "Error starting appointment" });
    }
});

// End an in-progress appointment
router.put('/:id/end', protect, doctorOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = req.user.id;

        // Verify the appointment exists and belongs to the doctor
        const [appointmentRows] = await db.promise().query(
            'SELECT * FROM appointments WHERE id = $1 AND doctor_id = $2 AND status = $3',
            [id, doctorId, 'in_progress']
        );

        if (!appointmentRows || appointmentRows.length === 0) {
            return res.status(404).json({ message: "In-progress appointment not found" });
        }
        const appointment = appointmentRows[0];

        // Update appointment status and remove from queue
        // FIX: Set is_in_queue to 'not_inqueue' (string), not boolean
        await db.promise().query(
            `UPDATE appointments 
             SET status = 'completed',
                 is_in_queue = 'not_inqueue',
                 queue_position = NULL
             WHERE id = $1`,
            [id]
        );

        // Reorder remaining queue positions
        await db.promise().query(
            `UPDATE appointments 
             SET queue_position = queue_position - 1
             WHERE doctor_id = $1 
             AND is_in_queue = 'in_queue' 
             AND queue_position > ?`,
            [doctorId, appointment.queue_position]
        );

        // --- Fetch latest prescription for this appointment ---
        const [prescriptions] = await db.promise().query(
            `SELECT id, prescription_text FROM prescriptions WHERE appointment_id = $1 ORDER BY id DESC LIMIT 1`,
            [appointment.id]
        );
        let prescriptionId = null;
        let diagnosis = null;
        if (prescriptions && prescriptions.length > 0) {
            prescriptionId = prescriptions[0].id;
            diagnosis = prescriptions[0].prescription_text;
        }

        // --- Insert into patient_history ---
        // FIX: Ensure doctor_id is included if required by your schema
        await db.promise().query(
            `INSERT INTO patient_history (patient_id, doctor_id, appointment_id, diagnosis, prescription_id, date)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [appointment.patient_id, appointment.doctor_id, appointment.id, diagnosis, prescriptionId]
        );
        // -----------------------------------

        // Get updated appointment data
        const [updatedAppointment] = await db.promise().query(
            `SELECT a.*, d.firstName as doctor_firstName, d.lastName as doctor_lastName 
             FROM appointments a 
             JOIN doctor d ON a.doctor_id = d.id 
             WHERE a.id = $1`,
            [id]
        );

        // Emit update event to patient
        req.app.get('io').to(`patient_${appointment.patient_id}`).emit('appointment_update', {
            id: id,
            status: 'completed',
            message: 'Your appointment has been completed',
            appointment: updatedAppointment[0]
        });

        res.json({ message: "Appointment completed successfully" });
    } catch (error) {
        console.error('Error ending appointment:', error);
        res.status(500).json({ message: "Error ending appointment", details: error.message });
    }
});

// Complete appointment
router.put('/:id/complete', protect, doctorOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = req.user.id;

        await db.promise().query(
            `UPDATE appointments 
             SET status = 'completed'
             WHERE id = $1 AND doctor_id = $2`,
            [id, doctorId]
        );

        res.json({ message: "Appointment completed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error completing appointment" });
    }
});

// Get a single appointment
router.get('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [appointments] = await db.promise().query(
            `SELECT a.*, 
                    p.firstName as patient_firstName, p.lastName as patient_lastName,
                    d.firstName as doctor_firstName, d.lastName as doctor_lastName
             FROM appointments a 
             JOIN patient p ON a.patient_id = p.id 
             JOIN doctor d ON a.doctor_id = d.id 
             WHERE a.id = $1 AND (a.patient_id = $2 OR a.doctor_id = $3)`,
            [id, userId, userId]
        );

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.json(appointments[0]);
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({ message: "Error fetching appointment" });
    }
});

// Allow CORS preflight for PATCH /:id/queue-status
router.options('/:id/queue-status', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,assistant-token');
    res.sendStatus(200);
});

// PATCH: Toggle is_in_queue status (for assistant use)
router.patch('/:id/queue-status', async (req, res) => {
    try {
        // Accept token from header
        const token = req.headers['assistant-token'];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        let decoded;
        try {
            decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const appointmentId = req.params.id;
        const { is_in_queue } = req.body;

        // Get appointment and doctor_id
        const [appointments] = await db.promise().query(
            'SELECT * FROM appointments WHERE id = $1',
            [appointmentId]
        );
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const appointment = appointments[0];

        // Only allow assistants of the doctor to update
        const [assistants] = await db.promise().query(
            'SELECT * FROM assistant WHERE id = $1 AND doctor_id = $2',
            [decoded.id, appointment.doctor_id]
        );
        if (!assistants || assistants.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (is_in_queue) {
            // Add to queue: set is_in_queue = 'in_queue' and assign next queue_position
            const [lastQueue] = await db.promise().query(
                `SELECT MAX(queue_position) as lastPosition 
                 FROM appointments 
                 WHERE doctor_id = $1 AND is_in_queue = 'in_queue'`,
                [appointment.doctor_id]
            );
            const nextPosition = (lastQueue[0].lastPosition || 0) + 1;
            await db.promise().query(
                `UPDATE appointments 
                 SET is_in_queue = 'in_queue', queue_position = $1 
                 WHERE id = $1`,
                [nextPosition, appointmentId]
            );
        } else {
            // Remove from queue: set is_in_queue = 'not_inqueue' and clear queue_position, reorder others
            const oldPosition = appointment.queue_position;
            await db.promise().query(
                `UPDATE appointments 
                 SET is_in_queue = 'not_inqueue', queue_position = NULL 
                 WHERE id = $1`,
                [appointmentId]
            );
            // Reorder remaining queue positions
            if (oldPosition) {
                await db.promise().query(
                    `UPDATE appointments 
                     SET queue_position = queue_position - 1
                     WHERE doctor_id = $1 
                     AND is_in_queue = 'in_queue' 
                     AND queue_position > ?`,
                    [appointment.doctor_id, oldPosition]
                );
            }
        }

        res.json({ message: 'Queue status updated successfully' });
    } catch (err) {
        console.error('Error updating queue status:', err);
        res.status(500).json({ message: 'Error updating queue status' });
    }
});

// Get all appointments for a doctor (assistant access)
router.get('/assistant/doctor/:doctorId', async (req, res) => {
    try {
        // Accept token from header
        const token = req.headers['assistant-token'];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        let decoded;
        try {
            decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const { doctorId } = req.params;

        // Check that assistant is assigned to this doctor
        const [assistants] = await db.promise().query(
            'SELECT * FROM assistant WHERE id = $1 AND doctor_id = $2',
            [decoded.id, doctorId]
        );
        if (!assistants || assistants.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Only show confirmed appointments
        const [appointments] = await db.promise().query(
            `SELECT a.*, p.firstName, p.lastName, p.email, p.phoneNumber 
             FROM appointments a 
             JOIN patient p ON a.patient_id = p.id 
             WHERE a.doctor_id = $1 
             AND a.status = 'confirmed'
             ORDER BY a.appointment_date DESC`,
            [doctorId]
        );
        res.json(appointments);
    } catch (error) {
        console.error('Assistant doctor appointments error:', error);
        res.status(500).json({ message: "Error fetching appointments" });
    }
});

// Update payment status for an appointment (doctor, patient, assistant, or admin)
router.put('/:id/payment-status', async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        // Accept tokens from doctor, patient, assistant, or admin
        const doctorToken = req.headers['doctor-token'];
        const patientToken = req.headers['patient-token'];
        const assistantToken = req.headers['assistant-token'];
        const adminToken = req.headers['admin-token'] || req.headers['authorization'];
        let userId = null;
        let userRole = null;
        let doctorId = null;

        // Determine user role and id
        if (doctorToken) {
            const decoded = require('jsonwebtoken').verify(doctorToken, process.env.JWT_SECRET);
            userId = decoded.id;
            userRole = 'doctor';
        } else if (patientToken) {
            const decoded = require('jsonwebtoken').verify(patientToken, process.env.JWT_SECRET);
            userId = decoded.id;
            userRole = 'patient';
        } else if (assistantToken) {
            const decoded = require('jsonwebtoken').verify(assistantToken, process.env.JWT_SECRET);
            userId = decoded.id;
            userRole = 'assistant';
        } else if (adminToken) {
            let tokenValue = adminToken;
            if (typeof tokenValue === 'string' && tokenValue.startsWith('Bearer ')) {
                tokenValue = tokenValue.replace('Bearer ', '').trim();
            }
            const decoded = require('jsonwebtoken').verify(tokenValue, process.env.JWT_SECRET);
            userId = decoded.id;
            userRole = decoded.role;
        } else if (req.user && req.user.id && req.user.role) {
            userId = req.user.id;
            userRole = req.user.role;
        } else {
            return res.status(401).json({ message: "No token provided" });
        }

        if (!['paid', 'unpaid'].includes(payment_status)) {
            return res.status(400).json({ message: "Invalid payment status" });
        }

        // Find appointment and check ownership
        const [appointments] = await db.promise().query(
            'SELECT * FROM appointments WHERE id = $1',
            [id]
        );
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        const appointment = appointments[0];

        // Authorization: doctor, patient, assistant assigned to this doctor, or admin
        const isDoctor = userRole === 'doctor' && String(userId) === String(appointment.doctor_id);
        const isPatient = userRole === 'patient' && String(userId) === String(appointment.patient_id);
        let isAssistant = false;
        if (userRole === 'assistant') {
            const [assistants] = await db.promise().query(
                'SELECT * FROM assistant WHERE id = $1 AND doctor_id = $2',
                [userId, appointment.doctor_id]
            );
            isAssistant = assistants && assistants.length > 0;
        }
        const isAdmin = userRole === 'admin';

        if (!(isDoctor || isPatient || isAssistant || isAdmin)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await db.promise().query(
            'UPDATE appointments SET payment_status = $1 WHERE id = $2',
            [payment_status, id]
        );

        res.json({ message: "Payment status updated successfully", payment_status });
    } catch (error) {
        res.status(500).json({ message: "Error updating payment status", details: error.message });
    }
});

// Update an appointment by id (assistant, doctor, or admin)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { doctor_id, patient_id, appointment_date, type, status } = req.body;

    // Accept tokens from doctor, assistant, or admin
    const doctorToken = req.headers['doctor-token'];
    const assistantToken = req.headers['assistant-token'];
    const adminToken = req.headers['admin-token'] || req.headers['authorization'];
    let userRole = null;
    let userId = null;

    try {
        if (doctorToken) {
            const decoded = require('jsonwebtoken').verify(doctorToken, process.env.JWT_SECRET);
            userRole = 'doctor';
            userId = decoded.id;
        } else if (assistantToken) {
            const decoded = require('jsonwebtoken').verify(assistantToken, process.env.JWT_SECRET);
            userRole = 'assistant';
            userId = decoded.id;
        } else if (adminToken) {
            let tokenValue = adminToken;
            if (typeof tokenValue === 'string' && tokenValue.startsWith('Bearer ')) {
                tokenValue = tokenValue.replace('Bearer ', '').trim();
            }
            const decoded = require('jsonwebtoken').verify(tokenValue, process.env.JWT_SECRET);
            userRole = decoded.role;
            userId = decoded.id;
        } else if (req.user && req.user.id && req.user.role) {
            userRole = req.user.role;
            userId = req.user.id;
        } else {
            return res.status(401).json({ message: "No token provided" });
        }

        // Validate required fields
        if (!doctor_id || !patient_id || !appointment_date || !type || !status) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!['physical', 'video'].includes(type)) {
            return res.status(400).json({ message: "Type must be 'physical' or 'video'" });
        }

        // Only allow:
        // - doctor to update their own appointments
        // - assistant to update for their assigned doctor
        // - admin
        if (userRole === 'doctor' && String(userId) !== String(doctor_id)) {
            return res.status(403).json({ message: "Doctors can only update their own appointments" });
        }
        if (userRole === 'assistant') {
            const [assistants] = await db.promise().query(
                'SELECT * FROM assistant WHERE id = $1 AND doctor_id = $2',
                [userId, doctor_id]
            );
            if (!assistants || assistants.length === 0) {
                return res.status(403).json({ message: "Assistant not assigned to this doctor" });
            }
        }

        // Validate appointment exists
        const [[appointment]] = await db.promise().query(
            'SELECT * FROM appointments WHERE id = $1',
            [id]
        );
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update appointment
        const [result] = await db.promise().query(
            'UPDATE appointments SET doctor_id=$1, patient_id=$2, appointment_date=$3, type=$4, status=$5 WHERE id=?',
            [doctor_id, patient_id, appointment_date, type, status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Return updated appointment
        const [updated] = await db.promise().query(
            `SELECT a.*, p.firstName, p.lastName, p.email
             FROM appointments a
             JOIN patient p ON a.patient_id = p.id
             WHERE a.id = $1`,
            [id]
        );
        res.json(updated[0]);
    } catch (err) {
        console.error('Update appointment error:', err);
        res.status(500).json({ message: 'Error updating appointment' });
    }
});

module.exports = router;
