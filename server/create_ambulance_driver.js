const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to Database
mongoose.connect('mongodb://127.0.0.1:27017/hospital-app')
  .then(() => console.log("🔌 Connected to MongoDB..."))
  .catch(err => console.error("Connection Error:", err));

const createAmbulanceDriver = async () => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: "ambulance@gmail.com" });
    if (existingUser) {
      console.log("⚠️  User already exists:", existingUser.email);
      process.exit();
    }

    // Create ambulance driver
    const hashedPassword = await bcrypt.hash("123456", 10);
    const driver = await User.create({
      name: "Ambulance Driver",
      email: "ambulance@gmail.com",
      password: hashedPassword,
      role: "driver",
      driverLicenseNumber: "DL123456789",
      vehicleNumber: "AMB123",
      vehicleType: "Basic Ambulance",
      driverPhone: "+1234567890",
      isAvailable: true
    });

    console.log("🚗 Ambulance Driver Created:", { 
      id: driver._id, 
      email: driver.email, 
      role: driver.role,
      name: driver.name
    });

    console.log("\n📋 Login Credentials:");
    console.log("   Email: ambulance@gmail.com");
    console.log("   Password: 123456");
    
    process.exit();
  } catch (error) {
    console.error("Error creating ambulance driver:", error);
    process.exit(1);
  }
};

createAmbulanceDriver();