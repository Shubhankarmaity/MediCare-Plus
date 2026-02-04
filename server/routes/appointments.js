const router = require('express').Router();
const auth = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

// 1. Book Appointment (Patient)
router.post('/book', auth, appointmentController.bookAppointment);

// 2. Get Appointments (For Doctor Dashboard)
router.get('/my-appointments', auth, appointmentController.getMyAppointments);

// 3. Update Status (Doctor: Approve/Reject)
router.put('/status/:id', auth, appointmentController.updateStatus);

// 4. Submit Doctor Report (Doctor only)
router.put('/report/:id', auth, appointmentController.submitReport);

module.exports = router;