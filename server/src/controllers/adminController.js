const Booking = require('../models/Booking');
const Train = require('../models/Train');
const User = require('../models/User');

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
