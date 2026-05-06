const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const billingRoutes = require('./routes/billing');
const hrRoutes = require('./routes/hr');
const schedulingRoutes = require('./routes/scheduling');
const registrationRoutes = require('./routes/registration');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/registration', registrationRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.listen(PORT, () => console.log(`MedCore HMS running on port ${PORT}`));
