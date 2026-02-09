const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log("Connecting to:", MONGODB_URI);

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        const user = await User.findOne({ email: "ambulance@gmail.com" });
        if (user) {
            console.log("User Found:", user);
        } else {
            console.log("User NOT Found");
            // Check all users
            const count = await User.countDocuments();
            console.log("Total users:", count);
            const allUsers = await User.find({}, 'email');
            console.log("Emails:", allUsers.map(u => u.email));
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
