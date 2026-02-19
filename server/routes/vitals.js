const router = require('express').Router();
const Vitals = require('../models/Vitals');
const auth = require('../middleware/auth');

// GET /api/vitals - Get all vitals for the logged-in patient
router.get('/', auth, async (req, res) => {
    try {
        const vitals = await Vitals.find({ patientId: req.user.id })
            .sort({ date: -1 })
            .limit(30); // Get last 30 readings
        res.json(vitals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/vitals - Add a new vital reading
router.post('/', auth, async (req, res) => {
    try {
        const { systolic, diastolic, heartRate, bloodSugar, weight, temperature, notes, date } = req.body;

        const newVitals = new Vitals({
            patientId: req.user.id,
            date: date || new Date(),
            systolic,
            diastolic,
            heartRate,
            bloodSugar,
            weight,
            temperature,
            notes
        });

        const savedVitals = await newVitals.save();
        res.status(201).json(savedVitals);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
