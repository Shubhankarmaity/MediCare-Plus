const mongoose = require('mongoose');
const User = require('./models/User');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected to Mongo");
        const users = await User.find({}, 'name email role');
        console.log("--- USERS ---");
        users.forEach(u => console.log(`${u.role.toUpperCase()}: ${u.name} (${u.email})`));
        console.log("-------------");
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
