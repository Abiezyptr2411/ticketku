const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createBooking, mockPayment, getMyBookings, getTicketDetail } = require('../controllers/bookingController');

router.post('/', protect, createBooking);
router.post('/:bookingId/payment', protect, mockPayment);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getTicketDetail);

module.exports = router;
