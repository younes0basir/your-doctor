const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Assuming db is exported from a config file
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Endpoint to get real user data
router.get('/users', (req, res) => {
  const query = 'SELECT id, firstName AS name, role FROM patient';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Error fetching users');
    }
    res.json(results);
  });
});

// Admin registration endpoint
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    // Check if admin already exists
    const [existing] = await db.promise().query('SELECT id FROM admin WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query(
      'INSERT INTO admin (email, password) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ message: 'Error registering admin' });
  }
});
// ... existing code ...
// Get all appointments with doctor and patient info
router.get('/appointments', async (req, res) => {
  try {
    const [appointments] = await db.promise().query(`
      SELECT a.id, 
             CONCAT(d.firstName, ' ', d.lastName) AS doctorName,
             CONCAT(p.firstName, ' ', p.lastName) AS patientName,
             a.appointment_date,
             a.type,
             a.status,
             a.payment_status
      FROM appointments a
      JOIN doctor d ON a.doctor_id = d.id
      JOIN patient p ON a.patient_id = p.id
      ORDER BY a.appointment_date DESC
    `);
    res.json(appointments);
  } catch (err) {
    console.error('Admin appointments error:', err);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});
// ... existing code ...
// Admin dashboard overview endpoint
router.get('/overview', async (req, res) => {
  try {
    // Get total users (patients)
    const [users] = await db.promise().query('SELECT COUNT(*) AS count FROM patient');
    // Get total doctors
    const [doctors] = await db.promise().query('SELECT COUNT(*) AS count FROM doctor');
    // Get total appointments
    const [appointments] = await db.promise().query('SELECT COUNT(*) AS count FROM appointments');
    res.json({
      users: users[0].count,
      doctors: doctors[0].count,
      appointments: appointments[0].count
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ message: 'Error fetching overview data' });
  }
});

// Get all accounts (patients and doctors)
router.get('/accounts', async (req, res) => {
  try {
    // Get all patients
    const [patients] = await db.promise().query('SELECT id, firstname as "firstName", lastname as "lastName", email, role FROM patient');
    // Get all doctors
    const [doctors] = await db.promise().query('SELECT id, firstname as "firstName", lastname as "lastName", email, role, status FROM doctor');
    // Add type field for clarity
    const patientAccounts = patients.map(u => ({ ...u, type: 'patient' }));
    const doctorAccounts = doctors.map(u => ({ ...u, type: 'doctor' }));
    res.json([...patientAccounts, ...doctorAccounts]);
  } catch (err) {
    console.error('Admin accounts error:', err);
    res.status(500).json({ message: 'Error fetching accounts' });
  }
});

// Delete an account (patient or doctor)
// Route to hide a doctor
router.put('/doctors/:id/hide', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query(
      "UPDATE doctor SET status = 'hidden' WHERE id = $1", 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ message: 'Doctor hidden successfully' });
  } catch (err) {
    console.error('Admin hide doctor error:', err);
    res.status(500).json({ message: 'Error hiding doctor' });
  }
});

// Route to approve a doctor
router.put('/doctors/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query(
      "UPDATE doctor SET status = 'approved' WHERE id = $1", 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ message: 'Doctor approved successfully' });
  } catch (err) {
    console.error('Admin approve doctor error:', err);
    res.status(500).json({ message: 'Error approving doctor' });
  }
});

// Route to unhide a doctor
router.put('/doctors/:id/unhide', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query(
      "UPDATE doctor SET status = 'approved' WHERE id = $1", 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ message: 'Doctor unhidden successfully' });
  } catch (err) {
    console.error('Admin unhide doctor error:', err);
    res.status(500).json({ message: 'Error unhiding doctor' });
  }
});

