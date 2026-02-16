const mongoose = require('mongoose');
const { execSync } = require('child_process');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const AmbulanceRequest = require('./models/AmbulanceRequest');
const Hospital = require('./models/Hospital');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const resetDatabase = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('--- RESETTING DATABASE ---');
        console.log('Connected to MongoDB');

        // 1. Clear Data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        console.log('- Users cleared');
        await Appointment.deleteMany({});
        console.log('- Appointments cleared');
        await AmbulanceRequest.deleteMany({});
        console.log('- AmbulanceRequests cleared');
        // Hospital cleared by seedHospitals good to be explicit or leave it to that script

        await mongoose.connection.close();
        console.log('Data wipe complete.\n');

        // 2. Run Seeders
        console.log('--- SEEDING HOSPITALS ---');
        execSync('node seedHospitals.js', { stdio: 'inherit', cwd: __dirname });
        console.log('\n');

        console.log('--- CREATING ADMINS ---');
        execSync('node create_missing_admins.js', { stdio: 'inherit', cwd: __dirname });
        console.log('\n');

        console.log('=== DATABASE RESET & REFRESH COMPLETE ===');

    } catch (err) {
        console.error('Error resetting database:', err);
        process.exit(1);
    }
};

resetDatabase();
