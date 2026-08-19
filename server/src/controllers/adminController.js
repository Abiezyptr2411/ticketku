const Booking = require('../models/Booking');
const Train = require('../models/Train');
const User = require('../models/User');
const Schedule = require('../models/Schedule');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        
        const revenueResult = await Booking.aggregate([
            { $match: { paymentStatus: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const activeTrains = await Train.countDocuments();
        const registeredUsers = await User.countDocuments();

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'fullName')
            .populate({
                path: 'schedule',
                populate: [
                    { path: 'departureStation', select: 'code' },
                    { path: 'arrivalStation', select: 'code' }
                ]
            });

        // Generate line chart data: Last 7 days revenue & bookings
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyStats = await Booking.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                bookings: { $sum: 1 },
                revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$totalPrice', 0] } }
            } },
            { $sort: { _id: 1 } }
        ]);

        // Pie chart data: proportion of payment statuses
        const paymentStats = await Booking.aggregate([
            { $group: { _id: '$paymentStatus', value: { $sum: 1 } } }
        ]);

        res.json({
            stats: { totalBookings, totalRevenue, activeTrains, registeredUsers },
            recentBookings,
            charts: {
                daily: dailyStats,
                paymentStatus: paymentStats
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// GET all bookings with pagination, filter & search
exports.getAllBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { status, search } = req.query;

        const matchStage = {};
        if (status && status !== 'ALL') matchStage.paymentStatus = status;

        // Build aggregation for search support
        let query = {};
        if (status && status !== 'ALL') query.paymentStatus = status;
        if (search) {
            query.$or = [
                { bookingCode: { $regex: search, $options: 'i' } }
            ];
        }

        let bookingsQuery = Booking.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'fullName email phone')
            .populate({
                path: 'schedule',
                populate: [
                    { path: 'train', select: 'name code class' },
                    { path: 'departureStation', select: 'name code city' },
                    { path: 'arrivalStation', select: 'name code city' }
                ]
            })
            .populate('seats', 'seatNumber carNumber');

        // If searching and query has search term, also do a user sub-query
        let bookings = await bookingsQuery;

        // If search also looks in user fullName
        if (search) {
            const userIds = await User.find(
                { fullName: { $regex: search, $options: 'i' } },
                '_id'
            );
            const userIdList = userIds.map(u => u._id);

            const mergedQuery = {
                ...( status && status !== 'ALL' ? { paymentStatus: status } : {} ),
                $or: [
                    { bookingCode: { $regex: search, $options: 'i' } },
                    { user: { $in: userIdList } }
                ]
            };

            bookings = await Booking.find(mergedQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'fullName email phone')
                .populate({
                    path: 'schedule',
                    populate: [
                        { path: 'train', select: 'name code class' },
                        { path: 'departureStation', select: 'name code city' },
                        { path: 'arrivalStation', select: 'name code city' }
                    ]
                })
                .populate('seats', 'seatNumber carNumber');

            const totalSearch = await Booking.countDocuments(mergedQuery);
            return res.json({
                bookings,
                total: totalSearch,
                page,
                totalPages: Math.ceil(totalSearch / limit)
            });
        }

        const total = await Booking.countDocuments(query);
        res.json({
            bookings,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// PATCH update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { paymentStatus, bookingStatus } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (paymentStatus) booking.paymentStatus = paymentStatus;
        if (bookingStatus) booking.bookingStatus = bookingStatus;
        await booking.save();

        res.json({ message: 'Status updated successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// GET all users with pagination, role filter & search
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { role, search } = req.query;

        const query = {};
        if (role && role !== 'ALL') query.role = role;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);
        res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// PATCH update user (role, walletBalance, points)
exports.updateUser = async (req, res) => {
    try {
        const { role, walletBalance, points, fullName, phoneNumber } = req.body;
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (role !== undefined) user.role = role;
        if (walletBalance !== undefined) user.walletBalance = walletBalance;
        if (points !== undefined) user.points = points;
        if (fullName) user.fullName = fullName;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        await user.save();
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// DELETE user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'ADMIN') return res.status(403).json({ message: 'Cannot delete admin user' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

