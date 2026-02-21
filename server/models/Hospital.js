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
        type: String, // URL to image
        default: 'https://images.unsplash.com/photo-1587351021759-3e566b9af922?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
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
    icuAvailable: {
        type: Boolean,
        default: false
    },
    emergencyServices: {
        type: Boolean,
        default: true
    },
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
    specialties: { type: String, trim: true },        // e.g. "Cardiology", "Orthopedics"
    hospitalType: { type: String, trim: true },       // "Multi Specialty" / "Super Specialty"

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
