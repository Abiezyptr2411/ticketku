const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
    departureStation: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    arrivalStation: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Available', 'Full', 'Cancelled'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
