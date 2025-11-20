const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

// Connect to Database
mongoose.connect('mongodb://127.0.0.1:27017/hospital-app')
  .then(() => console.log("🔌 Connected to MongoDB..."))
  .catch(err => console.error("Connection Error:", err));

const clearData = async () => {
  try {
    console.log("🔥 Deleting all data...");
    
    // Delete All Users (Doctors, Patients, Admins, Drivers)
    await User.deleteMany({});
    console.log("✅ Users Collection Cleared");

    // Delete All Appointments
    await Appointment.deleteMany({});
    console.log("✅ Appointments Collection Cleared");

    console.log("✨ Database is now Fresh and Empty!");
    process.exit();
  } catch (error) {
    console.error("Error clearing DB:", error);
    process.exit(1);
  }
};

clearData();