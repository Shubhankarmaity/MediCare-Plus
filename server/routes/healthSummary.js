const router = require('express').Router();
const auth = require('../middleware/auth');
const Vitals = require('../models/Vitals');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const HealthPlanProgress = require('../models/HealthPlanProgress');
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

        const savedProgress = await HealthPlanProgress.findOne({
            patientId: req.user.id,
            dateKey: dailyPlan.dateKey
        }).lean();

        dailyPlan.completedItems = savedProgress?.completedItems || {};

        res.json({ ...summary, dailyPlan });
    } catch (err) {
        console.error('Health summary error:', err);
        res.status(500).json({ message: 'Failed to generate health summary' });
    }
});

// PUT /api/health-summary/progress — Save today's checklist completion state
router.put('/progress', auth, async (req, res) => {
    try {
        if (req.user.role !== 'patient') {
            return res.status(403).json({ message: 'Only patients can update health plan progress' });
        }

        const { dateKey, completedItems } = req.body;

        if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
            return res.status(400).json({ message: 'Valid dateKey (YYYY-MM-DD) is required' });
        }

        if (!completedItems || typeof completedItems !== 'object' || Array.isArray(completedItems)) {
            return res.status(400).json({ message: 'completedItems must be an object' });
        }

        const normalized = {};
        const keys = Object.keys(completedItems).slice(0, 300);
        for (const key of keys) {
            normalized[key] = !!completedItems[key];
        }

        await HealthPlanProgress.findOneAndUpdate(
            { patientId: req.user.id, dateKey },
            { $set: { completedItems: normalized } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, dateKey, completedItems: normalized });
    } catch (err) {
        console.error('Health plan progress save error:', err);
        res.status(500).json({ message: 'Failed to save health plan progress' });
    }
});

module.exports = router;
