const router = require('express').Router();
const auth = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');
const appointmentController = require('../controllers/appointmentController');

// Get All Doctors (Protected Route)
router.get('/', auth, doctorController.getAllDoctors);

// GET PUBLIC PREVIEW DOCTORS (No Auth)
router.get('/public-preview', doctorController.getPublicDoctors);

// GET PATIENT DETAILS BY ID (For Doctors with approved access)
router.get('/patient/:id', auth, doctorController.getPatientById);

// GET PATIENT MEDICAL HISTORY
router.get('/patient-history/:id', auth, appointmentController.getPatientHistory);

// UPDATE DOCTOR PROFILE
router.put('/profile', auth, doctorController.updateProfile);

module.exports = router;