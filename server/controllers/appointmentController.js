const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Notification = require('../models/Notification');

// ─── PATIENT: Book Appointment (creates a "requested" appointment for admin review) ───
exports.bookAppointment = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { doctorId, date, symptoms, isEmergency, phone, timeSlot } = req.body;

        const doctor = await User.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        // --- HOSPITAL EXCLUSIVITY CHECK ---
        let doctorHospitalId = doctor.hospitalId;
        if (!doctorHospitalId && doctor.hospitalName) {
            const docHospital = await Hospital.findOne({ name: doctor.hospitalName });
            if (docHospital) doctorHospitalId = docHospital._id;
        }

        if (doctorHospitalId) {
            if (user.hospitalId) {
                if (user.hospitalId.toString() !== doctorHospitalId.toString()) {
                    return res.status(403).json({
                        message: "You are currently admitted to a different hospital. You cannot book appointments elsewhere until discharged."
                    });
                }
            } else {
                user.hospitalId = doctorHospitalId;
                await user.save();
            }
        }

        const newAppointment = new Appointment({
            patientId: req.user.id,
            doctorId,
            hospitalId: doctorHospitalId || undefined,
            patientName: user.name,
            preferredDate: date,
            preferredTimeSlot: timeSlot || '',
            date: date, // Initial date = preferred, admin will override
            symptoms: symptoms || '',
            isEmergency: isEmergency || false,
            patientPhone: phone || user.phone || '',
            status: 'requested'
        });
        await newAppointment.save();

        const populatedAppointment = await Appointment.findById(newAppointment._id)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization');

        // --- NOTIFY HOSPITAL ADMIN via Socket.IO ---
        if (req.io && doctorHospitalId) {
            try {
                const hospital = await Hospital.findById(doctorHospitalId);
                if (hospital && hospital.adminId) {
                    // Save notification to DB
                    await Notification.create({
                        userId: hospital.adminId,
                        type: 'APPOINTMENT_REQUEST',
                        message: `New appointment request from ${user.name} for Dr. ${doctor.name}${isEmergency ? ' [EMERGENCY]' : ''}`
                    });

                    req.io.emit(`notification_${hospital.adminId}`, {
                        type: 'appointment_request',
                        message: `New appointment request from ${user.name} for Dr. ${doctor.name}${isEmergency ? ' ⚠️ EMERGENCY' : ''}`,
                        appointment: populatedAppointment
                    });

                    req.io.emit('admin_appointment_request', {
                        adminId: hospital.adminId,
                        appointment: populatedAppointment
                    });
                }
            } catch (notifyErr) {
                console.error('Error notifying admin:', notifyErr);
            }
        }

        res.json({ message: "Appointment request sent to hospital admin for approval." });
    } catch (err) {
        console.error('Error booking appointment:', err);
        res.status(500).json({ message: "Failed to submit appointment request" });
    }
};

// ─── GET MY APPOINTMENTS (Patient or Doctor) ───
exports.getMyAppointments = async (req, res) => {
    try {
        const query = req.user.role === 'doctor'
            ? { doctorId: req.user.id, status: { $in: ['approved', 'completed'] } } // Doctors only see admin-approved
            : { patientId: req.user.id };

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization hospitalName experience consultationFee availableDays availableTime doctorPhone')
            .sort({ createdAt: -1 });

        // If user is a doctor, check privacy access
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

                        // Check for valid, non-expired, non-used access
                        const hasValidAccess = (doctorAccess && doctorAccess.approved &&
                            (!doctorAccess.expiresAt || doctorAccess.expiresAt > new Date()) &&
                            (!doctorAccess.singleUse || !doctorAccess.used));

                        // If no access, remove sensitive patient information
                        if (!hasValidAccess) {
                            // Only provide minimal patient information
                            if (appointment.patientId.email) {
                                appointment.patientId.email = undefined;
                            }
                            // Note: We still provide the name as it's needed for appointment identification
                        }
                    }
                }
            }
        }

        res.json(appointments);
    } catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json(err);
    }
};

// ─── UPDATE STATUS (backward compat for cancel) ───
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Only allow patients to cancel their own requested appointments
        if (status === 'cancelled') {
            const apt = await Appointment.findById(req.params.id);
            if (!apt) return res.status(404).json({ message: "Appointment not found" });
            if (apt.patientId.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: "Not authorized" });
            }
        }
        await Appointment.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: "Status Updated" });
    } catch (err) { res.status(500).json(err); }
};

