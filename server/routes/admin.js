const router = require('express').Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

// GET ALL SYSTEM STATS & DATA
router.get('/dashboard-data', auth, async (req, res) => {
    try {
        // 1. Check if user is Admin
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });

        // 2. Fetch Counts
        const doctorCount = await User.countDocuments({ role: 'doctor' });
        const patientCount = await User.countDocuments({ role: 'patient' });
        const driverCount = await User.countDocuments({ role: 'driver' });

        // 3. Fetch ALL Actual Data Lists (Removed limit as requested)
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        const appointments = await Appointment.find().sort({ createdAt: -1 });

        res.json({
            stats: { doctorCount, patientCount, driverCount },
            users,
            appointments
        });
    } catch (err) {
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
        
        console.log('Fetching pending doctors...');
        const pendingDoctors = await User.find({ 
            role: 'doctor',
            approvalStatus: 'pending'
        }).select('-password').sort({ createdAt: -1 });
        
        console.log(`Found ${pendingDoctors.length} pending doctors`);
        res.json(pendingDoctors);
    } catch (err) {
        console.error('Error fetching pending doctors:', err);
        res.status(500).json({ message: err.message });
    }
});

// APPROVE DOCTOR
router.put('/approve-doctor/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access Denied" });
        
        console.log('Approving doctor:', req.params.id, 'by admin:', req.user.id);
        
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
        
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        if (doctor.role !== 'doctor') return res.status(400).json({ message: "User is not a doctor" });
        
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
        
        const { reason } = req.body;
        console.log('Rejecting doctor:', req.params.id, 'Reason:', reason);
        
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
        
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });
        if (doctor.role !== 'doctor') return res.status(400).json({ message: "User is not a doctor" });
        
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

module.exports = router;