const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate, ROLE_PERMISSIONS, JWT_SECRET } = require('../middleware/auth');
const { users } = require('../data/mockData');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, patientId: user.patientId },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, patientId: user.patientId },
    permissions: ROLE_PERMISSIONS[user.role],
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({
    user: req.user,
    permissions: ROLE_PERMISSIONS[req.user.role],
  });
});

module.exports = router;
