const Schedule = require('../models/Schedule');
const Seat = require('../models/Seat');
const Train = require('../models/Train');

exports.searchSchedules = async (req, res) => {
    try {
        const { departureStation, arrivalStation, departureDate } = req.query;
        let query = {};
        
        if (departureStation) query.departureStation = departureStation;
        if (arrivalStation) query.arrivalStation = arrivalStation;
        
        if (departureDate) {
            const startOfDay = new Date(departureDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(departureDate);
            endOfDay.setUTCHours(23, 59, 59, 999);
            
            query.departureTime = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        const schedules = await Schedule.find(query)
            .populate('train')
            .populate('departureStation')
            .populate('arrivalStation')
            .sort({ departureTime: 1 });
            
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.getScheduleById = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id)
            .populate('train')
            .populate('departureStation')
            .populate('arrivalStation');
            
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
exports.createSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.create(req.body);
        
        const train = await Train.findById(schedule.train);
        const totalCapacity = train?.capacity || 40;

        // 40 seats per coach, 4 columns (A-B-C-D), rows = seatsPerCoach / 4
        const SEATS_PER_COACH = 40;
        const COLUMNS = ['A', 'B', 'C', 'D'];
        const ROWS_PER_COACH = Math.ceil(SEATS_PER_COACH / COLUMNS.length); // 10

        const totalCoaches = Math.ceil(totalCapacity / SEATS_PER_COACH);
        const seatsToCreate = [];
        let seatsLeft = totalCapacity;

        for (let c = 1; c <= totalCoaches; c++) {
            const coachCapacity = Math.min(SEATS_PER_COACH, seatsLeft);
            const rows = Math.ceil(coachCapacity / COLUMNS.length);

            for (let r = 1; r <= rows; r++) {
                for (const col of COLUMNS) {
                    if (seatsToCreate.length >= totalCapacity) break;
                    seatsToCreate.push({
                        schedule: schedule._id,
                        coach: String(c),
                        seatNumber: `${col}${r}`,
                        status: 'AVAILABLE'
                    });
                }
            }
            seatsLeft -= coachCapacity;
        }

        await Seat.insertMany(seatsToCreate);
        res.status(201).json(schedule);
    } catch (error) {
        res.status(400).json({ message: 'Server Error: ' + error.message });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(schedule);
    } catch (error) {
        res.status(400).json({ message: 'Server Error: ' + error.message });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Schedule removed' });
    } catch (error) {
        res.status(400).json({ message: 'Server Error: ' + error.message });
    }
};
