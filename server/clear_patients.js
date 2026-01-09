const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
require('dotenv').config();

const clearPatients = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital-app';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all patients
        const patients = await User.find({ role: 'patient' });
        const patientIds = patients.map(p => p._id);

        console.log(`Found ${patients.length} patients to delete.`);

        // Delete Appointments linked to these patients
        const deletedAppointments = await Appointment.deleteMany({ patientId: { $in: patientIds } });
        console.log(`Deleted ${deletedAppointments.deletedCount} appointments associated with these patients.`);

        // Delete Patients
        const deletedPatients = await User.deleteMany({ role: 'patient' });
        console.log(`Deleted ${deletedPatients.deletedCount} patients.`);

        console.log('Patient data cleaned successfully.');

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clearPatients();
