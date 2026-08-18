require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/railway_booking', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to DB...");

    const email = 'admin@railway.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
        console.log("Admin account already exists!");
    } else {
        const adminUser = new User({
            fullName: 'Super Administrator',
            email: 'admin@railway.com',
            password: 'password123',
            phoneNumber: '08111111111',
            role: 'ADMIN' // THIS IS THE MAGIC FLAG
        });
        await adminUser.save();
        console.log("Admin account successfully created!");
        console.log("Email: admin@railway.com");
        console.log("Password: password123");
    }

    process.exit(0);
});
