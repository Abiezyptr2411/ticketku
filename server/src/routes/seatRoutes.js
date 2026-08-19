const express = require('express');
const router = express.Router();
const { getSeats } = require('../controllers/seatController');

router.get('/schedule/:scheduleId', getSeats);
router.get('/:scheduleId', getSeats);

module.exports = router;
