const router = require('express').Router();
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// GET ALL SYSTEM STATS & DATA
router.get('/dashboard-data', auth, async (req, res) => {
    try {
        // 1. Check if user is Admin
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });

        // Fetch full admin details to get hospitalId
        const currentAdmin = await User.findById(req.user.id);
        if (!currentAdmin || !currentAdmin.hospitalId) {
            return res.status(400).json({ message: "Admin is not linked to any hospital" });
        }

        const hospital = await Hospital.findById(currentAdmin.hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: "Linked hospital not found" });
        }

        console.log(`Fetching dashboard data for Admin: ${currentAdmin.email}, Hospital: ${hospital.name}`);

        // 2. Fetch Counts (Scoped to this Hospital)
        const doctorCount = await User.countDocuments({
            role: 'doctor',
            $or: [{ hospitalId: hospital._id }, { hospitalName: hospital.name }]
        });

        // Only count patients registered/admitted to this hospital
        const patientCount = await User.countDocuments({
            role: 'patient',
            hospitalId: hospital._id
        });

        // Only count drivers linked to this hospital
        const driverCount = await User.countDocuments({
            role: 'driver',
            hospitalId: hospital._id
        });

        // 3. Fetch Data Lists (Scoped to this Hospital only)
        const doctors = await User.find({
            role: 'doctor',
            $or: [{ hospitalId: hospital._id }, { hospitalName: hospital.name }]
        }).select('-password').sort({ createdAt: -1 });

        const patients = await User.find({
            role: 'patient',
            hospitalId: hospital._id
        }).select('-password').sort({ createdAt: -1 });

        // Combine into users array (doctors of this hospital + patients of this hospital)
        const users = [...doctors, ...patients];

        // 4. Appointments scoped to doctors of this hospital
        const doctorIds = doctors.map(d => d._id);
        const appointments = await Appointment.find({ doctorId: { $in: doctorIds } })
            .populate('patientId', 'name email')
            .populate('doctorId', 'name specialization')
            .sort({ createdAt: -1 });

        res.json({
            stats: { doctorCount, patientCount, driverCount },
            users,
            appointments
        });
    } catch (err) {
        console.error("Error fetching dashboard data:", err);
        res.status(500).json({ message: err.message });
    }
});

