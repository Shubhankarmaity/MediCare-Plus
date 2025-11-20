const router = require('express').Router();
const User = require('../models/User');
const AmbulanceRequest = require('../models/AmbulanceRequest');
const auth = require('../middleware/auth');

// 1. Get All Available Drivers
router.get('/drivers', auth, async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.json(drivers);
  } catch (err) { res.status(500).json(err); }
});

// 2. Book a Driver
router.post('/book', auth, async (req, res) => {
  try {
    const newRequest = new AmbulanceRequest({
      patientId: req.user.id,
      driverId: req.body.driverId,
      patientName: req.body.patientName,
      location: "40.7128, -74.0060" // Mock GPS for now
    });
    await newRequest.save();
    res.json({ message: "Ambulance Dispatched!" });
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;