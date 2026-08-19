const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllBookings, updateBookingStatus, getAllUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.route('/dashboard').get(protect, admin, getDashboardStats);
router.route('/bookings').get(protect, admin, getAllBookings);
router.route('/bookings/:id/status').patch(protect, admin, updateBookingStatus);
router.route('/users').get(protect, admin, getAllUsers);
router.route('/users/:id').patch(protect, admin, updateUser).delete(protect, admin, deleteUser);

module.exports = router;
