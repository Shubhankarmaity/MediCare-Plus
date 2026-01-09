const router = require('express').Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');

// 1. Book Appointment (Patient)
router.post('/book', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log('Booking appointment - Patient:', user.name, 'Doctor ID:', req.body.doctorId);

    // --- HOSPITAL EXCLUSIVITY CHECK ---
    const doctor = await User.findById(req.body.doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Determine Doctor's Hospital ID
    let doctorHospitalId = doctor.hospitalId;

    // Fallback for doctors registered with legacy 'hospitalName' string
    if (!doctorHospitalId && doctor.hospitalName) {
      const docHospital = await Hospital.findOne({ name: doctor.hospitalName });
      if (docHospital) doctorHospitalId = docHospital._id;
    }

    if (!doctorHospitalId) {
      console.log("Doctor not linked to any hospital");
      // Optionally allow or block. For now, we proceed but can't enforce matching.
    } else {
      // 1. If Patient is already admitted (has hospitalId)
      if (user.hospitalId) {
        if (user.hospitalId.toString() !== doctorHospitalId.toString()) {
          return res.status(403).json({
            message: "You are currently admitted to a different hospital. You cannot book appointments elsewhere until discharged."
          });
        }
      }
      // 2. If Patient is NOT admitted, auto-admit them to this hospital
      else {
        user.hospitalId = doctorHospitalId;
        // Optional: Set department if not set? Maybe not for simple appointment.
        await user.save();
        console.log(`Patient ${user.name} auto-admitted to hospital ${doctorHospitalId}`);
      }
    }

    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId: req.body.doctorId,
      patientName: user.name, // Securely fetch from DB
      date: req.body.date,
    });
    await newAppointment.save();
    console.log('Appointment saved with ID:', newAppointment._id);

    // Populate patient details before emitting to Socket.io
    const populatedAppointment = await Appointment.findById(newAppointment._id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name');

    console.log('Populated appointment:', {
      id: populatedAppointment._id,
      patientName: populatedAppointment.patientId?.name || populatedAppointment.patientName,
      doctorId: populatedAppointment.doctorId,
      date: populatedAppointment.date
    });

    // Notify the specific doctor via Socket.io
    if (req.io) {
      console.log('Emitting new_appointment event');
      req.io.emit('new_appointment', populatedAppointment);

      // --- NOTIFY HOSPITAL ADMIN ---
      try {
        const doctor = await User.findById(req.body.doctorId);
        if (doctor) {
          let hospital;

          // 1. Try finding by ID (Robust method)
          if (doctor.hospitalId) {
            hospital = await Hospital.findById(doctor.hospitalId);
          }
          // 2. Fallback to name (Legacy method)
          else if (doctor.hospitalName) {
            hospital = await Hospital.findOne({ name: doctor.hospitalName });
          }

          if (hospital && hospital.adminId) {
            console.log(`Notifying Admin ${hospital.adminId} for hospital ${hospital.name}`);

            req.io.emit(`notification_${hospital.adminId}`, {
              type: 'new_appointment',
              message: `New appointment booked for ${doctor.name}`,
              appointment: populatedAppointment
            });

            req.io.emit('admin_notification', {
              adminId: hospital.adminId,
              type: 'new_appointment',
              appointment: populatedAppointment
            });
          } else {
            console.log('No specific admin found for hospital linked to doctor:', doctor.name);
          }
        }
      } catch (notifyErr) {
        console.error('Error notifying admin:', notifyErr);
      }
    } else {
      console.error("Socket.io not attached to request");
    }

    res.json({ message: "Appointment Request Sent" });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json(err);
  }
});

// 2. Get Appointments (For Doctor Dashboard)
router.get('/my-appointments', auth, async (req, res) => {
  try {
    // If doctor, find appointments where doctorId matches
    // If patient, find where patientId matches
    const query = req.user.role === 'doctor'
      ? { doctorId: req.user.id }
      : { patientId: req.user.id };

    console.log(`Fetching appointments for ${req.user.role}:`, req.user.id);
    console.log('Query:', query);

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization hospitalName experience consultationFee availableDays availableTime doctorPhone')
      .sort({ createdAt: -1 });

    console.log(`Found ${appointments.length} appointments`);

    // If user is a doctor, check if they have access to patient profiles
    if (req.user.role === 'doctor') {
      // For each appointment, check if the doctor has access to the patient's profile
      for (let i = 0; i < appointments.length; i++) {
        const appointment = appointments[i];
        if (appointment.patientId) {
          // Get the patient ID (could be an object or string)
          const patientId = appointment.patientId._id || appointment.patientId;
          const patient = await User.findById(patientId).select('privacySettings accessRequests');
          if (patient) {
            const privacySettings = patient.privacySettings || {};
            const profileAccess = privacySettings.profileAccess || new Map();

            // Check if this doctor has explicit access or if access is granted to all doctors
            const doctorAccess = profileAccess.get(req.user.id);
            const generalDoctorAccess = profileAccess.get('doctors');

            // Check for valid, non-expired, non-used access
            const hasValidAccess = (doctorAccess && doctorAccess.approved &&
              (!doctorAccess.expiresAt || doctorAccess.expiresAt > new Date()) &&
              (!doctorAccess.singleUse || !doctorAccess.used));

            // Check if there's a pending access request
            const accessRequests = patient.accessRequests || new Map();
            const accessRequest = accessRequests.get(req.user.id);

            // If no access, remove sensitive patient information
            if (!hasValidAccess) {
              // Only provide minimal patient information
              if (appointment.patientId.email) {
                appointment.patientId.email = undefined;
              }
              // Note: We still provide the name as it's needed for appointment identification
            }
            // Note: We don't consume the permission here to allow the PatientDetails component to use it
          }
        }
      }
    }

    // Log each appointment for debugging
    appointments.forEach((apt, index) => {
      console.log(`Appointment ${index + 1}:`, {
        id: apt._id,
        patient: apt.patientId?.name || apt.patientName,
        doctor: apt.doctorId?.name,
        status: apt.status,
        date: apt.date
      });
    });

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json(err);
  }
});

// 3. Update Status (Doctor: Approve/Reject)
router.put('/status/:id', auth, async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: "Status Updated" });
  } catch (err) { res.status(500).json(err); }
});

// 4. Submit Doctor Report (Doctor only)
router.put('/report/:id', auth, async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: "Access denied. Doctors only." });
    }

    console.log('Submitting report for appointment:', req.params.id);
    console.log('Report data:', req.body);

    // Update appointment with doctor's report
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          doctorReport: {
            ...req.body,
            reportDate: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    console.log('Report submitted successfully for appointment:', updatedAppointment._id);
    res.json({ message: "Report submitted successfully", appointment: updatedAppointment });
  } catch (err) {
    console.error('Error submitting report:', err);
    res.status(500).json(err);
  }
});

module.exports = router;