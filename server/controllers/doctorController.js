const User = require('../models/User');
const Hospital = require('../models/Hospital');

exports.getAllDoctors = async (req, res) => {
    try {
        console.log('Fetching approved doctors...');

        // Base query: only approved doctors
        let doctorQuery = {
            role: 'doctor',
            isApproved: true,
            approvalStatus: 'approved'
        };

        // --- HOSPITAL SCOPING FOR PATIENTS ---
        // If the requester is a patient AND is linked to a hospital,
        // only return doctors from that hospital.
        if (req.user.role === 'patient') {
            const patient = await User.findById(req.user.id).select('hospitalId');
            if (patient && patient.hospitalId) {
                const hospital = await Hospital.findById(patient.hospitalId).select('name');
                if (hospital) {
                    // Match by hospitalId (new standard) OR by hospitalName (legacy support)
                    doctorQuery.$or = [
                        { hospitalId: patient.hospitalId },
                        { hospitalName: hospital.name }
                    ];
                    console.log(`Patient scoped to hospital: ${hospital.name}`);
                }
            } else {
                console.log('Patient has no linked hospital — returning all doctors.');
            }
        }

        const doctors = await User.find(doctorQuery)
            .select('-password')
            .sort({ createdAt: -1 });

        console.log(`Found ${doctors.length} approved doctors`);
        if (doctors.length > 0) {
            console.log('First doctor:', { name: doctors[0].name, specialization: doctors[0].specialization });
        }

        res.json(doctors);
    } catch (err) {
        console.error('Error fetching doctors:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        // Check if user is Doctor
        if (req.user.role !== 'doctor') return res.status(403).json({ message: "Access Denied" });

        const patient = await User.findById(req.params.id).select('-password');
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        // Only allow access to patients
        if (patient.role !== 'patient') {
            return res.status(400).json({ message: "Can only access patient profiles" });
        }

        // Check if the doctor has been granted access by the patient
        const privacySettings = patient.privacySettings || {};
        const profileAccess = privacySettings.profileAccess || new Map();

        // Check if this doctor has explicit access
        // Handle both Map (Mongoose default) and Object (if lean() was used somewhere else, though not here)
        let doctorAccess;
        if (profileAccess instanceof Map) {
            doctorAccess = profileAccess.get(req.user.id);
        } else {
            doctorAccess = profileAccess[req.user.id];
        }

        // Check for valid, non-expired, non-used access
        const hasValidAccess = (doctorAccess && doctorAccess.approved &&
            (!doctorAccess.expiresAt || doctorAccess.expiresAt > new Date()) &&
            (!doctorAccess.singleUse || !doctorAccess.used));

        if (!hasValidAccess) {
            return res.status(403).json({
                message: "Access to this patient's profile requires their explicit approval.",
                requiresApproval: true
            });
        }

        // If we have single-use access, mark it as used
        if (doctorAccess && doctorAccess.singleUse) {
            // Create a copy to update
            const updatedAccess = { ...doctorAccess, used: true };

            if (profileAccess instanceof Map) {
                profileAccess.set(req.user.id, updatedAccess);
            } else {
                profileAccess[req.user.id] = updatedAccess;
            }

            // Mongoose requires marking mixed/map types as modified if not using direct setters on the document
            patient.markModified('privacySettings.profileAccess');
            await patient.save();
        }

        // Filter patient information to only include necessary medical details for doctors
        const filteredPatient = {
            _id: patient._id,
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            age: patient.age,
            gender: patient.gender,
            bloodGroup: patient.bloodGroup,
            medicalHistory: patient.medicalHistory,
            createdAt: patient.createdAt
        };

        res.json({ patient: filteredPatient });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        // Check if user is Doctor
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: "Access Denied" });
        }

        const {
            name, phone, specialization, experience, qualification,
            consultationFee, availableDays, availableTime, doctorPhone,
            address, hospitalName
        } = req.body;

        const updatedDoctor = await User.findByIdAndUpdate(
            req.user.id,
            {
                name,
                phone,
                specialization,
                experience,
                qualification,
                consultationFee,
                availableDays,
                availableTime,
                doctorPhone,
                address,
                hospitalName
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.json({ message: "Profile updated successfully", doctor: updatedDoctor });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getPublicDoctors = async (req, res) => {
    try {
        const doctors = await User.find({
            role: 'doctor',
            isApproved: true,
            approvalStatus: 'approved'
        })
            .select('name role specialization hospitalName experience qualification')
            .limit(8)
            .sort({ createdAt: -1 });

        res.json(doctors);
    } catch (err) {
        console.error('Error fetching public doctors:', err);
        res.status(500).json({ message: err.message });
    }
};
