const Train = require('../models/Train');

exports.getTrains = async (req, res) => {
    try {
        const trains = await Train.find({});
        res.json(trains);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
exports.createTrain = async (req, res) => {
    try {
        const train = await Train.create(req.body);
        res.status(201).json(train);
    } catch (error) {
        res.status(400).json({ message: 'Server Error: ' + error.message });
    }
};

exports.updateTrain = async (req, res) => {
    try {
        const train = await Train.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(train);
    } catch (error) {
        res.status(400).json({ message: 'Server Error: ' + error.message });
    }
};

exports.deleteTrain = async (req, res) => {
    try {
        await Train.findByIdAndDelete(req.params.id);
        res.json({ message: 'Train removed' });
    } catch (error) {
        res.status(400).json({ message: 'Server Error: ' + error.message });
    }
};
