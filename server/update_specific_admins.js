const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const updateSpecificAdmins = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const targetEmails = [
            'admingreenvalleyrehabilitationcenter@gmail.com',
            'adminmetropolitanspecialtyclinc@gmail.com',
            'adminsunrisecommunitymedicalcenter@gmail.com',
            'admincitygeneralhospital@gmail.com'
        ];

        const defaultPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        for (const email of targetEmails) {
            const user = await User.findOne({ email });

            if (user) {
                console.log(`Found: ${email}`);
                user.password = hashedPassword;
                user.isVerified = true;
                await user.save();
                console.log(`✅ Updated ${email}: Password set to '${defaultPassword}', Verified: true`);
            } else {
                console.log(`❌ User not found: ${email}`);
                // Optional: Check if maybe there's an email with a typo or slight variation?
                // For now, strict match.
            }
        }

        console.log('Update process finished.');
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateSpecificAdmins();
