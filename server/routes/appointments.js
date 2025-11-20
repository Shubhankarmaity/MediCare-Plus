const router = require('express').Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

// 1. Book Appointment (Patient)
router.post('/book', auth, async (req, res) => {
  try {
    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId: req.body.doctorId,
      patientName: req.body.patientName,
      date: req.body.date,
    });
    await newAppointment.save();
    res.json({ message: "Appointment Request Sent" });
  } catch (err) { res.status(500).json(err); }
});

// 2. Get Appointments (For Doctor Dashboard)
router.get('/my-appointments', auth, async (req, res) => {
  try {
    // If doctor, find appointments where doctorId matches
    // If patient, find where patientId matches
    const query = req.user.role === 'doctor' 
      ? { doctorId: req.user.id } 
      : { patientId: req.user.id };
      
    const appointments = await Appointment.find(query);
    res.json(appointments);
  } catch (err) { res.status(500).json(err); }
});

// 3. Update Status (Doctor: Approve/Reject)
router.put('/status/:id', auth, async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: "Status Updated" });
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;