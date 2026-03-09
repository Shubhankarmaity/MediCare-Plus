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
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    index: true
  },
  patientName: { type: String, required: true, trim: true },
  // Patient's preferred date (submitted during booking)
  preferredDate: { type: Date },
  preferredTimeSlot: { type: String, trim: true },
  // Admin-assigned confirmed date & time
  date: { type: Date, required: true, index: true },
  assignedTimeSlot: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['requested', 'approved', 'rejected', 'cancelled', 'completed', 'pending'], 
    default: 'requested',
    index: true
  },
  // Structured patient info
  symptoms: { type: String, trim: true },
  isEmergency: { type: Boolean, default: false },
  patientPhone: { type: String, trim: true },
  notes: { type: String, trim: true },
  // Admin assignment fields
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: { type: String, trim: true },
  assignedAt: { type: Date },
  rejectionReason: { type: String, trim: true },
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
AppointmentSchema.index({ hospitalId: 1, status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);