const express = require('express');
const { authenticate, authorize, ownDataOnly } = require('../middleware/auth');
const { invoices } = require('../data/mockData');

const router = express.Router();

// GET /api/billing - Admin sees all; patient sees own only
router.get('/', authenticate, ownDataOnly, (req, res) => {
  let result = invoices;
  if (req.user.role === 'patient') {
    result = invoices.filter(i => i.patientId === req.user.patientId);
  }
  res.json(result);
});

// GET /api/billing/summary - Admin/staff only
router.get('/summary', authenticate, authorize('billing', 'read'), (req, res) => {
  if (req.user.role === 'patient')
    return res.status(403).json({ error: 'Patients cannot access billing summary' });

  const total = invoices.reduce((sum, i) => sum + i.amount, 0);
  const collected = invoices.reduce((sum, i) => sum + i.paid, 0);
  const outstanding = total - collected;
  const overdue = invoices.filter(i => i.status === 'Unpaid').length;

  res.json({ total, collected, outstanding, overdue });
});

// POST /api/billing - Admin only
router.post('/', authenticate, authorize('billing', 'write'), (req, res) => {
  const { patientId, patient, amount } = req.body;
  if (!patientId || !patient || !amount)
    return res.status(400).json({ error: 'patientId, patient, and amount are required' });

  const newInvoice = {
    id: `INV-${1047 + invoices.length}`,
    patientId,
    patient,
    date: new Date().toISOString().split('T')[0],
    amount: Number(amount),
    paid: 0,
    status: 'Unpaid',
  };
  invoices.push(newInvoice);
  res.status(201).json(newInvoice);
});

// PATCH /api/billing/:id/pay - Record a payment (admin only)
router.patch('/:id/pay', authenticate, authorize('billing', 'write'), (req, res) => {
  const invoice = invoices.find(i => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const { amount } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ error: 'Valid payment amount required' });

  invoice.paid = Math.min(invoice.paid + Number(amount), invoice.amount);
  invoice.status = invoice.paid >= invoice.amount ? 'Paid' : 'Partial';
  res.json(invoice);
});

// DELETE /api/billing/:id - Admin only
router.delete('/:id', authenticate, authorize('billing', 'delete'), (req, res) => {
  const idx = invoices.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Invoice not found' });
  invoices.splice(idx, 1);
  res.json({ message: 'Invoice deleted' });
});

module.exports = router;
