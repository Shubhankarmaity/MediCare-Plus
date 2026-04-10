const router = require('express').Router();
const auth = require('../middleware/auth');
const Vitals = require('../models/Vitals');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { generateHealthSummary, generateDailyPlan } = require('../utils/healthAnalyzer');

// GET /api/health-summary — Generate personalized health summary for the logged-in patient
router.get('/', auth, async (req, res) => {
    try {
        // Verify user ID exists
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: No user ID in token' });
        }

        // Fetch last 30 vitals readings
        const vitals = await Vitals.find({ patientId: req.user.id })
            .sort({ date: -1 })
            .limit(30)
            .lean();

        console.log(`[Health Summary] Patient ${req.user.id}: Found ${vitals.length} vital readings`);

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
        if (!user) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Guard: ensure vitals is an array
        if (!Array.isArray(vitals)) {
            return res.status(500).json({ message: 'Invalid vitals data format' });
        }

        const summary = generateHealthSummary(vitals, appointments, user);

        // Generate daily health plan based on detected conditions
        const activeCategories = new Set(
            summary.currentCondition.conditions.map(c => c.category).filter(Boolean)
        );
        const dailyPlan = generateDailyPlan(activeCategories, summary.currentCondition.conditions);

        const response = { ...summary, dailyPlan };
        console.log(`[Health Summary] Generated summary with ${Object.keys(response).length} fields`);
        
        res.json(response);
    } catch (err) {
        console.error('Health summary error:', err);
        res.status(500).json({ message: err.message || 'Failed to generate health summary' });
    }
});

module.exports = router;
