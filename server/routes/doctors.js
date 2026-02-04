const router = require('express').Router();
const auth = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');

// Get All Doctors (Protected Route)
router.get('/', auth, doctorController.getAllDoctors);

// GET PATIENT DETAILS BY ID (For Doctors with approved access)
router.get('/patient/:id', auth, doctorController.getPatientById);

module.exports = router;