const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const updateAdminVerification = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all admins and super-admins
        const admins = await User.find({ role: { $in: ['admin', 'super-admin'] } });

        console.log(`Found ${admins.length} admins/super-admins.`);

        for (const admin of admins) {
            if (!admin.isVerified) {
                admin.isVerified = true;
                await admin.save();
                console.log(`Updated ${admin.email} to isVerified: true`);
            } else {
                console.log(`${admin.email} is already verified.`);
            }
        }

        console.log('Verification update complete.');
        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

updateAdminVerification();
