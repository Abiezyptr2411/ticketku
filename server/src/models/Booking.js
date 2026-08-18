const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingCode: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    passengers: [{
        fullName: String,
        idNumber: String,
        dob: Date,
        gender: String
    }],
    seats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat' }],
    price: { type: Number, required: true },
    adminFee: { type: Number, default: 2500 },
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['QRIS', 'Virtual Account', 'Bank Transfer', 'RailwayPay'] },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'], default: 'PENDING' },
    bookingStatus: { type: String, enum: ['PENDING', 'PAYMENT_PENDING', 'PAID', 'CANCELLED', 'EXPIRED', 'COMPLETED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
