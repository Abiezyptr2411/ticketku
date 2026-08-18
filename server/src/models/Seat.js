const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    coach: { type: String, required: true },
    seatNumber: { type: String, required: true },
    status: { type: String, enum: ['AVAILABLE', 'LOCKED', 'BOOKED'], default: 'AVAILABLE' },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockExpiresAt: { type: Date }
}, { timestamps: true });

seatSchema.index({ schedule: 1, coach: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
