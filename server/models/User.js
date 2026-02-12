const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'driver', 'super-admin'],
    required: true,
    index: true
  },

  // --- OTP & VERIFICATION ---
  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  isVerified: { type: Boolean, default: false },

  // Link to Hospital (For Admins, Doctors, and Patients)
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },

  // Department (For Doctors and Patients)
  department: { type: String, trim: true },

  // --- APPROVAL SYSTEM FOR DOCTORS ---
  isApproved: {
    type: Boolean,
    default: function () {
      // Auto-approve patients, drivers, and admin
      // Doctors need manual approval from admin
      return this.role !== 'doctor';
    }
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function () {
      return this.role === 'doctor' ? 'pending' : 'approved';
    }
  },
  rejectionReason: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },

  // --- PATIENT PRIVACY SETTINGS ---
  privacySettings: {
    profileAccess: {
      type: Map,
      of: {
        approved: { type: Boolean, default: false },
        approvedAt: { type: Date },
        approvedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        // Add expiration for single-view access
        expiresAt: { type: Date },
        // Track if this is a single-use permission
        singleUse: { type: Boolean, default: true },
        // Track if it has been used
        used: { type: Boolean, default: false }
      },
      default: {}
    }
  },

  // --- ACCESS REQUESTS ---
  accessRequests: {
    type: Map,
    of: {
      requestedAt: { type: Date },
      requestedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      respondedAt: { type: Date },
      respondedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      // Add expiration time for single-view access
      expiresAt: { type: Date },
      // Mark as single-use
      singleUse: { type: Boolean, default: true },
      // Track usage
      used: { type: Boolean, default: false }
    },
    default: {}
  },

  // --- PATIENT SPECIFIC FIELDS ---
  phone: { type: String, trim: true },
  age: { type: Number },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: '{VALUE} is not a valid gender'
    },
    trim: true,
    default: undefined // Don't set empty string
  },
  bloodGroup: {
    type: String,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: '{VALUE} is not a valid blood group'
    },
    trim: true,
    default: undefined // Don't set empty string
  },
  address: { type: String, trim: true },
  emergencyContact: { type: String, trim: true },
  medicalHistory: { type: String, trim: true }, // Existing conditions, allergies

  // --- DOCTOR SPECIFIC FIELDS ---
  specialization: { type: String, trim: true },
  hospitalName: { type: String, trim: true },
  experience: { type: String, trim: true },
  qualification: { type: String, trim: true }, // MBBS, MD, etc.
  consultationFee: { type: Number },
  availableDays: { type: String, trim: true }, // Mon-Fri, etc.
  availableTime: { type: String, trim: true }, // 9AM-5PM, etc.
  doctorPhone: { type: String, trim: true },
  licenseNumber: { type: String, trim: true },


  // --- DRIVER SPECIFIC FIELDS ---
  driverLicenseNumber: { type: String, trim: true },
  vehicleNumber: { type: String, trim: true },
  vehicleType: { type: String, trim: true }, // Ambulance type
  driverPhone: { type: String, trim: true },
  isAvailable: { type: Boolean, default: true },
  location: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

// Index for faster queries
UserSchema.index({ email: 1, role: 1 });

// Ensure password is not returned by default
UserSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);