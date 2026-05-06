const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { staff } = require('../data/mockData');

const router = express.Router();

// GET /api/hr - HR and Admin only; salary hidden from HR role
router.get('/', authenticate, authorize('hr', 'read'), (req, res) => {
  const canSeeSalary = req.user.role === 'admin';
  const result = staff.map(s => {
    const { salary, ...rest } = s;
    return canSeeSalary ? s : rest;
  });
  res.json(result);
});

// GET /api/hr/summary - Admin and HR
router.get('/summary', authenticate, authorize('hr', 'read'), (req, res) => {
  const total = staff.length;
  const active = staff.filter(s => s.status === 'Active').length;
  const onLeave = staff.filter(s => s.status === 'Leave').length;
  const doctors = staff.filter(s => s.role === 'Doctor').length;
  const nurses = staff.filter(s => s.role === 'Nurse').length;
  res.json({ total, active, onLeave, doctors, nurses });
});

// POST /api/hr - Admin only
router.post('/', authenticate, authorize('hr', 'write'), (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Only administrators can add staff' });

  const { name, role, dept, salary, start } = req.body;
  if (!name || !role || !dept)
    return res.status(400).json({ error: 'name, role, and dept are required' });

  const newStaff = {
    id: `E-${207 + staff.length}`,
    name, role, dept,
    status: 'Active',
    salary: salary || 0,
    start: start || new Date().toISOString().split('T')[0],
  };
  staff.push(newStaff);
  res.status(201).json(newStaff);
});

// PATCH /api/hr/:id - HR can update basic info; admin can update salary too
router.patch('/:id', authenticate, authorize('hr', 'write'), (req, res) => {
  const employee = staff.find(s => s.id === req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const { name, dept, status, salary } = req.body;
  if (name) employee.name = name;
  if (dept) employee.dept = dept;
  if (status) employee.status = status;
  if (salary && req.user.role === 'admin') employee.salary = Number(salary);

  res.json(employee);
});

// DELETE /api/hr/:id - Admin only
router.delete('/:id', authenticate, authorize('hr', 'delete'), (req, res) => {
  const idx = staff.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Employee not found' });
  staff.splice(idx, 1);
  res.json({ message: 'Employee removed' });
});

module.exports = router;