exports.submitReport = async (req, res) => {
    try {
        // Verify user is a doctor
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: "Access denied. Doctors only." });
        }

        console.log('Submitting report for appointment:', req.params.id);
        console.log('Report data:', req.body);

        // Update appointment with doctor's report and mark as completed
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    doctorReport: {
                        ...req.body,
                        reportDate: new Date()
                    },
                    status: 'completed'
                }
            },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        console.log('Report submitted successfully for appointment:', updatedAppointment._id);

        // Notify patient that checkup is completed and report is ready
        if (req.io && updatedAppointment.patientId) {
            req.io.emit(`notification_${updatedAppointment.patientId}`, {
                type: 'appointment_completed',
                message: 'Your checkup is completed and the doctor\'s report is ready.',
                appointmentId: updatedAppointment._id
            });
        }

        res.json({ message: "Report submitted successfully", appointment: updatedAppointment });
    } catch (err) {
        console.error('Error submitting report:', err);
        res.status(500).json(err);
    }
};

exports.getPatientHistory = async (req, res) => {
    try {
        const { id } = req.params; // Patient ID
        const doctorId = req.user.id;
        console.log(`Fetching medical history for patient: ${id} by doctor: ${doctorId}`);

        // 1. Check Access Permissions
        const patient = await User.findById(id);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        // Check if doctor has access
        const privacySettings = patient.privacySettings || {};
        const profileAccess = privacySettings.profileAccess || new Map();

        // Handle Map or Object
        let doctorAccess;
        if (profileAccess instanceof Map) {
            doctorAccess = profileAccess.get(doctorId);
        } else {
            doctorAccess = profileAccess[doctorId];
        }

        const hasAccess = (doctorAccess && doctorAccess.approved &&
            (!doctorAccess.expiresAt || new Date(doctorAccess.expiresAt) > new Date()));

        if (!hasAccess) {
            console.log(`Access denied for doctor ${doctorId} to patient ${id}`);
            return res.status(403).json({ message: "Access to this patient's history requires approval." });
        }

        const history = await Appointment.find({
            patientId: id,
            status: { $in: ['approved', 'completed'] } // Only show confirmed past/present interaction
        })
            .populate('doctorId', 'name specialization')
            .sort({ date: -1 }); // Newest first

        console.log(`Found ${history.length} past records for patient ${id}`);
        res.json(history);
    } catch (err) {
        console.error('Error fetching patient history:', err);
        res.status(500).json({ message: "Error fetching patient history" });
    }
};

// ─── ADMIN: Get all appointment requests for their hospital ───
exports.getHospitalAppointments = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        // Find the hospital this admin manages
        const hospital = await Hospital.findOne({ adminId: req.user.id });
        if (!hospital) {
            return res.status(404).json({ message: "No hospital found for this admin." });
        }

        // Find all doctors in this hospital
        const hospitalDoctors = await User.find({
            role: 'doctor',
            $or: [
                { hospitalId: hospital._id },
                { hospitalName: hospital.name }
            ],
            approvalStatus: 'approved'
        }).select('_id');

        const doctorIds = hospitalDoctors.map(d => d._id);

        const statusFilter = req.query.status || 'all';
        const query = { doctorId: { $in: doctorIds } };
        if (statusFilter !== 'all') {
            query.status = statusFilter;
        }

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name email phone age gender bloodGroup')
            .populate('doctorId', 'name specialization availableDays availableTime department')
            .populate('assignedBy', 'name')
            .sort({ isEmergency: -1, createdAt: -1 });

        res.json(appointments);
    } catch (err) {
        console.error('Error fetching hospital appointments:', err);
        res.status(500).json({ message: "Failed to fetch appointments" });
    }
};

