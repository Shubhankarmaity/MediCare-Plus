const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const AmbulanceRequest = require('./models/AmbulanceRequest');

// Connect to Database
mongoose.connect('mongodb://127.0.0.1:27017/hospital-app')
  .then(() => console.log("🔌 Connected to MongoDB..."))
  .catch(err => console.error("Connection Error:", err));

const clearData = async () => {
  try {
    console.log("🔥 Deleting all data...");

    // Delete All Collections
    await User.deleteMany({});
    console.log("✅ Users Collection Cleared");

    await Appointment.deleteMany({});
    console.log("✅ Appointments Collection Cleared");

    await AmbulanceRequest.deleteMany({});
    console.log("✅ Ambulance Requests Collection Cleared");

    // CREATE ONLY DEFAULT ADMIN
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "System Admin",
      email: "admin@hospital.com",
      password: hashedPassword,
      role: "admin"
    });
    console.log("👤 Default Admin Created:", { id: admin._id, email: admin.email, role: admin.role });

    console.log("\n✨ Database Reset Complete!");
    console.log("\n📋 Default Account:");
    console.log("   Admin: admin@hospital.com / admin123");
    console.log("\n💡 Users can now register as:");
    console.log("   - Doctors (will appear in patient dashboard)");
    console.log("   - Patients (can book doctors)");
    console.log("   - Drivers (for ambulance services)");
    
    process.exit();
  } catch (error) {
    console.error("Error clearing DB:", error);
    process.exit(1);
  }
};

clearData();