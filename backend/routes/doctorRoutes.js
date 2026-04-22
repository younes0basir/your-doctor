const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const cloudinary = require('cloudinary').v2;
const { protect, doctorOnly } = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Doctor Registration
router.post('/register', async (req, res) => {
    try {
        const {
            email,
            password,
            firstName: rawFirstName,
            lastName: rawLastName,
            speciality_id,
            experience_years,
            consultation_fee,
            specialty_description,
            degree,
            city,
            address
        } = req.body;
        const firstName = rawFirstName || req.body.firstname;
        const lastName = rawLastName || req.body.lastname;

        // Validate required fields
        const requiredFields = ['email', 'password', 'firstName', 'lastName', 'speciality_id', 
                              'experience_years', 'consultation_fee', 'degree', 'city', 'address'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Check if doctor already exists
        const [existingDoctor] = await db.promise().query(
            'SELECT * FROM doctor WHERE email = $1',
            [email]
        );

        if (existingDoctor.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new doctor
        const [result] = await db.promise().query(
            `INSERT INTO doctor (
                email, password, firstname, lastname, speciality_id,
                experience_years, consultation_fee, specialty_description,
                degree, city, address, role
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'doctor') RETURNING id`,
            [
                email, hashedPassword, firstName, lastName, speciality_id,
                experience_years, consultation_fee, specialty_description || '',
                degree, city, address
            ]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: result.insertId, role: 'doctor' },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Doctor registered successfully',
            token,
            doctor: {
                id: result.insertId,
                email,
                firstName,
                lastName,
                role: 'doctor'
            }
        });
    } catch (error) {
        console.error('Doctor registration error:', error);
        res.status(500).json({ 
            message: 'Error registering doctor',
            error: error.message 
        });
    }
});

