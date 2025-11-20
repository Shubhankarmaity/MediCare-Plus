const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['patient', 'doctor', 'admin', 'driver'], 
    required: true 
  },
  
  // --- DOCTOR SPECIFIC FIELDS ---
  specialization: { type: String }, // e.g., Cardiologist
  hospitalName: { type: String },   // e.g., City General Hospital
  experience: { type: Number },     // e.g., 10 years

  // --- DRIVER SPECIFIC FIELDS ---
  licenseNumber: { type: String },
  vehicleNumber: { type: String },  // e.g., AMB-9988
  isAvailable: { type: Boolean, default: true },
  location: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);