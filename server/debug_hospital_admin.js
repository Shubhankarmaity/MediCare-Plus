require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');

async function testQuery() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Get the most recently created hospital
    const latestHospital = await Hospital.findOne().sort({ createdAt: -1 });
    console.log("Newly Created Hospital:", latestHospital.name);
    console.log("Hospital's adminId:", latestHospital.adminId);

    // Find the user linked to this hospital
    const adminUser = await User.findOne({ hospitalId: latestHospital._id });
    if (adminUser) {
        console.log("Found User:");
        console.log("  Name:", adminUser.name);
        console.log("  Email:", adminUser.email);
        console.log("  Role:", adminUser.role);
        console.log("  isVerified:", adminUser.isVerified);
        console.log("  isApproved:", adminUser.isApproved);
        console.log("  approvalStatus:", adminUser.approvalStatus);
    } else {
        console.log("No User found matching this hospital's ID.");

        // Let's try finding the most recently created user instead
        const latestUser = await User.findOne({ role: 'admin' }).sort({ createdAt: -1 });
        console.log("Most recently created Admin User:", latestUser.email);
    }

    process.exit(0);
}

testQuery();
