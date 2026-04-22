const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const cloudinary = require('cloudinary').v2
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const path = require('path')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const doctorRoutes = require('./routes/doctorRoutes')
const specialityRoutes = require('./routes/specialityRoutes')
const appointmentRoutes = require('./routes/appointments')
const prescriptionRoutes = require('./routes/prescriptions')
const adminRoutes = require('./routes/adminRoutes')
const assistantRoutes = require('./routes/assistantRoutes');
const bcrypt = require('bcrypt');
const patientRoutes = require('./routes/patientRoutes');
const patientDoctorRoutes = require('./routes/patientsDoctor'); // <-- add this line
const db = require('./config/db'); // Use the shared pool
const activityRoutes = require('./routes/activity');
const historyRoutes = require('./routes/history'); // <-- add this line
const authRoutes = require('./routes/authRoutes');

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Export app for serverless functions
module.exports = app

// Parse CORS origins from environment variable
const corsOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

// Configure CORS
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'patient-token',
    'doctor-token',
    'assistant-token',
    'admin-token'
  ]
}))

// Configure express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Mount routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/specialities', specialityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assistants', assistantRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patients', patientDoctorRoutes); // <-- already present
app.use('/api/history', historyRoutes); // <-- add this line
app.use('/api/auth', authRoutes);

