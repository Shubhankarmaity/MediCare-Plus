const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const findShubhankar = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Searching for "Shubhankar"...');
        const user = await User.findOne({ name: { $regex: 'Shubhankar', $options: 'i' } });

        if (user) {
            console.log('✅ FOUND USER!');
            console.log(`Name: ${user.name}`);
            console.log(`ID:   ${user._id}`);

            // Fix the appointment while we are here
            const Appointment = require('./models/Appointment');
            const appointmentId = '698e12db9dfaef5d3a60f9f6';

            const appointment = await Appointment.findById(appointmentId);
            if (appointment) {
                console.log('Updating appointment...');
                appointment.patientId = user._id;
                await appointment.save();
                console.log('✅ Appointment Fixed!');
            }
        } else {
            console.log('❌ User "Shubhankar" NOT FOUND in the database.');
            const count = await User.countDocuments();
            console.log(`Total users in DB: ${count}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

findShubhankar();
