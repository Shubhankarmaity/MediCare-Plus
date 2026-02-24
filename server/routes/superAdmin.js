const router = require('express').Router();
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment'); // Optional: for cascading deletes or stats
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
    }
});
const upload = multer({ storage });
// Middleware to ensure user is Super Admin
const isSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'super-admin') {
        return res.status(403).json({ message: "Access Denied: Super Admin Only" });
    }
    next();
};

// @route   GET /api/super-admin/stats
// @desc    Get global system statistics
// @access  Super Admin
router.get('/stats', auth, isSuperAdmin, async (req, res) => {
    try {
        const stats = {
            totalHospitals: await Hospital.countDocuments(),
            totalDoctors: await User.countDocuments({ role: 'doctor' }),
            totalPatients: await User.countDocuments({ role: 'patient' }),
            totalDrivers: await User.countDocuments({ role: 'driver' }),
            // You can add more global stats here like total appointments
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/super-admin/users
// @desc    Get all users (with optional role filter)
// @access  Super Admin
router.get('/users', auth, isSuperAdmin, async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : {};
        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/super-admin/user/:id
// @desc    Delete any user
// @access  Super Admin
router.delete('/user/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Optional: specific cleanup based on role (cancel appointments, etc.)

        res.json({ message: `User ${user.email} deleted successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/super-admin/hospital
// @desc    Add a new hospital
// @access  Super Admin
router.post('/hospital', auth, isSuperAdmin, upload.single('image'), async (req, res) => {
    try {
        const newHospitalData = req.body;

        // Basic validation
        if (!newHospitalData.name || !newHospitalData.city || !newHospitalData.address) {
            return res.status(400).json({ message: "Name, city, and address are required" });
        }

        // Handle Image Upload
        if (req.file) {
            // Define the base URL structure
            // If we are on production, we'd use the deployed URL. For now, localhost:5000 is for backend.
            const baseUrl = req.protocol + '://' + req.get('host');
            newHospitalData.image = `${baseUrl}/uploads/${req.file.filename}`;
        }

        const hospital = new Hospital(newHospitalData);
        await hospital.save();

        // --- AUTOMATIC ADMIN CREATION ---
        const bcrypt = require('bcryptjs');

        // Format: admin[hospitalname][4-digit-id]@hospital.com (stripping spaces and special chars)
        const cleanName = hospital.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const uniqueSuffix = Date.now().toString().slice(-4);
        const adminEmail = `admin${cleanName}${uniqueSuffix}@hospital.com`;
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const adminUser = new User({
            name: `${hospital.name} Admin`,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            hospitalId: hospital._id,
            hospitalName: hospital.name,
            isVerified: true,
            isApproved: true,
            approvalStatus: 'approved'
        });
        await adminUser.save();

        // Link the admin back to the hospital
        hospital.adminId = adminUser._id;
        await hospital.save();
        // ---------------------------------

        // Trigger ML Model Retraining
        try {
            const axios = require('axios');
            // Fetch all active hospitals to send to the ML service
            const activeHospitals = await Hospital.find({ networkStatus: 'Active' });

            // Send to Python Flask microservice
            // We use a short timeout so if the ML service is down, it doesn't hang the API response
            await axios.post('http://localhost:5001/retrain', { hospitals: activeHospitals }, { timeout: 3000 });
            console.log(`[ML Retrain] Successfully triggered retraining for ${activeHospitals.length} hospitals after adding ${hospital.name}`);
        } catch (mlError) {
            console.error('[ML Retrain] Failed to trigger retraining. The hospital was still saved.', mlError.message);
            // We do NOT fail the request if ML retraining fails, as the primary data is saved.
        }

        res.status(201).json({
            message: "Hospital added successfully",
            hospital,
            adminEmail // Send back the generated email so frontend knows what was created
        });
    } catch (err) {
        console.error("Error adding hospital:", err);
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/super-admin/hospitals
// @desc    Get all hospitals
// @access  Super Admin
router.get('/hospitals', auth, isSuperAdmin, async (req, res) => {
    try {
        const hospitals = await Hospital.find().sort({ createdAt: -1 });
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/super-admin/hospital/:id
// @desc    Delete a hospital
// @access  Super Admin
router.delete('/hospital/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!hospital) return res.status(404).json({ message: "Hospital not found" });

        // Optional: Remove users associated with this hospital or unlink them?
        // logic: update users set hospitalId = null where hospitalId = req.params.id
        await User.updateMany({ hospitalId: req.params.id }, { $unset: { hospitalId: "", hospitalName: "" } });

        res.json({ message: `Hospital ${hospital.name} deleted successfully` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/super-admin/hospital/:id/users
// @desc    Get users for a specific hospital (Doctors, Patients)
// @access  Super Admin
router.get('/hospital/:id/users', auth, isSuperAdmin, async (req, res) => {
    try {
        const hospitalId = req.params.id;
        const hospital = await Hospital.findById(hospitalId);

        if (!hospital) {
            // If fetching users for 'General' or other unlinked users, handle here if needed.
            // For now, return empty if no hospital found
            return res.status(404).json({ message: "Hospital not found" });
        }

        // Fetch doctors linked to this hospital
        // Note: Currently doctors store 'hospitalName'. Ideally we use hospitalId.
        // We will try both for robustness during migration.
        const doctors = await User.find({
            role: 'doctor',
            $or: [{ hospitalId: hospitalId }, { hospitalName: hospital.name }]
        }).select('-password');

        // Fetch patients linked to this hospital (if any) or patients who have appointments?
        // Let's stick to hospitalId for now which defines "Admission" or "Registration" at a hospital
        const patients = await User.find({
            role: 'patient',
            hospitalId: hospitalId
        }).select('-password');

        // Also fetch Admin of this hospital
        const admin = await User.findOne({
            role: 'admin',
            hospitalId: hospitalId
        }).select('-password');

        res.json({
            hospital,
            doctors,
            patients,
            admin
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
