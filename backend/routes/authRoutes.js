const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Login with temp token
router.post('/temp-login', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Find valid temp token
    const [tempToken] = await db.promise().query(
      'SELECT * FROM temp_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (!tempToken || tempToken.length === 0) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { user_type, user_id } = tempToken[0];

    // Get user data based on type
    const table = user_type === 'admin' ? 'admin' : user_type;
    const [user] = await db.promise().query(
      `SELECT id, email, firstname as "firstName", lastname as "lastName", role FROM ${table} WHERE id = $1`,
      [user_id]
    );

    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark token as used
    await db.promise().query(
      'UPDATE temp_tokens SET used = TRUE WHERE id = $1',
      [tempToken[0].id]
    );

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user[0].id, role: user_type },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful. Please reset your password.',
      token: jwtToken,
      user: user[0],
      userType: user_type,
      requiresPasswordReset: true
    });
  } catch (err) {
    console.error('Temp login error:', err);
    res.status(500).json({ message: 'Error logging in with temp token', details: err.message });
  }
});

// Reset password after temp login
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in appropriate table
    const table = role === 'admin' ? 'admin' : role;
    await db.promise().query(
      `UPDATE ${table} SET password = $1 WHERE id = $2`,
      [hashedPassword, id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please request a new password reset link.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Error resetting password', details: err.message });
  }
});

module.exports = router;
