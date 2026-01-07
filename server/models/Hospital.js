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
    }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', HospitalSchema);
