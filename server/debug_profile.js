const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');
const Hospital = require('./models/Hospital');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log("Connected to DB");

        // Find a patient with hospitalId
        const patient = await User.findOne({ role: 'patient', hospitalId: { $ne: null } });

        if (!patient) {
            console.log("No patient found with hospitalId");
            process.exit();
        }

        console.log("Found Patient:", patient.name, patient.email);
        console.log("Raw hospitalId:", patient.hospitalId);

        // Now try to populate
        const populatedPatient = await User.findById(patient._id).populate('hospitalId');
        console.log("Populated hospitalId:", populatedPatient.hospitalId);

        if (populatedPatient.hospitalId && populatedPatient.hospitalId.name) {
            console.log("SUCCESS: Hospital name is", populatedPatient.hospitalId.name);
        } else {
            console.log("FAILURE: Hospital name is missing or population failed.");
        }

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
