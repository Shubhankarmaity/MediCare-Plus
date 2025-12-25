const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createPatient = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital-app';
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const email = 'patient1@gmail.com';
        const password = '123456';

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User already exists. Updating password...");
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUser.password = hashedPassword;
            existingUser.role = 'patient'; // Ensure role is patient
            await existingUser.save();
            console.log("User updated successfully.");
        } else {
            console.log("Creating new user...");
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                name: "Test Patient 1",
                email,
                password: hashedPassword,
                role: "patient"
            });
            console.log("User created successfully:", newUser);
        }

        mongoose.disconnect();
    } catch (error) {
        console.error("Error creating user:", error);
        process.exit(1);
    }
};

createPatient();
