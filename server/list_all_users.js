const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const listUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB Connected");

        const users = await User.find({}, 'email role isApproved');
        console.log("Users found:", users.length);
        users.forEach(u => console.log(`${u.email} - ${u.role} (Approved: ${u.isApproved})`));

        const superAdmin = await User.findOne({ email: 'superadmin@hospital.com' });
        console.log("\nSuper Admin Query Result:", superAdmin ? "FOUND" : "NOT FOUND");
        if (superAdmin) console.log(superAdmin);

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

listUsers();
