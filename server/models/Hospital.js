const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
        index: true // Indexed for search performance
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    image: {
        type: String, // URL to image or empty (frontend resolves local images)
        default: ''
    },
    facilities: [{
        type: String
    }],
    totalBeds: {
        type: Number,
        required: true
    },
    availableBeds: {
        type: Number,
        required: true
    },
    // Note: ICU and Emergency are tracked via hasICU and hasEmergency below (from CSV data)
    rating: {
        type: Number,
        default: 4.5
    },
    description: {
        type: String
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // --- MEDICLAIM / INSURANCE ---
    insuranceCompany: { type: String, trim: true },   // e.g. "HDFC ERGO", "Niva Bupa"
    tpa: { type: String, trim: true },                // Third-Party Administrator
    cashlessAvailable: { type: Boolean, default: false },
    coveragePct: { type: Number },                    // Insurance coverage %
    cashlessLimit: { type: Number },                  // Max cashless amount (₹)

    // --- COST DETAILS ---
    consultationFee: { type: Number },
    avgRoomCost: { type: Number },
    avgSurgeryCost: { type: Number },

    // --- FACILITIES (from CSV) ---
    hasICU: { type: Boolean, default: false },
    hasEmergency: { type: Boolean, default: false },
    hasOT: { type: Boolean, default: false },
    ambulanceAvailable: { type: Boolean, default: false },
    diagnosticLab: { type: Boolean, default: false },
    pharmacyAvailable: { type: Boolean, default: false },

    // --- ACCREDITATION & SPECIALTY ---
    naabhAccredited: { type: Boolean, default: false },
    specialties: { type: String, trim: true },        // e.g. "Cardiology, Orthopedics, General Medicine"
    hospitalType: { type: String, trim: true },       // "Multi Specialty" / "Super Specialty" / "General"

    // --- TREATMENTS & CAPACITY ---
    availableTreatments: [{ type: String, trim: true }],  // e.g. ["angioplasty", "joint replacement"]
    doctorCount: { type: Number, default: 0 },
    waitTimeMins: { type: Number, default: 0 },
    patientSatisfactionPct: { type: Number, default: 0 },
    bloodBank: { type: Boolean, default: false },
    icuBeds: { type: Number, default: 0 },
    ventilatorCount: { type: Number, default: 0 },

    // --- NETWORK & LOCATION ---
    networkStatus: { type: String, default: 'Active' },
    distanceFromCity: { type: Number },
    pincode: { type: String, trim: true },
    totalReviews: { type: Number, default: 0 },
    lat: { type: Number },
    lng: { type: Number },

    // --- CSV Import ID (to avoid duplicates) ---
    csvHospitalId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', HospitalSchema);
