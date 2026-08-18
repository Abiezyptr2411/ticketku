require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/api', (req, res) => {
    res.json({ message: 'Railway API is running' });
});

// Setup routes here
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/stations', require('./src/routes/stationRoutes'));
app.use('/api/trains', require('./src/routes/trainRoutes'));
app.use('/api/schedules', require('./src/routes/scheduleRoutes'));
app.use('/api/seats', require('./src/routes/seatRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

module.exports = app;
