const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n--- USER LISTING START ---');

        const users = await User.find({ role: 'patient' }).select('name email _id');
        console.log(`Found ${users.length} patients.`);

        users.forEach(u => {
            console.log(`Name: "${u.name}" | Email: ${u.email} | ID: ${u._id}`);
        });

        console.log('--- USER LISTING END ---\n');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

listUsers();
