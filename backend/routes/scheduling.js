const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { appointments } = require('../data/mockData');

const router = express.Router();

// GET /api/scheduling - patients see own; staff see all
router.get('/', authenticate, (req, res) => {
  const role = req.user.role;
  if (!['admin', 'doctor', 'nurse', 'patient'].includes(role))
    return res.status(403).json({ error: 'Access denied' });

  let result = appointments;
  if (role === 'patient') {
    result = appointments.filter(a => a.patientId === req.user.patientId);
  } else if (role === 'doctor') {
    result = appointments.filter(a => a.doctor === req.user.name);
  }
  res.json(result);
});

// POST /api/scheduling - admin and doctor can create; patient can request
router.post('/', authenticate, (req, res) => {
  const role = req.user.role;
  if (role === 'nurse' || role === 'hr')
    return res.status(403).json({ error: 'Nurses and HR cannot create appointments' });

  const { patientId, patientName, doctor, dept, date, time } = req.body;
  if (!patientId || !doctor || !date || !time)
    return res.status(400).json({ error: 'patientId, doctor, date, and time are required' });

  const newAppt = {
    id: `APT-${String(appointments.length + 1).padStart(3, '0')}`,
    patientId,
    patientName: patientName || 'Unknown',
    doctor,
    dept: dept || 'General',
    date,
    time,
    status: role === 'patient' ? 'Pending' : 'Confirmed',
  };
  appointments.push(newAppt);
  res.status(201).json(newAppt);
});

// PATCH /api/scheduling/:id - admin and doctor only
router.patch('/:id', authenticate, (req, res) => {
  const role = req.user.role;
  if (!['admin', 'doctor'].includes(role))
    return res.status(403).json({ error: 'Only admins and doctors can update appointments' });

  const appt = appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  const { date, time, status, doctor } = req.body;
  if (date) appt.date = date;
  if (time) appt.time = time;
  if (status) appt.status = status;
  if (doctor && role === 'admin') appt.doctor = doctor;

  res.json(appt);
});

// DELETE /api/scheduling/:id - admin only
router.delete('/:id', authenticate, authorize('scheduling', 'delete'), (req, res) => {
  const idx = appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Appointment not found' });
  appointments.splice(idx, 1);
  res.json({ message: 'Appointment cancelled' });
});

module.exports = router;
