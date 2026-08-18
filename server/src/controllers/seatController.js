const Seat = require('../models/Seat');

exports.getSeats = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const seats = await Seat.find({ schedule: scheduleId });
        res.json(seats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.autoReleaseExpiredLocks = async () => {
    try {
        const expiredSeats = await Seat.find({
            status: 'LOCKED',
            lockExpiresAt: { $lt: new Date() }
        });

        for (const seat of expiredSeats) {
            seat.status = 'AVAILABLE';
            seat.lockedBy = undefined;
            seat.lockExpiresAt = undefined;
            await seat.save();
        }
    } catch (error) {
        console.error('Error releasing expired locks:', error);
    }
};
