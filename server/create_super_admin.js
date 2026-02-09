const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB Connected");

        const email = "superadmin@hospital.com"; // Default email
        const password = "superadmin123"; // Default password
        const name = "Super Admin";

        // Check if exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log("Super Admin already exists. Updating role to be sure.");
            existing.role = 'super-admin';
            existing.password = await bcrypt.hash(password, 10);
            await existing.save();
            console.log(`✅ Super Admin updated.\nEmail: ${email}\nPassword: ${password}`);
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = new User({
                name,
                email,
                password: hashedPassword,
                role: 'super-admin',
                isApproved: true,
                approvalStatus: 'approved'
            });
            await newAdmin.save();
            console.log(`✅ Super Admin Created.\nEmail: ${email}\nPassword: ${password}`);
        }

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createSuperAdmin();
