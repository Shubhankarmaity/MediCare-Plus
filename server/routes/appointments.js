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

// 5. Admin: Get all appointment requests for their hospital
router.get('/hospital-requests', auth, appointmentController.getHospitalAppointments);

// 6. Admin: Get doctor's booked slots for a date
router.get('/doctor-slots/:doctorId', auth, appointmentController.getDoctorSlots);

// 7. Admin: Assign appointment (approve with date/time)
router.put('/assign/:id', auth, appointmentController.assignAppointment);

// 8. Admin: Reject appointment request
router.put('/reject/:id', auth, appointmentController.rejectAppointment);

module.exports = router;