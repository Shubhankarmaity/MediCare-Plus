const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  patientName: { type: String, required: true, trim: true },
  date: { type: Date, required: true, index: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending',
    index: true
  },
  notes: { type: String, trim: true },
  // Doctor's report for the patient
  doctorReport: {
    diagnosis: { type: String, trim: true },
    symptoms: { type: String, trim: true },
    prescription: { type: String, trim: true },
    dosage: { type: String, trim: true },
    duration: { type: String, trim: true },
    recommendations: { type: String, trim: true },
    testsRecommended: { type: String, trim: true },
    followUpDate: { type: Date },
    reportDate: { type: Date, default: Date.now },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
    nextVisitInstructions: { type: String, trim: true }
  }
}, { timestamps: true });

// Compound index for faster queries
AppointmentSchema.index({ doctorId: 1, status: 1 });
AppointmentSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);