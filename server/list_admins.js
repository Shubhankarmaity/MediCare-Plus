const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const listAdmins = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const hospitals = await Hospital.find().populate('adminId');

        console.log('\n--- Hospital Admin Report ---');
        const hospitalStatus = [];

        for (const hospital of hospitals) {
            let adminInfo = "No Admin Assigned";
            if (hospital.adminId) {
                adminInfo = `${hospital.adminId.email} (Approved: ${hospital.adminId.isApproved})`;
            }

            console.log(`Hospital: ${hospital.name}`);
            console.log(`Admin: ${adminInfo}`);
            console.log('-----------------------------');

            hospitalStatus.push({
                id: hospital._id,
                name: hospital.name,
                hasAdmin: !!hospital.adminId
            });
        }

        console.log(JSON.stringify(hospitalStatus)); // For parsing if needed

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listAdmins();
