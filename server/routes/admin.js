const router = require('express').Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

// GET ALL SYSTEM STATS & DATA
router.get('/dashboard-data', auth, async (req, res) => {
    try {
        // 1. Check if user is Admin
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });

        // 2. Fetch Counts
        const doctorCount = await User.countDocuments({ role: 'doctor' });
        const patientCount = await User.countDocuments({ role: 'patient' });
        const driverCount = await User.countDocuments({ role: 'driver' });

        // 3. Fetch Actual Data Lists (Limit to last 10 for performance)
        const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(10);
        const appointments = await Appointment.find().sort({ createdAt: -1 }).limit(10);

        res.json({
            stats: { doctorCount, patientCount, driverCount },
            users,
            appointments
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;