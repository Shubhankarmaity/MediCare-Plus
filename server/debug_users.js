const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/hospital-app')
    .then(async () => {
        console.log("Connected to Mongo");
        const users = await User.find({}, 'name email role');
        console.log("--- USERS ---");
        users.forEach(u => console.log(`${u.role.toUpperCase()}: ${u.name} (${u.email})`));
        console.log("-------------");
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