// Doctor Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find doctor by email
        const [doctors] = await db.promise().query(
            'SELECT id, email, password, firstname AS "firstName", lastname AS "lastName", speciality_id, role FROM doctor WHERE email = $1',
            [email]
        );

        if (doctors.length > 0) {
            const doctor = doctors[0];
            // Compare password using bcrypt
            const isPasswordValid = await bcrypt.compare(password, doctor.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: doctor.id, role: 'doctor' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Remove password from doctor object before sending
            delete doctor.password;

            return res.json({ token, doctor });
        }

        // If not a doctor, try admin
        const [admins] = await db.promise().query(
            'SELECT id, email, password FROM admin WHERE email = $1',
            [email]
        );

        if (admins.length > 0) {
            const admin = admins[0];
            const isPasswordValid = await bcrypt.compare(password, admin.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: admin.id, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Remove password from admin object before sending
            delete admin.password;

            // Add role property for frontend check
            admin.role = 'admin';

            return res.json({ token, admin });
        }

        // If not doctor or admin, try assistant
        const [assistants] = await db.promise().query(
            'SELECT id, email, password, doctor_id, firstname AS "firstName", lastname AS "lastName" FROM assistant WHERE email = $1',
            [email]
        );

        if (assistants.length > 0) {
            const assistant = assistants[0];
            const isPasswordValid = await bcrypt.compare(password, assistant.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: assistant.id, doctor_id: assistant.doctor_id, role: 'assistant' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            delete assistant.password;
            return res.json({ token, assistant });
        }

        // If neither doctor, admin, nor assistant found
        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Specialities
router.get('/specialities', async (req, res) => {
    try {
        const [specialities] = await db.promise().query('SELECT * FROM specialities');
        res.json(specialities);
    } catch (error) {
        console.error('Error fetching specialities:', error);
        res.status(500).json({ message: 'Error fetching specialities' });
    }
});

// Get all doctors with their specialties
router.get('/', async (req, res) => {
    try {
        const specialityId = req.query.speciality;
        let query = `
            SELECT 
                d.id,
                d.firstname as "firstName",
                d.lastname as "lastName",
                d.speciality_id,
                d.experience_years,
                d.consultation_fee,
                d.specialty_description,
                d.city,
                d.image_url,
                d.status,
                s.name as "specialityName"
            FROM doctor d 
            JOIN specialities s ON d.speciality_id = s.id
        `;
        
        const params = [];
        if (specialityId) {
            query += ' WHERE d.speciality_id = $1';
            params.push(specialityId);
        }
        
        query += ' ORDER BY d.experience_years DESC';
        
        console.log('Executing query:', query);
        console.log('With params:', params);
        
        const [doctors] = await db.promise().query(query, params);
        console.log('Query result:', doctors);
        
        if (!doctors || !Array.isArray(doctors)) {
            console.error('Invalid query result:', doctors);
            return res.status(500).json({ 
                message: 'Error fetching doctors: Invalid database response',
                doctors: []
            });
        }
        
        // Ensure all numeric values are properly formatted
        const formattedDoctors = doctors.map(doctor => ({
            ...doctor,
            experience_years: Number(doctor.experience_years),
            consultation_fee: Number(doctor.consultation_fee),
            speciality_id: Number(doctor.speciality_id)
        }));
        
        res.json(formattedDoctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ 
            message: 'Error fetching doctors',
            error: error.message,
            doctors: []
        });
    }
});

// Get doctor profile (with specialization name)
router.get('/profile', protect, doctorOnly, async (req, res) => {
    try {
        const [doctors] = await db.promise().query(
            `SELECT d.id, d.email, d.firstname AS "firstName", d.lastname AS "lastName", d.speciality_id, d.experience_years, d.consultation_fee, d.specialty_description, d.degree, d.city, d.address, s.name AS specialization
             FROM doctor d
             JOIN specialities s ON d.speciality_id = s.id
             WHERE d.id = $1`,
            [req.user.id]
        );

        if (doctors.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json(doctors[0]);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Example: When fetching patients for a doctor, include cin
// SELECT id, firstName, lastName, email, cin FROM patient WHERE ...

// Test endpoint to check database connection
router.get('/test-connection', async (req, res) => {
    try {
        const [result] = await db.promise().query('SELECT COUNT(*) as count FROM doctor');
        res.json({
            message: 'Database connection successful',
            doctorCount: result[0].count,
            connectionInfo: {
                database: process.env.DB_NAME || 'pfe',
                host: process.env.DB_HOST || 'localhost'
            }
        });
    } catch (error) {
        console.error('Database connection test error:', error);
        res.status(500).json({
            message: 'Database connection test failed',
            error: error.message
        });
    }
});

// Get doctor's office queue by doctorId (for assistant access)
router.get('/queue/:doctorId', async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
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
        res.status(500).json({ message: "Error fetching office queue" });
    }
});

// Get all appointments for a specific doctor (for assistant access)
router.get('/:doctorId/appointments', async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const [appointments] = await db.promise().query(
            `SELECT a.*, p.firstName, p.lastName, p.email
             FROM appointments a
             JOIN patient p ON a.patient_id = p.id
             WHERE a.doctor_id = $1
             ORDER BY a.appointment_date DESC`,
            [doctorId]
        );
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments" });
    }
});

// Get doctor by ID (must be last to avoid conflicts with more specific routes)
router.get('/:id', async (req, res) => {
    try {
        const [doctor] = await db.promise().query(
            `SELECT d.*, s.name as specialityName 
             FROM doctor d 
             JOIN specialities s ON d.speciality_id = s.id 
             WHERE d.id = $1`,
            [req.params.id]
        );

        if (!doctor || doctor.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Remove sensitive information
        const { password, ...doctorData } = doctor[0];
        res.json(doctorData);
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({ message: 'Error fetching doctor details' });
    }
});

// Upload profile image
router.post('/upload-image', protect, doctorOnly, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        try {
            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'doctor_profiles',
                width: 500,
                crop: 'scale'
            });

            // Delete the temporary file
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting temporary file:', err);
            });

            // Get the current doctor's image public_id
            const [doctor] = await db.promise().query(
                'SELECT image_public_id FROM doctor WHERE id = $1',
                [req.user.id]
            );

            // If doctor already has an image, delete it from Cloudinary
            if (doctor[0]?.image_public_id) {
                try {
                    await cloudinary.uploader.destroy(doctor[0].image_public_id);
                } catch (deleteError) {
                    console.error('Error deleting old image:', deleteError);
                }
            }

            // Update doctor's profile with new image info
            await db.promise().query(
                'UPDATE doctor SET image_url = $1, image_public_id = $2 WHERE id = $3',
                [result.secure_url, result.public_id, req.user.id]
            );

            res.json({
                image_url: result.secure_url,
                public_id: result.public_id
            });
        } catch (cloudinaryError) {
            console.error('Cloudinary error:', cloudinaryError);
            return res.status(500).json({ 
                message: 'Error uploading image to cloud storage',
                details: cloudinaryError.message
            });
        }
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ 
            message: 'Error uploading image',
            details: error.message
        });
    }
});