router.delete('/accounts/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  if (type !== 'patient' && type !== 'doctor') {
    return res.status(400).json({ message: 'Invalid account type' });
  }
  try {
    const table = type === 'patient' ? 'patient' : 'doctor';
    const [result] = await db.promise().query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully` });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// Delete an appointment by id
router.delete('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query('DELETE FROM appointments WHERE id = $1', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ message: 'Error deleting appointment' });
  }
});

// Update an appointment by id
router.put('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { doctor_id, patient_id, appointment_date, type, status } = req.body;
  try {
    // Validate doctor and patient exist
    const [[doctor]] = await db.promise().query('SELECT id FROM doctor WHERE id = $1', [doctor_id]);
    const [[patient]] = await db.promise().query('SELECT id FROM patient WHERE id = $1', [patient_id]);
    if (!doctor) return res.status(400).json({ message: 'Doctor not found' });
    if (!patient) return res.status(400).json({ message: 'Patient not found' });
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
      `SELECT a.id, CONCAT(d.firstName, ' ', d.lastName) AS doctorName, CONCAT(p.firstName, ' ', p.lastName) AS patientName, a.appointment_date, a.type, a.status
       FROM appointments a
       JOIN doctor d ON a.doctor_id = d.id
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

// Update payment status for an appointment (admin only)
router.put('/appointments/:id/payment-status', async (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;
  if (!['paid', 'unpaid'].includes(payment_status)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }
  try {
    const [appointments] = await db.promise().query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    await db.promise().query(
      'UPDATE appointments SET payment_status = $1 WHERE id = $2',
      [payment_status, id]
    );
    res.json({ message: "Payment status updated successfully", payment_status });
  } catch (err) {
    res.status(500).json({ message: "Error updating payment status" });
  }
});

// Get all doctors (id, firstName, lastName)
router.get('/doctors', async (req, res) => {
  try {
    const [doctors] = await db.promise().query('SELECT id, firstname as "firstName", lastname as "lastName" FROM doctor');
    res.json(doctors);
  } catch (err) {
    console.error('Admin doctors error:', err);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// Get all patients (id, firstName, lastName, email, cin)
router.get('/patients', async (req, res) => {
  try {
    const [patients] = await db.promise().query('SELECT id, firstName, lastName, email, cin FROM patient');
    res.json(patients);
  } catch (err) {
    console.error('Admin patients error:', err);
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// Get a single appointment by id (for editing)
router.get('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().query(
      `SELECT a.*, d.firstName as doctorFirstName, d.lastName as doctorLastName, p.firstName as patientFirstName, p.lastName as patientLastName
       FROM appointments a
       JOIN doctor d ON a.doctor_id = d.id
       JOIN patient p ON a.patient_id = p.id
       WHERE a.id = $1`,
      [id]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get appointment error:', err);
    res.status(500).json({ message: 'Error fetching appointment' });
  }
});

// Financial analytics endpoint
router.get('/financial-analytics', async (req, res) => {
  try {
    // Total revenue
    const [[totalRevenue]] = await db.promise().query(`
      SELECT SUM(d.consultation_fee) AS total_revenue
      FROM appointments a
      JOIN doctor d ON a.doctor_id = d.id
      WHERE a.status = 'completed'
    `);

    // Revenue by doctor
    const [revenueByDoctor] = await db.promise().query(`
      SELECT d.id, d.firstName, d.lastName, SUM(d.consultation_fee) AS doctor_revenue, COUNT(a.id) AS completed_appointments
      FROM appointments a
      JOIN doctor d ON a.doctor_id = d.id
      WHERE a.status = 'completed'
      GROUP BY d.id
      ORDER BY doctor_revenue DESC
    `);

    // Revenue by speciality
    const [revenueBySpeciality] = await db.promise().query(`
      SELECT s.name AS speciality, SUM(d.consultation_fee) AS speciality_revenue
      FROM appointments a
      JOIN doctor d ON a.doctor_id = d.id
      JOIN specialities s ON d.speciality_id = s.id
      WHERE a.status = 'completed'
      GROUP BY s.id
      ORDER BY speciality_revenue DESC
    `);

    // Average consultation fee
    const [[avgFee]] = await db.promise().query(`
      SELECT AVG(consultation_fee) AS avg_fee FROM doctor
    `);

    // Revenue by month
    const [revenueByMonth] = await db.promise().query(`
      SELECT DATE_FORMAT(a.appointment_date, '%Y-%m') AS month, SUM(d.consultation_fee) AS revenue
      FROM appointments a
      JOIN doctor d ON a.doctor_id = d.id
      WHERE a.status = 'completed'
      GROUP BY month
      ORDER BY month DESC
    `);

    res.json({
      totalRevenue: totalRevenue.total_revenue || 0,
      revenueByDoctor,
      revenueBySpeciality,
      avgFee: avgFee.avg_fee || 0,
      revenueByMonth
    });
  } catch (err) {
    console.error('Financial analytics error:', err);
    res.status(500).json({ message: 'Error fetching financial analytics' });
  }
});

// Add this route to allow admin, doctor, or assistant to create new patients via POST /api/admin/patients
router.post('/patients', async (req, res) => {
  const jwt = require('jsonwebtoken');
  // Helper to get token from headers (case-insensitive)
  function getToken(headers, key) {
    const keys = Object.keys(headers);
    const foundKey = keys.find(k => k.toLowerCase() === key.toLowerCase());
    return foundKey ? headers[foundKey] : undefined;
  }
  // Try all possible token headers
  let adminToken = getToken(req.headers, 'admin-token');
  let doctorToken = getToken(req.headers, 'doctor-token');
  let assistantToken = getToken(req.headers, 'assistant-token');
  let bearerToken = null;
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
      bearerToken = authHeader.slice(7).trim();
    }
  }
  // Debug: Log incoming tokens and all headers
  console.log('POST /patients tokens:', {
    adminToken,
    doctorToken,
    assistantToken,
    bearerToken
  });
  console.log('All headers:', req.headers);

  let user = null;
  let role = null;
  try {
    let token = adminToken || doctorToken || assistantToken || bearerToken;
    if (!token) throw new Error('No token provided');
    user = jwt.verify(token, process.env.JWT_SECRET);
    // Accept admin, doctor, or assistant
    if (user.role === 'admin' || user.role === 'superadmin') role = 'admin';
    else if (user.role === 'doctor' || user.doctor_id || user.role === 'assistant' || user.assistant_id) role = 'staff';
    else role = null;
    console.log('Decoded user:', user);
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ message: 'Invalid or missing token', jwtError: err.message });
  }
  // Debug: Log role decision
  console.log('Role determined:', role);
  if (!role) {
    return res.status(401).json({ 
      message: 'Unauthorized', 
      debug: { user, adminToken, doctorToken, assistantToken, bearerToken, headers: req.headers }
    });
  }
  try {
    const { firstName, lastName, email, phoneNumber, age, cin, password } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }
    // Check if patient already exists by email or CIN (if provided)
    let existingQuery = 'SELECT id FROM patient WHERE email = $1';
    let params = [email];
    if (cin) {
      existingQuery += ' OR cin = $2';
      params.push(cin);
    }
    const [existing] = await db.promise().query(existingQuery, params);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Patient with this email or CIN already exists' });
    }
    // Insert patient (password can be empty or null)
    const [result] = await db.promise().query(
      'INSERT INTO patient (firstName, lastName, email, phoneNumber, age, cin, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [firstName, lastName, email, phoneNumber || null, age || null, cin || null, password || null]
    );
    // Return the created patient (without password)
    const [rows] = await db.promise().query(
      'SELECT id, firstname as "firstName", lastname as "lastName", email, phoneNumber, age, cin FROM patient WHERE id = $1',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error creating patient', details: err.message });
  }
});

