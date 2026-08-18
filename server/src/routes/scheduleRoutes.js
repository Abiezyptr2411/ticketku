const express = require('express');
const router = express.Router();
const { searchSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(searchSchedules)
    .post(protect, admin, createSchedule);

router.route('/:id')
    .get(getScheduleById)
    .put(protect, admin, updateSchedule)
    .delete(protect, admin, deleteSchedule);

module.exports = router;
