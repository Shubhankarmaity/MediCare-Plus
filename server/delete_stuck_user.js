const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const deleteUser = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error("MONGODB_URI is missing in .env");
            process.exit(1);
        }

        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const email = 'indiavivo956@gmail.com';
        const result = await User.deleteOne({ email: email });

        if (result.deletedCount > 0) {
            console.log(`Successfully deleted user: ${email}`);
        } else {
            console.log(`User not found: ${email}`);
        }

    } catch (error) {
        console.error("Error deleting user:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
    }
};

deleteUser();
