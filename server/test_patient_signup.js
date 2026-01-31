const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
require('dotenv').config();

const testPatientSignup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // 1. Get a random hospital
        const hospital = await Hospital.findOne();
        if (!hospital) {
            console.error("No hospitals found! Cannot test linkage.");
            process.exit(1);
        }
        console.log(`Selected Hospital: ${hospital.name} (ID: ${hospital._id})`);

        // 2. Define Test Patient
        const email = 'testuser_hospital@gmail.com';
        const password = 'password123';

        // Cleanup previous test
        await User.deleteOne({ email });

        // 3. Register Patient (Simulating Signup)
        const hashedPassword = await bcrypt.hash(password, 10);
        const newPatient = await User.create({
            name: "Test Patient With Hospital",
            email,
            password: hashedPassword,
            role: "patient",
            hospitalId: hospital._id, // LINKING HOSPITAL
            department: hospital.facilities[0] || "General" // LINKING DEPARTMENT
        });

        console.log("Patient created successfully!");
        console.log("Patient ID:", newPatient._id);
        console.log("Linked Hospital ID:", newPatient.hospitalId);

        // 4. Verify Linkage
        const fetchedPatient = await User.findById(newPatient._id).populate('hospitalId');
        if (fetchedPatient.hospitalId && fetchedPatient.hospitalId._id.equals(hospital._id)) {
            console.log("✅ VERIFICATION SUCCESS: Patient is correctly linked to the hospital.");
            console.log(`   Patient: ${fetchedPatient.name}`);
            console.log(`   Hospital: ${fetchedPatient.hospitalId.name}`);
        } else {
            console.error("❌ VERIFICATION FAILED: Hospital linkage missing or incorrect.");
        }

        mongoose.disconnect();
    } catch (error) {
        console.error("Error testing signup:", error);
        process.exit(1);
    }
};

testPatientSignup();
