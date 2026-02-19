const mongoose = require('mongoose');

const VitalsSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    systolic: { type: Number }, // BP (e.g., 120)
    diastolic: { type: Number }, // BP (e.g., 80)
    heartRate: { type: Number }, // bpm
    bloodSugar: { type: Number }, // mg/dL
    weight: { type: Number }, // kg
    temperature: { type: Number }, // Fahrenheit or Celsius
    notes: { type: String, trim: true }
}, { timestamps: true });

// Index for efficient querying by patient and date
VitalsSchema.index({ patientId: 1, date: -1 });

module.exports = mongoose.model('Vitals', VitalsSchema);
