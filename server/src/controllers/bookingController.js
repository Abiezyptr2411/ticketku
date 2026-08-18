const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
    try {
        const { scheduleId, passengers, selectedSeats, price, adminFee, totalPrice, paymentMethod } = req.body;
        
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const bookingCode = `RAIL-${dateStr}-${randomNum}`;
        
        const seatObjects = await Seat.find({ schedule: scheduleId, seatNumber: { $in: selectedSeats } });
        const seatIds = seatObjects.map(s => s._id);

        const newBooking = await Booking.create({
            bookingCode,
            user: req.user._id,
            schedule: scheduleId,
            passengers,
            seats: seatIds,
            price,
            adminFee,
            totalPrice,
            paymentMethod,
            paymentStatus: 'PENDING',
            bookingStatus: 'PENDING'
        });

        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.mockPayment = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        
        const booking = await Booking.findById(bookingId).populate('seats');
        if(!booking) return res.status(404).json({ message: 'Booking not found' });

        if (status === 'success') {
            booking.paymentStatus = 'PAID';
            booking.bookingStatus = 'COMPLETED';
            
            if (booking.paymentMethod === 'RAILWAYPAY') {
                const userDoc = await User.findById(booking.user);
                if (userDoc) {
                    userDoc.walletBalance = userDoc.walletBalance - booking.totalPrice;
                    userDoc.points = userDoc.points + Math.floor(booking.totalPrice / 1000);
                    await userDoc.save();
                }
            }
            
            for(let seat of booking.seats) {
                const s = await Seat.findById(seat._id);
                if(s) {
                    s.status = 'BOOKED';
                    await s.save();
                }
            }
        } else {
            booking.paymentStatus = 'FAILED';
            booking.bookingStatus = 'FAILED';
            
             for(let seat of booking.seats) {
                const s = await Seat.findById(seat._id);
                if(s) {
                    s.status = 'AVAILABLE';
                    s.lockedBy = undefined;
                    s.lockExpiresAt = undefined;
                    await s.save();
                }
            }
        }
        
        await booking.save();
        res.json(booking);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('schedule')
            .populate('seats')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTicketDetail = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'schedule',
                populate: [
                    { path: 'train' },
                    { path: 'departureStation' },
                    { path: 'arrivalStation' }
                ]
            })
            .populate('seats');
            
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if(booking.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(booking);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};