// Create a new account (patient or doctor)
router.post('/accounts', async (req, res) => {
  const { type, ...data } = req.body;
  const bcrypt = require('bcrypt');
  if (type !== 'patient' && type !== 'doctor') {
    return res.status(400).json({ message: 'Invalid account type' });
  }
  try {
    if (type === 'patient') {
      const { firstName, lastName, email, password, phoneNumber, age, cin } = data;
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: 'First name, last name, and email are required' });
      }
      // Check if patient exists
      const [existing] = await db.promise().query(
        'SELECT id FROM patient WHERE email = $1 OR cin = $2',
        [email, cin || '']
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Patient with this email or CIN already exists' });
      }
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      const [result] = await db.promise().query(
        'INSERT INTO patient (firstName, lastName, email, password, phoneNumber, age, cin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [firstName, lastName, email, hashedPassword, phoneNumber || null, age || null, cin || null]
      );
      const [rows] = await db.promise().query(
        'SELECT id, firstname as "firstName", lastname as "lastName", email, phoneNumber, age, cin FROM patient WHERE id = $1',
        [result.insertId]
      );
      return res.status(201).json(rows[0]);
    } else if (type === 'doctor') {
      const {
        firstName, lastName, email, password, speciality_id,
        experience_years, consultation_fee, specialty_description,
        degree, city, address
      } = data;
      if (!firstName || !lastName || !email || !password || !speciality_id || !experience_years || !consultation_fee || !degree || !city || !address) {
        return res.status(400).json({ message: 'Missing required doctor fields' });
      }
      // Check if doctor exists
      const [existing] = await db.promise().query(
        'SELECT id FROM doctor WHERE email = $1',
        [email]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Doctor with this email already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await db.promise().query(
        `INSERT INTO doctor (
          email, password, firstName, lastName, speciality_id,
          experience_years, consultation_fee, specialty_description,
          degree, city, address, role, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'doctor', 'approved') RETURNING id`,
        [
          email, hashedPassword, firstName, lastName, speciality_id,
          experience_years, consultation_fee, specialty_description || '',
          degree, city, address
        ]
      );
      const [rows] = await db.promise().query(
        'SELECT id, "firstName", "lastName", email, speciality_id, experience_years, consultation_fee, degree, city, address FROM doctor WHERE id = $1',
        [result.insertId]
      );
      return res.status(201).json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error creating account', details: err.message });
  }
});

