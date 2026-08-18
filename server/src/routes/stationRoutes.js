const express = require('express');
const router = express.Router();
const { getStations, createStation, updateStation, deleteStation } = require('../controllers/stationController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(getStations)
    .post(protect, admin, createStation);

router.route('/:id')
    .put(protect, admin, updateStation)
    .delete(protect, admin, deleteStation);

module.exports = router;
