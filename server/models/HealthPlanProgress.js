const mongoose = require('mongoose');

const HealthPlanProgressSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dateKey: {
    type: String,
    required: true,
    trim: true
  },
  completedItems: {
    type: Map,
    of: Boolean,
    default: {}
  }
}, { timestamps: true });

HealthPlanProgressSchema.index({ patientId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('HealthPlanProgress', HealthPlanProgressSchema);
