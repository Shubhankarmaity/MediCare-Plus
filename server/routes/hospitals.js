const router = require('express').Router();
const Hospital = require('../models/Hospital');

// @route   GET /api/hospitals
// @desc    Get all hospitals or search by name/city
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { city, name } = req.query;
        let query = {};

        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        const hospitals = await Hospital.find(query);
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/hospitals/:id
// @desc    Get single hospital by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
        res.json(hospital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/hospitals
// @desc    Create a new hospital (for seeding/admin)
// @access  Public (should be protected in prod)
router.post('/', async (req, res) => {
    try {
        const newHospital = new Hospital(req.body);
        const savedHospital = await newHospital.save();
        res.status(201).json(savedHospital);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
