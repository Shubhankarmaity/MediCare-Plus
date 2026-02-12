const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const listAdmins = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const admins = await User.find({ role: 'admin' });
        console.log('\n--- ADMIN USERS ---');
        admins.forEach(admin => {
            console.log(`Email: ${admin.email}, Name: ${admin.name}, HospitalId: ${admin.hospitalId}, Verified: ${admin.isVerified}`);
        });
        console.log('-------------------\n');

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listAdmins();
