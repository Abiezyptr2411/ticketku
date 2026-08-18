const Station = require('../models/Station');

exports.getStations = async (req, res) => {
    try {
        const stations = await Station.find({});
        res.json(stations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
exports.createStation = async (req, res) => {
    try {
        const station = await Station.create(req.body);
        res.status(201).json(station);
    } catch (error) {
        res.status(400).json({ message: 'Server Error: ' + error.message });
    }
};

exports.updateStation = async (req, res) => {
    try {
        const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(station);
    } catch (error) {
        res.status(400).json({ message: 'Server Error: ' + error.message });
    }
};

exports.deleteStation = async (req, res) => {
    try {
        await Station.findByIdAndDelete(req.params.id);
        res.json({ message: 'Station removed' });
    } catch (error) {
        res.status(400).json({ message: 'Server Error: ' + error.message });
    }
};
