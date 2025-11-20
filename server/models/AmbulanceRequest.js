const mongoose = require('mongoose');

const AmbulanceRequestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientName: String,
  location: String, // "Lat, Lng" or Address
  status: { type: String, enum: ['pending', 'accepted', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('AmbulanceRequest', AmbulanceRequestSchema);