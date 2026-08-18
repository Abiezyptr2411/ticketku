const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/railway_booking')
    .then(async () => {
        const db = mongoose.connection.db;
        const users = db.collection('users');
        const hash = await bcrypt.hash('123456', 10);
        const res = await users.updateMany(
            { email: { $in: ['admin@gmail.com', 'admin@test.com'] } },
            { $set: { password: hash } }
        );
        console.log('Updated ' + res.modifiedCount + ' users.');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