// Create a new assistant (admin only)
router.post('/assistants/admin/assistants', async (req, res) => {
  const { email, password, firstName, lastName, doctor_id } = req.body;
  const bcrypt = require('bcrypt');
  if (!email || !password || !firstName || !lastName || !doctor_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    // Check if assistant already exists
    const [existing] = await db.promise().query(
      'SELECT id FROM assistant WHERE email = $1',
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Assistant with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO assistant (doctor_id, email, password, firstName, lastName) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [doctor_id, email, hashedPassword, firstName, lastName]
    );
    const [rows] = await db.promise().query(
      'SELECT id, doctor_id, email, firstName, lastName FROM assistant WHERE id = $1',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error creating assistant', details: err.message });
  }
});

// Generate temp token for password reset
router.post('/temp-token/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const validTypes = ['patient', 'doctor', 'assistant', 'admin'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid user type' });
  }

  try {
    // Check if user exists
    const table = type === 'admin' ? 'admin' : type;
    const [user] = await db.promise().query(`SELECT id FROM ${table} WHERE id = $1`, [id]);
    
    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Insert temp token
    await db.promise().query(
      'INSERT INTO temp_tokens (token, user_type, user_id, expires_at) VALUES ($1, $2, $3, $4)',
      [token, type, id, expiresAt]
    );

    res.json({ 
      message: 'Temp token generated successfully',
      token,
      expiresAt: expiresAt.toISOString()
    });
  } catch (err) {
    console.error('Generate temp token error:', err);
    res.status(500).json({ message: 'Error generating temp token', details: err.message });
  }
});

// Update user account
router.put('/accounts/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const validTypes = ['patient', 'doctor', 'assistant', 'admin'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid user type' });
  }

  try {
    const table = type === 'admin' ? 'admin' : type;
    
    if (type === 'patient') {
      const { firstName, lastName, email, phoneNumber, age, cin } = req.body;
      await db.promise().query(
        'UPDATE patient SET firstName = $1, lastName = $2, email = $3, phoneNumber = $4, age = $5, cin = $6 WHERE id = $7',
        [firstName, lastName, email, phoneNumber || null, age || null, cin || null, id]
      );
      const [rows] = await db.promise().query(
        'SELECT id, firstname as "firstName", lastname as "lastName", email, phoneNumber, age, cin FROM patient WHERE id = $1',
        [id]
      );
      return res.json(rows[0]);
    } else if (type === 'doctor') {
      const { firstName, lastName, email, speciality_id, experience_years, consultation_fee, degree, city, address } = req.body;
      await db.promise().query(
        `UPDATE doctor SET "firstName" = $1, "lastName" = $2, email = $3, speciality_id = $4, experience_years = $5, consultation_fee = $6, degree = $7, city = $8, address = $9 WHERE id = $10`,
        [firstName, lastName, email, speciality_id, experience_years, consultation_fee, degree, city, address, id]
      );
      const [rows] = await db.promise().query(
        'SELECT id, "firstName", "lastName", email, speciality_id, experience_years, consultation_fee, degree, city, address FROM doctor WHERE id = $1',
        [id]
      );
      return res.json(rows[0]);
    } else if (type === 'assistant') {
      const { firstName, lastName, email } = req.body;
      await db.promise().query(
        'UPDATE assistant SET firstName = $1, lastName = $2, email = $3 WHERE id = $4',
        [firstName, lastName, email, id]
      );
      const [rows] = await db.promise().query(
        'SELECT id, doctor_id, email, firstName, lastName FROM assistant WHERE id = $1',
        [id]
      );
      return res.json(rows[0]);
    } else if (type === 'admin') {
      const { email } = req.body;
      await db.promise().query(
        'UPDATE admin SET email = $1 WHERE id = $2',
        [email, id]
      );
      const [rows] = await db.promise().query(
        'SELECT id, email FROM admin WHERE id = $1',
        [id]
      );
      return res.json(rows[0]);
    }
  } catch (err) {
    console.error('Update account error:', err);
    res.status(500).json({ message: 'Error updating account', details: err.message });
  }
});

// Get single account details
router.get('/accounts/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const validTypes = ['patient', 'doctor', 'assistant', 'admin'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid user type' });
  }

  try {
    const table = type === 'admin' ? 'admin' : type;
    const [rows] = await db.promise().query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Remove password from response
    const { password, ...account } = rows[0];
    res.json(account);
  } catch (err) {
    console.error('Get account error:', err);
    res.status(500).json({ message: 'Error fetching account', details: err.message });
  }
});

module.exports = router;