// Register activity routes AFTER app is initialized
app.use('/api/activity', activityRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Serve test API page
app.get('/test', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Backend API Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .test-btn { background: #007bff; color: white; border: none; padding: 12px 24px; margin: 10px 10px 10px 0; border-radius: 4px; cursor: pointer; font-size: 14px; }
        .test-btn:hover { background: #0056b3; }
        .result { margin-top: 20px; padding: 15px; border-radius: 4px; background: #f8f9fa; border-left: 4px solid #007bff; }
        .result.success { border-left-color: #28a745; background: #d4edda; }
        .result.error { border-left-color: #dc3545; background: #f8d7da; }
        pre { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 4px; overflow-x: auto; margin-top: 10px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; font-weight: bold; }
        .status.online { background: #d4edda; color: #155724; }
        .status.offline { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Backend API Test Page</h1>
        <div id="status" class="status">Checking backend status...</div>
        <h2>Test Endpoints</h2>
        <button class="test-btn" onclick="testDoctors()">Test /api/doctors</button>
        <button class="test-btn" onclick="testSpecialities()">Test /api/specialities</button>
        <button class="test-btn" onclick="testHealth()">Test Health</button>
        <div id="result"></div>
    </div>
    <script>
        const API_BASE = window.location.origin + '/api';
        async function testDoctors() {
            showResult('Testing /api/doctors...');
            try {
                const response = await fetch(\`\${API_BASE}/doctors\`);
                const data = await response.json();
                showResult(\`✅ /api/doctors - Status: \${response.status}\`, data, 'success');
            } catch (error) {
                showResult(\`❌ /api/doctors - Error: \${error.message}\`, error, 'error');
            }
        }
        async function testSpecialities() {
            showResult('Testing /api/specialities...');
            try {
                const response = await fetch(\`\${API_BASE}/specialities\`);
                const data = await response.json();
                showResult(\`✅ /api/specialities - Status: \${response.status}\`, data, 'success');
            } catch (error) {
                showResult(\`❌ /api/specialities - Error: \${error.message}\`, error, 'error');
            }
        }
        async function testHealth() {
            showResult('Testing backend health...');
            try {
                const response = await fetch(window.location.origin + '/health');
                const data = await response.json();
                showResult(\`✅ Backend is responding - Status: \${response.status}\`, data, 'success');
                updateStatus(true);
            } catch (error) {
                showResult(\`❌ Backend health check failed - Error: \${error.message}\`, error, 'error');
                updateStatus(false);
            }
        }
        function showResult(message, data = null, type = '') {
            const resultDiv = document.getElementById('result');
            let html = \`<div class="result \${type}">\${message}\`;
            if (data) {
                html += \`<pre>\${JSON.stringify(data, null, 2)}</pre>\`;
            }
            html += '</div>';
            resultDiv.innerHTML = html;
        }
        function updateStatus(online) {
            const statusDiv = document.getElementById('status');
            if (online) {
                statusDiv.className = 'status online';
                statusDiv.textContent = '✅ Backend is ONLINE';
            } else {
                statusDiv.className = 'status offline';
                statusDiv.textContent = '❌ Backend is OFFLINE';
            }
        }
        testHealth();
    </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'patient_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
})

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  }
})

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if (!bearerHeader) {
    return res.status(401).send('Access denied. No token provided.')
  }
  try {
    const bearer = bearerHeader.split(' ')
    const token = bearer[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(400).send('Invalid token.')
  }
}

// Middleware to extract doctor ID from token (replace with your real auth logic)
function doctorAuth(req, res, next) {
    const token = req.headers['doctor-token'];
    // TODO: Replace with real JWT verification and doctor ID extraction
    if (!token) return res.status(401).json({ error: 'No token' });
    // For demo, assume doctor ID 1
    req.doctorId = 1;
    next();
}

// Register endpoint
app.post('/api/register', (req, res) => {
  // Log the entire raw request body for debugging
  console.log('RAW REQUEST BODY:', JSON.stringify(req.body, null, 2))
  console.log('REQUEST HEADERS:', JSON.stringify(req.headers, null, 2))

  try {
    const email = req.body.email?.trim();
    const password = req.body.password;
    const firstName = (req.body.firstName || req.body.firstname || '').trim();
    const lastName = (req.body.lastName || req.body.lastname || '').trim();
    const phoneNumber = (req.body.phoneNumber || req.body.phonenumber || '').trim();
    const age = req.body.age;
    console.log('PARSED registration data:', JSON.stringify({
      email: email || 'MISSING', 
      firstName: firstName || 'MISSING', 
      lastName: lastName || 'NULL', 
      phoneNumber: phoneNumber || 'NULL', 
      age: age || 'NULL'
    }, null, 2))

    // Enhanced validation with detailed logging
    const validationErrors = []
    if (!email) {
      console.log('❌ Registration FAILED: Missing or empty email')
      validationErrors.push('Email is required')
    }
    if (!password || password.trim() === '') {
      console.log('❌ Registration FAILED: Missing or empty password')
      validationErrors.push('Password is required')
    }
    if (!firstName || firstName.trim() === '') {
      console.log('❌ Registration FAILED: Missing or empty firstName')
      validationErrors.push('First Name is required')
    }

    // If any validation errors, return them
    if (validationErrors.length > 0) {
      console.log('🚫 Validation Errors:', validationErrors)
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      })
    }

    const query = `
      INSERT INTO patient (
        email,
        password,
        firstname,
        lastname,
        phonenumber,
        age
      ) VALUES (?, ?, ?, ?, ?, ?)
      RETURNING id
    `
    console.log('📝 Executing query with sanitized values:', [
      email,
      password,
      firstName,
      lastName || null,
      phoneNumber || null,
      age || null
    ])

    db.query(
      query,
      [
        email,
        password,
        firstName,
        lastName || null,
        phoneNumber || null,
        age || null
      ],
      (err, results) => {
        if (err) {
          console.error('❌ Database insertion error:', err)
          console.error('🔍 Full error object:', JSON.stringify(err, null, 2))
          
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
              message: 'Email already exists',
              error: 'DUPLICATE_EMAIL'
            })
          }
          
          // Log more details about the database connection
          console.error('🔌 Database connection details:', {
            host: db.config.host,
            user: db.config.user,
            database: db.config.database
          })
          
          return res.status(500).json({
            message: 'Error registering user',
            error: err.message
          })
        }
        
        console.log('✅ Patient registration successful', {
          userId: results.insertId,
          email: email
        })
        
        res.status(201).json({
          message: 'Registration successful',
          userId: results.insertId
        })
      }
    )
  } catch (error) {
    console.error('❌ Registration catch block error:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
})

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // Try patient
  const patientQuery = 'SELECT id, email, password, firstname AS "firstName", lastname AS "lastName", phonenumber AS "phoneNumber", role FROM patient WHERE email = ? AND password = ?';
  db.query(patientQuery, [email, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Error logging in');
    }
    if (results.length > 0) {
      // Remove sensitive information
      const user = results[0];
      delete user.password;
      // Create JWT token with the correct secret from environment variable
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: 'user' // Add role for middleware check
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.status(200).json({
        token,
        userData: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: 'user'
        }
      });
    } else {
      // Try admin table
      const adminQuery = 'SELECT id, email, password FROM admin WHERE email = ?';
      db.query(adminQuery, [email], async (err, adminResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Error logging in');
        }
        if (adminResults.length > 0) {
          const admin = adminResults[0];
          const isMatch = await bcrypt.compare(password, admin.password);
          if (isMatch) {
            const token = jwt.sign(
              {
                id: admin.id,
                email: admin.email,
                role: 'admin'
              },
              process.env.JWT_SECRET,
              { expiresIn: '24h' }
            );
            return res.status(200).json({
              token,
              userData: {
                id: admin.id,
                email: admin.email,
                role: 'admin'
              }
            });
          } else {
            return res.status(401).send('Invalid email or password');
          }
        } else {
          // Try doctor table
          const doctorQuery = 'SELECT id, email, password, firstname AS "firstName", lastname AS "lastName", role FROM doctor WHERE email = ?';
          db.query(doctorQuery, [email], async (err, doctorResults) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).send('Error logging in');
            }
            if (doctorResults.length > 0) {
              const doctor = doctorResults[0];
              const isMatch = await bcrypt.compare(password, doctor.password);
              if (isMatch) {
                const token = jwt.sign(
                  {
                    id: doctor.id,
                    email: doctor.email,
                    role: 'doctor'
                  },
                  process.env.JWT_SECRET,
                  { expiresIn: '24h' }
                );
                return res.status(200).json({
                  token,
                  userData: {
                    id: doctor.id,
                    email: doctor.email,
                    firstName: doctor.firstName,
                    lastName: doctor.lastName,
                    role: 'doctor'
                  }
                });
              } else {
                return res.status(401).send('Invalid email or password');
              }
            } else {
              // Try assistant table
              const assistantQuery = 'SELECT id, email, password, firstname AS "firstName", lastname AS "lastName", doctor_id FROM assistant WHERE email = ?';
              db.query(assistantQuery, [email], async (err, assistantResults) => {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).send('Error logging in');
                }
                if (assistantResults.length > 0) {
                  const assistant = assistantResults[0];
                  const isMatch = await bcrypt.compare(password, assistant.password);
                  if (isMatch) {
                    const token = jwt.sign(
                      {
                        id: assistant.id,
                        email: assistant.email,
                        role: 'assistant',
                        doctor_id: assistant.doctor_id
                      },
                      process.env.JWT_SECRET,
                      { expiresIn: '24h' }
                    );
                    return res.status(200).json({
                      token,
                      userData: {
                        id: assistant.id,
                        email: assistant.email,
                        firstName: assistant.firstName,
                        lastName: assistant.lastName,
                        role: 'assistant',
                        doctor_id: assistant.doctor_id
                      }
                    });
                  } else {
                    return res.status(401).send('Invalid email or password');
                  }
                } else {
                  return res.status(401).send('Invalid email or password');
                }
              });
            }
          });
        }
      });
    }
  });
})

// Profile endpoints
app.get('/api/profile', verifyToken, (req, res) => {
  console.log('Profile request received for user:', req.user.id)

  const query = 'SELECT id, email, firstname AS "firstName", lastname AS "lastName", phonenumber AS "phoneNumber", age, role FROM patient WHERE id = ?'
  db.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).send('Error fetching profile')
    }
    if (results.length === 0) {
      return res.status(404).send('User not found')
    }
    const user = results[0]
    delete user.password
    console.log('Sending profile data:', user)
    res.json(user)
  })
})

app.put('/api/profile', verifyToken, upload.single('image'), async (req, res) => {
  console.log('Profile update request received for user:', req.user.id)
  try {
    const { firstName, lastName, email, phoneNumber, age } = req.body
    console.log('Update data received:', { firstName, lastName, email, phoneNumber, age })

    // Get current user data
    const getCurrentUser = () => {
      return new Promise((resolve, reject) => {
        db.query('SELECT id, email, password, firstname AS "firstName", lastname AS "lastName", phonenumber AS "phoneNumber", age, image_url, image_public_id FROM patient WHERE id = ?', [req.user.id], (err, results) => {
          if (err) reject(err)
          else resolve(results[0])
        })
      })
    }
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return res.status(404).send('User not found')
    }

    // Handle image upload
    let imageUrl = currentUser.image_url
    let imagePublicId = currentUser.image_public_id
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (imagePublicId) {
        try {
          await cloudinary.uploader.destroy(imagePublicId)
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }
      imageUrl = req.file.path
      imagePublicId = req.file.filename
      console.log('New image data:', { imageUrl, imagePublicId })
    }

    // Update user data
    const query = `
      UPDATE patient 
      SET 
        firstname = ?,
        lastname = ?,
        email = ?,
        phonenumber = ?,
        age = ?,
        image_url = ?,
        image_public_id = ?,
        updatedat = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    const updateValues = [
      firstName || currentUser.firstName,
      lastName || null,
      email || currentUser.email,
      phoneNumber || null,
      age || null,
      imageUrl,
      imagePublicId,
      req.user.id
    ]
    console.log('Executing update query with values:', updateValues)
    db.query(query, updateValues, (err, results) => {
      if (err) {
        console.error('Database error:', err)
        // Clean up uploaded image if database update failed
        if (imagePublicId) {
          cloudinary.uploader.destroy(imagePublicId, (error) => {
            if (error) console.error('Error deleting uploaded image:', error)
          })
        }
        if (err.code === 'ER_DUP_ENTRY') {
          if (err.message.includes('email')) {
            return res.status(400).send('Email already exists')
          }
        }
        return res.status(500).send('Error updating profile')
      }
      console.log('Profile updated successfully')
      res.json({ message: 'Profile updated successfully' })
    })
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).send('Server error: ' + error.message)
  }
})

// Get doctor profile
app.get('/api/doctors/profile', doctorAuth, (req, res) => {
    db.query(
        'SELECT id, firstName, lastName, email, speciality_id, degree, city, address, image_url FROM doctor WHERE id = ?',
        [req.doctorId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            if (!results.length) return res.status(404).json({ error: 'Doctor not found' });
            // Optionally join with specialities table for specialization name
            db.query(
                'SELECT name FROM specialities WHERE id = ?',
                [results[0].speciality_id],
                (err2, specRes) => {
                    const doctor = results[0];
                    doctor.specialization = specRes[0]?.name || '';
                    res.json(doctor);
                }
            );
        }
    );
});

// Get doctor dashboard stats
app.get('/api/doctors/stats', doctorAuth, (req, res) => {
    const doctorId = req.doctorId;
    // Today's date
    const today = new Date().toISOString().slice(0, 10);
    // Get today's appointments
    db.query(
        `SELECT COUNT(*) AS today FROM appointments WHERE doctor_id = $1 AND appointment_date::date = $2::date`,
        [doctorId, today],
        (err, todayRes) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            // Get this week's appointments (PostgreSQL)
            db.query(
                `SELECT COUNT(*) AS week FROM appointments WHERE doctor_id = $1 AND EXTRACT(YEAR FROM appointment_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND EXTRACT(WEEK FROM appointment_date) = EXTRACT(WEEK FROM CURRENT_DATE)`,
                [doctorId],
                (err2, weekRes) => {
                    if (err2) return res.status(500).json({ error: 'DB error' });
                    // Get total and new patients
                    db.query(
                        `SELECT COUNT(DISTINCT patient_id) AS total FROM appointments WHERE doctor_id = $1`,
                        [doctorId],
                        (err3, totalPatientsRes) => {
                            if (err3) return res.status(500).json({ error: 'DB error' });
                            db.query(
                                `SELECT COUNT(DISTINCT patient_id) AS newPatients FROM appointments WHERE doctor_id = $1 AND appointment_date::date = $2::date`,
                                [doctorId, today],
                                (err4, newPatientsRes) => {
                                    if (err4) return res.status(500).json({ error: 'DB error' });
                                    // Get tasks (pending/completed appointments)
                                    db.query(
                                        `SELECT 
                                            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending, 
                                            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed 
                                         FROM appointments WHERE doctor_id = $1`,
                                        [doctorId],
                                        (err5, tasksRes) => {
                                            if (err5) return res.status(500).json({ error: 'DB error' });
                                            res.json({
                                                appointments: {
                                                    today: parseInt(todayRes[0].today),
                                                    week: parseInt(weekRes[0].week),
                                                    change: 0 // You can calculate change as needed
                                                },
                                                patients: {
                                                    total: parseInt(totalPatientsRes[0].total),
                                                    new: parseInt(newPatientsRes[0].newPatients)
                                                },
                                                tasks: {
                                                    pending: parseInt(tasksRes[0].pending) || 0,
                                                    completed: parseInt(tasksRes[0].completed) || 0
                                                }
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.path);
  res.status(404).json({ message: 'Route not found' });
});

// Start server only if not running in serverless environment
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    console.log('Available routes:');
    app._router.stack.forEach(r => {
      if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
      }
    });
  });
}