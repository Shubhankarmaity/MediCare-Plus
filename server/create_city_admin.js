const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const createCityAdmin = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find City General Hospitals
        const cityHospital = await Hospital.findOne({ name: "City General Hospital" });
        if (!cityHospital) {
            console.log('City General Hospital not found! Please run seedHospitals.js first.');
            process.exit(1);
        }
        console.log('Found Hospital:', cityHospital.name, cityHospital._id);

        // 2. Check/Create Admin User
        const adminEmail = "admincityhospital@gmail.com";
        let adminUser = await User.findOne({ email: adminEmail });

        if (adminUser) {
            console.log('Admin user already exists. Updating details...');
            // Update password if needed or just ensure role/hospital linkage
            const hashedPassword = await bcrypt.hash("admin123", 10);
            adminUser.password = hashedPassword;
            adminUser.role = 'admin';
            adminUser.hospitalId = cityHospital._id;
            adminUser.isApproved = true;
            await adminUser.save();
        } else {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash("admin123", 10);
            adminUser = await User.create({
                name: "City Hospital Admin",
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                hospitalId: cityHospital._id,
                isApproved: true
            });
        }

        console.log('Admin User Ready:', adminUser.email);

        // 3. Link Hospital to Admin
        cityHospital.adminId = adminUser._id;
        await cityHospital.save();
        console.log('Linked Hospital to Admin successfully.');

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

createCityAdmin();
