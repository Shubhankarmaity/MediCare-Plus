/**
 * setup_hospital_admins.js
 * -------------------------
 * Creates (or updates) a default admin account for EVERY hospital in the database.
 *
 * Admin Email format : {hospitalnameslug}admin@gmail.com
 *   e.g. "City General Hospital" → "citygeneralhospitaladmin@gmail.com"
 * Password           : 123456  (hashed before storing)
 *
 * Run once: node server/setup_hospital_admins.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Hospital = require('./models/Hospital');

// Convert hospital name to a safe email slug
// "St. Mary's Memorial Hospital" → "stmarysmemorialhospital"
const toSlug = (name) =>
    name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters

const DEFAULT_PASSWORD = '123456';

const setupAdmins = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URI not found in .env');
            process.exit(1);
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const hospitals = await Hospital.find({});
        console.log(`📋 Found ${hospitals.length} hospital(s) in database.\n`);

        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        for (const hospital of hospitals) {
            const slug = toSlug(hospital.name);
            const adminEmail = `${slug}admin@gmail.com`;

            console.log(`🏥 Hospital: ${hospital.name}`);
            console.log(`   Admin Email: ${adminEmail}`);

            // Check if an admin with this email already exists
            let adminUser = await User.findOne({ email: adminEmail }).select('+password');

            if (adminUser) {
                // Update existing admin: reset password and ensure hospital link
                adminUser.password = hashedPassword;
                adminUser.hospitalId = hospital._id;
                adminUser.isVerified = true;
                adminUser.isApproved = true;
                adminUser.approvalStatus = 'approved';
                await adminUser.save();
                console.log(`   ✅ Existing admin found — password reset to '${DEFAULT_PASSWORD}', hospital re-linked.`);
            } else {
                // Check if the hospital already has a different admin linked
                let existingLinkedAdmin = null;
                if (hospital.adminId) {
                    existingLinkedAdmin = await User.findById(hospital.adminId);
                }

                if (existingLinkedAdmin) {
                    // Update the existing linked admin's password only (don't create duplicate)
                    existingLinkedAdmin.password = hashedPassword;
                    existingLinkedAdmin.isVerified = true;
                    existingLinkedAdmin.isApproved = true;
                    await existingLinkedAdmin.save();
                    console.log(`   ⚠️  Hospital already has admin: ${existingLinkedAdmin.email}`);
                    console.log(`   ✅ Password updated to '${DEFAULT_PASSWORD}' for existing admin.`);
                    // Also create the standard email admin
                    const newAdmin = await User.create({
                        name: `${hospital.name} Admin`,
                        email: adminEmail,
                        password: hashedPassword,
                        role: 'admin',
                        hospitalId: hospital._id,
                        isVerified: true,
                        isApproved: true,
                        approvalStatus: 'approved',
                    });
                    // Update hospital adminId to the new standard admin
                    await Hospital.findByIdAndUpdate(hospital._id, { adminId: newAdmin._id });
                    console.log(`   ✅ New standard admin created with email: ${adminEmail}`);
                } else {
                    // Create a brand new admin
                    const newAdmin = await User.create({
                        name: `${hospital.name} Admin`,
                        email: adminEmail,
                        password: hashedPassword,
                        role: 'admin',
                        hospitalId: hospital._id,
                        isVerified: true,
                        isApproved: true,
                        approvalStatus: 'approved',
                    });

                    // Link the admin to the hospital
                    await Hospital.findByIdAndUpdate(hospital._id, { adminId: newAdmin._id });
                    console.log(`   ✅ New admin created and linked to hospital.`);
                }
            }

            console.log('');
        }

        console.log('🎉 Done! All hospital admins have been set up.');
        console.log(`\n📝 Default Password for ALL admins: ${DEFAULT_PASSWORD}`);
        console.log('\nAdmin Email format: {hospitalnameslug}admin@gmail.com');
        console.log('Example: City General Hospital → citygeneralhospitaladmin@gmail.com');

    } catch (err) {
        console.error('❌ Error during setup:', err);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed.');
        process.exit(0);
    }
};

setupAdmins();
