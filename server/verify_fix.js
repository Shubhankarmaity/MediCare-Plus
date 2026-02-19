const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');
require('dotenv').config();

const verifyFix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const appointmentId = '698e12db9dfaef5d3a60f9f6';
        const appointment = await Appointment.findById(appointmentId).populate('patientId');

        if (appointment && appointment.patientId && appointment.patientId._id) {
            console.log('✅ FIXED! Patient is now populated:');
            console.log(`   Name: ${appointment.patientId.name}`);
            console.log(`   ID:   ${appointment.patientId._id}`);
        } else {
            console.log('❌ STILL BROKEN or User completely missing.');
            console.log('raw patientId:', appointment ? appointment.patientId : 'null');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

verifyFix();
