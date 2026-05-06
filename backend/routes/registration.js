const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { patients } = require('../data/mockData');

const router = express.Router();

// GET /api/registration - admin, doctor, nurse can view
router.get('/', authenticate, (req, res) => {
  const role = req.user.role;
  if (!['admin', 'doctor', 'nurse'].includes(role))
    return res.status(403).json({ error: 'Access denied — clinical and admin staff only' });
  res.json(patients);
});

// GET /api/registration/:id - single patient
router.get('/:id', authenticate, (req, res) => {
  const role = req.user.role;
  if (!['admin', 'doctor', 'nurse'].includes(role))
    return res.status(403).json({ error: 'Access denied' });

  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

// POST /api/registration - admin and doctor only (nurses cannot register)
router.post('/', authenticate, (req, res) => {
  const role = req.user.role;
  if (!['admin', 'doctor'].includes(role))
    return res.status(403).json({ error: 'Only doctors and administrators can register new patients' });

  const { name, dob, dept, status, insurance } = req.body;
  if (!name || !dob || !dept)
    return res.status(400).json({ error: 'name, dob, and dept are required' });

  const newPatient = {
    id: `P-${String(patients.length + 1).padStart(3, '0')}`,
    name,
    dob,
    dept,
    status: status || 'Outpatient',
    insurance: insurance || 'None',
    userId: null,
  };
  patients.push(newPatient);
  res.status(201).json(newPatient);
});

// PATCH /api/registration/:id - admin and doctor only
router.patch('/:id', authenticate, (req, res) => {
  const role = req.user.role;
  if (!['admin', 'doctor'].includes(role))
    return res.status(403).json({ error: 'Only doctors and administrators can update patient records' });

  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  const { name, dob, dept, status, insurance } = req.body;
  if (name) patient.name = name;
  if (dob) patient.dob = dob;
  if (dept) patient.dept = dept;
  if (status) patient.status = status;
  if (insurance) patient.insurance = insurance;

  res.json(patient);
});

// DELETE /api/registration/:id - admin only
router.delete('/:id', authenticate, authorize('registration', 'delete'), (req, res) => {
  const idx = patients.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Patient not found' });
  patients.splice(idx, 1);
  res.json({ message: 'Patient record deleted' });
});

module.exports = router;
