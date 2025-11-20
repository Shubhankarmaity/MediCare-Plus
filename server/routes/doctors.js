const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get All Doctors (Protected Route)
router.get('/', auth, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;