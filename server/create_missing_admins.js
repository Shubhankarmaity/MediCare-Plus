const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const createMissingAdmins = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const hospitals = await Hospital.find();

        const credentials = [];

        for (const hospital of hospitals) {
            // Generate email based on hospital name
            // Remove spaces, special chars, make lowercase
            const sanitizedName = hospital.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const email = `admin${sanitizedName}@gmail.com`;
            const password = 'admin123';

            let adminUser = await User.findOne({ email });

            // If hospital already has an adminId, check who it is
            if (hospital.adminId) {
                const existingAdmin = await User.findById(hospital.adminId);
                if (existingAdmin) {
                    credentials.push({
                        hospital: hospital.name,
                        email: existingAdmin.email,
                        password: 'Use existing password (likely admin123)'
                    });
                    console.log(`Hospital ${hospital.name} already has admin: ${existingAdmin.email}`);
                    continue;
                }
            }

            // Create or Update Admin User
            if (!adminUser) {
                console.log(`Creating admin for ${hospital.name}: ${email}`);
                const hashedPassword = await bcrypt.hash(password, 10);
                adminUser = await User.create({
                    name: `${hospital.name} Admin`,
                    email: email,
                    password: hashedPassword,
                    role: 'admin',
                    hospitalId: hospital._id,
                    isApproved: true
                });
            } else {
                console.log(`Admin user exists for ${hospital.name}, linking...`);
                // Ensure they are admin and linked
                adminUser.role = 'admin';
                adminUser.hospitalId = hospital._id;
                adminUser.isApproved = true;
                await adminUser.save();
            }

            // Link Hospital
            hospital.adminId = adminUser._id;
            await hospital.save();

            credentials.push({
                hospital: hospital.name,
                email: email,
                password: password
            });
        }

        console.log('\n--- ADMIN CREDENTIALS ---');
        console.table(credentials);

        // Output for parsing
        console.log('JSON_START');
        console.log(JSON.stringify(credentials));
        console.log('JSON_END');

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createMissingAdmins();