// GET DETAILED USER INFORMATION BY ID
router.get('/user/:id', auth, async (req, res) => {
    try {
        // Check if user is Admin
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });

        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if requesting user wants to access a patient's profile
        // If so, verify that the patient has granted access permission
        if (user.role === 'patient') {
            // Check if the admin has been granted access by the patient
            const accessRequests = user.accessRequests || new Map();
            const accessRequest = accessRequests.get(req.user.id.toString());

            // Check for valid, non-expired, non-used access
            const hasValidAccess = (accessRequest && accessRequest.status === 'approved' &&
                (!accessRequest.expiresAt || new Date(accessRequest.expiresAt) > new Date()) &&
                (!accessRequest.singleUse || !accessRequest.used));

            if (!hasValidAccess) {
                // If there's a pending request, inform the admin
                if (accessRequest && accessRequest.status === 'pending') {
                    return res.status(403).json({
                        message: "Access request is pending patient approval.",
                        requiresApproval: true,
                        requestPending: true,
                        userId: user._id
                    });
                } else {
                    return res.status(403).json({
                        message: "Access to this patient's profile requires their explicit approval.",
                        requiresApproval: true,
                        requestPending: false,
                        userId: user._id
                    });
                }
            }

            // If we have single-use access, mark it as used
            if (accessRequest && accessRequest.singleUse) {
                accessRequest.used = true;
                accessRequests.set(req.user.id.toString(), accessRequest);
                user.accessRequests = accessRequests;
                await user.save();
            }
        }

        // Get appointments related to this user
        let appointments = [];
        if (user.role === 'doctor') {
            appointments = await Appointment.find({ doctorId: user._id })
                .populate('patientId', 'name email')
                .sort({ createdAt: -1 });
        } else if (user.role === 'patient') {
            appointments = await Appointment.find({ patientId: user._id })
                .populate('doctorId', 'name specialization hospitalName')
                .sort({ createdAt: -1 });
        }

        res.json({
            user,
            appointments,
            stats: {
                totalAppointments: appointments.length,
                pendingAppointments: appointments.filter(a => a.status === 'pending').length,
                approvedAppointments: appointments.filter(a => a.status === 'approved').length,
                rejectedAppointments: appointments.filter(a => a.status === 'rejected').length
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// GET PENDING DOCTOR REGISTRATIONS
router.get('/pending-doctors', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });

        const currentAdmin = await User.findById(req.user.id);
        const hospital = await Hospital.findById(currentAdmin.hospitalId);

        if (!hospital) return res.status(400).json({ message: "Admin not linked to a hospital" });

        logger.info(`Fetching pending doctors for ${hospital.name}...`);

        const pendingDoctors = await User.find({
            role: 'doctor',
            approvalStatus: 'pending',
            $or: [
                { hospitalId: hospital._id },
                { hospitalName: hospital.name } // fallback for legacy records
            ]
        }).select('-password').sort({ createdAt: -1 });

        logger.info(`Found ${pendingDoctors.length} pending doctors for ${hospital.name}`);
        res.json(pendingDoctors);
    } catch (err) {
        logger.error(`Error fetching pending doctors: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
});

// APPROVE DOCTOR
router.put('/approve-doctor/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });

        const currentAdmin = await User.findById(req.user.id);
        const hospital = await Hospital.findById(currentAdmin.hospitalId);

        if (!hospital) return res.status(400).json({ message: "Admin not linked to a hospital" });

        console.log('Approving doctor:', req.params.id, 'by admin:', req.user.id);

        // Find doctor first to verify hospital match
        const doctorToApprove = await User.findById(req.params.id);
        if (!doctorToApprove) return res.status(404).json({ message: "Doctor not found" });

        // Verify hospital match using hospitalId (reliable) with hospitalName as fallback
        const doctorHospitalId = doctorToApprove.hospitalId?.toString();
        if (doctorHospitalId && doctorHospitalId !== hospital._id.toString()) {
            if (doctorToApprove.hospitalName !== hospital.name) {
                return res.status(403).json({ message: 'You can only approve doctors for your own hospital' });
            }
        }

        const { department } = req.body;
        const updateData = {
            isApproved: true,
            approvalStatus: 'approved',
            approvedBy: req.user.id,
            approvedAt: new Date(),
            rejectionReason: null // Clear any previous rejection
        };

        // Only add department if provided
        if (department) {
            updateData.department = department;
        }

        const doctor = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        console.log('Doctor approved:', doctor.email);

        // Notify via Socket.io
        if (req.io) {
            req.io.emit('doctor_approved', doctor);
        }

        res.json({ message: "Doctor approved successfully", doctor });
    } catch (err) {
        console.error('Error approving doctor:', err);
        res.status(500).json({ message: err.message });
    }
});

// REJECT DOCTOR
router.put('/reject-doctor/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });

        const currentAdmin = await User.findById(req.user.id);
        const hospital = await Hospital.findById(currentAdmin.hospitalId);

        if (!hospital) return res.status(400).json({ message: "Admin not linked to a hospital" });

        const { reason } = req.body;
        console.log('Rejecting doctor:', req.params.id, 'Reason:', reason);

        // Verify hospital match
        const doctorToReject = await User.findById(req.params.id);
        if (!doctorToReject) return res.status(404).json({ message: "Doctor not found" });

        // Verify hospital match using hospitalId (reliable) with hospitalName as fallback
        const doctorHospitalId = doctorToReject.hospitalId?.toString();
        if (doctorHospitalId && doctorHospitalId !== hospital._id.toString()) {
            if (doctorToReject.hospitalName !== hospital.name) {
                return res.status(403).json({ message: 'You can only reject doctors for your own hospital' });
            }
        }

        const doctor = await User.findByIdAndUpdate(
            req.params.id,
            {
                isApproved: false,
                approvalStatus: 'rejected',
                rejectionReason: reason || 'Not specified',
                approvedBy: req.user.id,
                approvedAt: new Date()
            },
            { new: true }
        ).select('-password');

        if (!doctor) return res.status(404).json({ message: "Doctor not found" }); // This check is now redundant after doctorToReject check, but harmless.
        if (doctor.role !== 'doctor') return res.status(400).json({ message: "User is not a doctor" }); // This check is also redundant if doctorToReject is a doctor.

        console.log('Doctor rejected:', doctor.email);

        // Notify via Socket.io
        if (req.io) {
            req.io.emit('doctor_rejected', doctor);
        }

        res.json({ message: "Doctor registration rejected", doctor });
    } catch (err) {
        console.error('Error rejecting doctor:', err);
        res.status(500).json({ message: err.message });
    }
});



// DISCHARGE PATIENT
router.put('/discharge-patient/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });

        const currentAdmin = await User.findById(req.user.id);
        const hospital = await Hospital.findById(currentAdmin.hospitalId);

        if (!hospital) return res.status(400).json({ message: "Admin not linked to a hospital" });

        const patient = await User.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        // Verify patient is actually at this hospital (or was)
        if (patient.hospitalId && patient.hospitalId.toString() !== hospital._id.toString()) {
            return res.status(403).json({ message: "This patient is admitted to a different hospital." });
        }

        // DISCHARGE
        patient.hospitalId = undefined; // unset
        patient.department = undefined; // unset
        await patient.save();

        console.log(`Patient ${patient.name} discharged from ${hospital.name} by ${currentAdmin.email}`);

        // Notify via Socket
        if (req.io) {
            req.io.emit('patient_discharged', { patientId: patient._id, hospitalId: hospital._id });
        }

        res.json({ message: "Patient discharged successfully", patient });
    } catch (err) {
        console.error('Error discharging patient:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;