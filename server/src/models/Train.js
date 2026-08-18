const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    class: { type: String, enum: ['Executive', 'Business', 'Economy'], required: true },
    capacity: { type: Number, required: true },
    facilities: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Train', trainSchema);
