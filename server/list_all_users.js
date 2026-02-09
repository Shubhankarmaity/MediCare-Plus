const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = "mongodb+srv://shubhankarmaity795_db_user:fbTgB7CseNeUliNl@medicare.0qfor8w.mongodb.net/?appName=medicare";

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
