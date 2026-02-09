const router = require('express').Router();
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment'); // Optional: for cascading deletes or stats
const auth = require('../middleware/auth');

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
