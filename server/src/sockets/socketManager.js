const Seat = require('../models/Seat');

module.exports = function(io) {
    io.on('connection', (socket) => {

        socket.on('join_schedule', (scheduleId) => {
            socket.join(`schedule_${scheduleId}`);
        });

        socket.on('leave_schedule', (scheduleId) => {
            socket.leave(`schedule_${scheduleId}`);
        });

        socket.on('lock_seat', async ({ scheduleId, seatNumber, userId }) => {
            try {
                const seat = await Seat.findOneAndUpdate(
                    { schedule: scheduleId, seatNumber, status: 'AVAILABLE' },
                    { 
                        status: 'LOCKED', 
                        lockedBy: userId, 
                        lockExpiresAt: new Date(Date.now() + 5 * 60000)
                    },
                    { new: true }
                );

                if (seat) {
                    io.to(`schedule_${scheduleId}`).emit('seat_updated', seat);
                } else {
                    socket.emit('lock_failed', { seatNumber, message: 'Seat is not available' });
                }
            } catch (error) {
                console.error('Lock Seat Error:', error);
            }
        });

        socket.on('unlock_seat', async ({ scheduleId, seatNumber, userId }) => {
            try {
                const seat = await Seat.findOneAndUpdate(
                    { schedule: scheduleId, seatNumber, lockedBy: userId, status: 'LOCKED' },
                    { 
                        status: 'AVAILABLE', 
                        $unset: { lockedBy: "", lockExpiresAt: "" } 
                    },
                    { new: true }
                );

                if (seat) {
                    io.to(`schedule_${scheduleId}`).emit('seat_updated', seat);
                }
            } catch (error) {
                console.error('Unlock Seat Error:', error);
            }
        });

        socket.on('disconnect', () => {
             // Let timeout handle orphaned locks
        });
    });
};
