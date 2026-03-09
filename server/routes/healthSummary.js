const router = require('express').Router();
const auth = require('../middleware/auth');
const Vitals = require('../models/Vitals');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { generateHealthSummary, generateDailyPlan } = require('../utils/healthAnalyzer');

// GET /api/health-summary — Generate personalized health summary for the logged-in patient
router.get('/', auth, async (req, res) => {
    try {
        // Fetch last 30 vitals readings
        const vitals = await Vitals.find({ patientId: req.user.id })
            .sort({ date: -1 })
            .limit(30)
            .lean();

        // Fetch appointments with doctor reports (populate doctor name)
        const appointments = await Appointment.find({
            patientId: req.user.id,
            'doctorReport.diagnosis': { $exists: true, $ne: '' }
        })
            .populate('doctorId', 'name specialization')
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean();

        // Get user profile (for height if stored)
        const user = await User.findById(req.user.id).select('name height').lean();

        const summary = generateHealthSummary(vitals, appointments, user);

        // Generate daily health plan based on detected conditions
        const activeCategories = new Set(
            summary.currentCondition.conditions.map(c => c.category).filter(Boolean)
        );
        const dailyPlan = generateDailyPlan(activeCategories, summary.currentCondition.conditions);

        res.json({ ...summary, dailyPlan });
    } catch (err) {
        console.error('Health summary error:', err);
        res.status(500).json({ message: 'Failed to generate health summary' });
    }
});

module.exports = router;
