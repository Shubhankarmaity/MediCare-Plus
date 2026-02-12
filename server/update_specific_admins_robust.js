const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const updateAdminsRobust = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const targets = [
            {
                namePattern: /Metropolitan/i, // Matches "Metropolitan Specialty Clinc"
                email: 'adminmetropolitanspecialtyclinc@gmail.com',
                password: 'admin123'
            },
            {
                namePattern: /Sunrise/i, // Matches "Sunrise Community Medical Center"
                email: 'adminsunrisecommunitymedicalcenter@gmail.com',
                password: 'admin123'
            },
            {
                namePattern: /Green Valley/i, // Matches "Green Valley Rehabilitation Center"
                email: 'admingreenvalleyrehabilitationcenter@gmail.com',
                password: 'admin123'
            },
            {
                namePattern: /City Genera/i, // Matches "City General Hospital"
                email: 'admincitygeneralhospital@gmail.com',
                password: 'admin123'
            }
        ];

        const hashedPassword = await bcrypt.hash('admin123', 10);

        for (const target of targets) {
            console.log(`\nProcessing target matching: ${target.namePattern}`);

            // 1. Find Hospital
            const hospital = await Hospital.findOne({ name: target.namePattern });
            if (!hospital) {
                console.log(`❌ Hospital not found for pattern: ${target.namePattern}`);
                continue;
            }
            console.log(`Found Hospital: ${hospital.name} (ID: ${hospital._id})`);

            // 2. Find Admin User (by email OR by hospital.adminId link)
            let user = await User.findOne({ email: target.email });

            if (!user && hospital.adminId) {
                user = await User.findById(hospital.adminId);
                if (user) console.log(`Found linked admin user: ${user.email} (different from target email?)`);
            }

            if (user) {
                // UPDATE EXISTING
                console.log(`Updating existing admin: ${user.email}`);
                user.email = target.email; // Ensure email is what we expect
                user.password = hashedPassword;
                user.isVerified = true;
                user.role = 'admin';
                user.hospitalId = hospital._id;
                await user.save();
                console.log(`✅ Updated User.`);
            } else {
                // CREATE NEW
                console.log(`Creating NEW admin: ${target.email}`);
                user = await User.create({
                    name: `${hospital.name} Admin`,
                    email: target.email,
                    password: hashedPassword,
                    role: 'admin',
                    hospitalId: hospital._id,
                    isVerified: true,
                    isApproved: true,
                    approvalStatus: 'approved'
                });
                console.log(`✅ Created User.`);
            }

            // 3. Ensure Link
            if (hospital.adminId?.toString() !== user._id.toString()) {
                hospital.adminId = user._id;
                await hospital.save();
                console.log(`✅ Linked Hospital to Admin.`);
            } else {
                console.log(`Link verified.`);
            }
        }

        console.log('\nRobust update complete.');
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateAdminsRobust();
