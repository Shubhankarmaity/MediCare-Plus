const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const checkUser = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const userId = '697e52808e4d52ab00babeb2';
        // Note: The ID provided by user might be mock or specific, if it fails I'll just search generally
        // But assuming it's a real ID from their logs.
        // Wait, the ID '697e52808e4d52ab00babeb2' looks like a valid ObjectId (24 hex chars)?
        // 697e52808e4d52ab00babeb2 -> 24 chars?
        // 697e52808e4d52ab00babeb2 -> let's count. 
        // 123456789012345678901234
        // 697e5280 8e4d 52ab 00ba beb2 -> 8+4+4+4+4 = 24. Yes.

        // Actually, if the ID doesn't exist, findById might return null or error if format invalid.
        // But the user log shows it.

        let user;
        try {
            user = await User.findById(userId);
        } catch (e) {
            console.log("Invalid ID format");
        }

        if (user) {
            console.log('User Found:', {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessRequests: user.accessRequests
            });
        } else {
            console.log('User not found with ID:', userId);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