// ─── ADMIN: Get doctor's existing appointments for a date (to find free slots) ───
exports.getDoctorSlots = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const { doctorId } = req.params;
        const { date } = req.query; // format: YYYY-MM-DD

        const doctor = await User.findById(doctorId).select('name specialization availableDays availableTime');
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        // Get all approved appointments for that doctor on that date
        let existingAppointments = [];
        if (date) {
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            existingAppointments = await Appointment.find({
                doctorId,
                date: { $gte: dayStart, $lte: dayEnd },
                status: { $in: ['approved', 'requested'] }
            })
                .populate('patientId', 'name')
                .sort({ date: 1 });
        }

        res.json({
            doctor: {
                _id: doctor._id,
                name: doctor.name,
                specialization: doctor.specialization,
                availableDays: doctor.availableDays,
                availableTime: doctor.availableTime
            },
            existingAppointments
        });
    } catch (err) {
        console.error('Error fetching doctor slots:', err);
        res.status(500).json({ message: "Failed to fetch doctor schedule" });
    }
};

// ─── ADMIN: Assign appointment (approve with confirmed date/time) ───
exports.assignAppointment = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const { id } = req.params;
        const { assignedDate, assignedTimeSlot, adminNotes } = req.body;

        if (!assignedDate || !assignedTimeSlot) {
            return res.status(400).json({ message: "Assigned date and time slot are required." });
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        if (appointment.status !== 'requested') {
            return res.status(400).json({ message: "Only requested appointments can be assigned." });
        }

        // Update appointment
        appointment.date = new Date(assignedDate);
        appointment.assignedTimeSlot = assignedTimeSlot;
        appointment.status = 'approved';
        appointment.assignedBy = req.user.id;
        appointment.assignedAt = new Date();
        appointment.adminNotes = adminNotes || '';
        await appointment.save();

        const populatedApt = await Appointment.findById(id)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name specialization');

        const formattedDate = new Date(assignedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Notify PATIENT
        await Notification.create({
            userId: appointment.patientId,
            type: 'APPOINTMENT_ASSIGNED',
            message: `Your appointment with Dr. ${populatedApt.doctorId?.name} is confirmed for ${formattedDate} at ${assignedTimeSlot}.`
        });

        // Notify DOCTOR
        await Notification.create({
            userId: appointment.doctorId,
            type: 'APPOINTMENT_ASSIGNED',
            message: `New patient ${populatedApt.patientId?.name} assigned to you on ${formattedDate} at ${assignedTimeSlot}.`
        });

        // Real-time notifications via Socket.IO
        if (req.io) {
            req.io.emit(`notification_${appointment.patientId}`, {
                type: 'appointment_assigned',
                message: `Your appointment with Dr. ${populatedApt.doctorId?.name} is confirmed for ${formattedDate} at ${assignedTimeSlot}.`,
                appointment: populatedApt
            });

            req.io.emit(`notification_${appointment.doctorId}`, {
                type: 'appointment_assigned',
                message: `New patient ${populatedApt.patientId?.name} assigned to you on ${formattedDate} at ${assignedTimeSlot}.`,
                appointment: populatedApt
            });

            // Emit to doctor's new_appointment listener
            req.io.emit('new_appointment', populatedApt);
        }

        res.json({ message: "Appointment assigned successfully.", appointment: populatedApt });
    } catch (err) {
        console.error('Error assigning appointment:', err);
        res.status(500).json({ message: "Failed to assign appointment" });
    }
};

// ─── ADMIN: Reject appointment request ───
exports.rejectAppointment = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const { id } = req.params;
        const { reason } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        if (appointment.status !== 'requested') {
            return res.status(400).json({ message: "Only requested appointments can be rejected." });
        }

        appointment.status = 'rejected';
        appointment.rejectionReason = reason || 'No reason provided';
        appointment.assignedBy = req.user.id;
        await appointment.save();

        const populatedApt = await Appointment.findById(id)
            .populate('doctorId', 'name');

        // Notify PATIENT
        await Notification.create({
            userId: appointment.patientId,
            type: 'APPOINTMENT_REJECTED',
            message: `Your appointment request for Dr. ${populatedApt.doctorId?.name} was declined. Reason: ${reason || 'No reason provided'}`
        });

        if (req.io) {
            req.io.emit(`notification_${appointment.patientId}`, {
                type: 'appointment_rejected',
                message: `Your appointment request was declined. Reason: ${reason || 'No reason provided'}`,
                appointment: populatedApt
            });
        }

        res.json({ message: "Appointment rejected.", appointment: populatedApt });
    } catch (err) {
        console.error('Error rejecting appointment:', err);
        res.status(500).json({ message: "Failed to reject appointment" });
    }
};
