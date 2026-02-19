const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n--- DIAGNOSTIC START ---');

        const appointmentId = '698e12db9dfaef5d3a60f9f6';
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            console.log('Appointment NOT FOUND');
            return;
        }

        console.log(`Appointment: ${appointment._id}`);
        console.log(`Stored Patient ID: ${appointment.patientId}`);
        console.log(`Stored Patient Name: "${appointment.patientName}"`);

        // Check if patient exists by ID
        const patientById = await User.findById(appointment.patientId);
        if (patientById) {
            console.log(`✅ Patient found by ID: "${patientById.name}"`);
        } else {
            console.log('❌ Patient NOT FOUND by stored ID (Likely Deleted/Reseeded)');

            // Check if patient exists by Name
            const patientByName = await User.findOne({ name: appointment.patientName });
            if (patientByName) {
                console.log('⚠️ Found a User with the EXACT SAME NAME but different ID!');
                console.log(`   New User ID: ${patientByName._id}`);

                // AUTO FIX
                console.log('>>> ATTEMPTING AUTO-FIX <<<');
                appointment.patientId = patientByName._id;
                await appointment.save();
                console.log('✅ Appointment Updated: Patient ID re-linked to existing user.');
            } else {
                console.log('❌ No user found with this name either.');
            }
        }
        console.log('--- DIAGNOSTIC END ---\n');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