// Update doctor profile
router.put('/profile', protect, doctorOnly, async (req, res) => {
    let connection;
    try {
        console.log('Starting profile update...');
        const {
            firstName,
            lastName,
            specialty_description,
            consultation_fee,
            city,
            address,
            experience_years,
            degree
        } = req.body;

        console.log('Request body:', {
            firstName,
            lastName,
            specialty_description,
            consultation_fee,
            city,
            address,
            experience_years,
            degree
        });
        console.log('User ID from token:', req.user.id);

        // Get a connection from the pool
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        try {
            // First get the current doctor data
            console.log('Fetching current doctor data...');
            const [currentDoctor] = await connection.query(
                'SELECT * FROM doctor WHERE id = $1',
                [req.user.id]
            );

            console.log('Current doctor data:', currentDoctor[0]);

            if (!currentDoctor[0]) {
                await connection.rollback();
                return res.status(404).json({ message: 'Doctor not found' });
            }

            // Validate required fields
            if (!firstName || !lastName || !city || !address || !experience_years || !degree) {
                await connection.rollback();
                return res.status(400).json({
                    message: 'Required fields missing',
                    details: {
                        firstName: !firstName,
                        lastName: !lastName,
                        city: !city,
                        address: !address,
                        experience_years: !experience_years,
                        degree: !degree
                    }
                });
            }

            // Prepare update data, keeping existing values for fields not being updated
            const updateData = {
                firstName: (firstName || '').trim(),
                lastName: (lastName || '').trim(),
                specialty_description: (specialty_description || '').trim() || currentDoctor[0].specialty_description || '',
                consultation_fee: consultation_fee !== undefined && consultation_fee !== '' && consultation_fee !== null
                    ? parseFloat(consultation_fee)
                    : currentDoctor[0].consultation_fee,
                city: (city || '').trim(),
                address: (address || '').trim(),
                speciality_id: currentDoctor[0].speciality_id,
                experience_years: parseInt(experience_years) || 0,
                degree: (degree || '').trim()
            };

            console.log('Update data prepared:', updateData);

            // Update profile information
            const [result] = await connection.query(
                `UPDATE doctor
                SET firstname = $1,
                    lastname = $2,
                    specialty_description = $3,
                    consultation_fee = $4,
                    city = $5,
                    address = $6,
                    speciality_id = $7,
                    experience_years = $8,
                    degree = $9
                WHERE id = $10`,
                [
                    updateData.firstName,
                    updateData.lastName,
                    updateData.specialty_description,
                    updateData.consultation_fee,
                    updateData.city,
                    updateData.address,
                    updateData.speciality_id,
                    updateData.experience_years,
                    updateData.degree,
                    req.user.id
                ]
            );

            console.log('Update result:', result);

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Doctor not found' });
            }

            // Get updated doctor data with proper column aliases
            console.log('Fetching updated doctor data...');
            const [updatedDoctor] = await connection.query(
                `SELECT id, email, firstname AS "firstName", lastname AS "lastName", speciality_id,
                    experience_years, consultation_fee, specialty_description, degree, city, address,
                    image_url, image_public_id, status, role
                 FROM doctor WHERE id = $1`,
                [req.user.id]
            );

            if (!updatedDoctor[0]) {
                await connection.rollback();
                return res.status(404).json({ message: 'Updated doctor not found' });
            }

            await connection.commit();
            console.log('Updated doctor data:', updatedDoctor[0]);

            res.json(updatedDoctor[0]);
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            throw error;
        }
    } catch (error) {
        console.error('Profile update error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            errno: error.errno
        });
        res.status(500).json({
            message: 'Error updating profile',
            details: error.message,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            errno: error.errno
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Change password
router.put('/change-password', protect, doctorOnly, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const [doctors] = await db.promise().query(
            'SELECT * FROM doctor WHERE id = $1',
            [req.user.id]
        );

        if (doctors.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const validPassword = await bcrypt.compare(currentPassword, doctors[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.promise().query(
            'UPDATE doctor SET password = $1 WHERE id = $2',
            [hashedPassword, req.user.id]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});


// Get doctor dashboard stats (real info for dashboard)
router.get('/stats', protect, doctorOnly, async (req, res) => {
    try {
        const doctorId = req.user.id;
        // Today's date
        const today = new Date().toISOString().slice(0, 10);

        // Get today's appointments
        const [[{ todayAppointments }]] = await db.promise().query(
            `SELECT COUNT(*) AS "todayAppointments"
             FROM appointments
             WHERE doctor_id = $1 AND appointment_date::date = $2::date`,
            [doctorId, today]
        );

        // Get this week's appointments
        const [[{ weekAppointments }]] = await db.promise().query(
            `SELECT COUNT(*) AS "weekAppointments"
             FROM appointments
             WHERE doctor_id = $1
               AND DATE_TRUNC('week', appointment_date) = DATE_TRUNC('week', CURRENT_DATE)`,
            [doctorId]
        );

        // Get last week's appointments for change calculation
        const [[{ lastWeekAppointments }]] = await db.promise().query(
            `SELECT COUNT(*) AS "lastWeekAppointments"
             FROM appointments
             WHERE doctor_id = $1
               AND DATE_TRUNC('week', appointment_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')`,
            [doctorId]
        );

        // Get total and new patients
        const [[{ totalPatients }]] = await db.promise().query(
            `SELECT COUNT(DISTINCT patient_id) AS "totalPatients" FROM appointments WHERE doctor_id = $1`,
            [doctorId]
        );
        const [[{ newPatients }]] = await db.promise().query(
            `SELECT COUNT(DISTINCT patient_id) AS "newPatients"
             FROM appointments
             WHERE doctor_id = $1 AND appointment_date::date = $2::date`,
            [doctorId, today]
        );

        // Get tasks (pending/completed appointments)
        const [[tasks]] = await db.promise().query(
            `SELECT 
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending, 
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed 
             FROM appointments WHERE doctor_id = $1`,
            [doctorId]
        );

        // Calculate change in appointments compared to last week
        const change = lastWeekAppointments
            ? weekAppointments - lastWeekAppointments
            : weekAppointments;

        res.json({
            appointments: {
                today: todayAppointments || 0,
                week: weekAppointments || 0,
                change: change || 0
            },
            patients: {
                total: totalPatients || 0,
                new: newPatients || 0
            },
            tasks: {
                pending: Number(tasks.pending) || 0,
                completed: Number(tasks.completed) || 0
            }
        });
    } catch (error) {
        console.error('Error fetching doctor stats:', error);
        res.status(500).json({ message: 'Error fetching doctor stats' });
    }
});

module.exports = router;
