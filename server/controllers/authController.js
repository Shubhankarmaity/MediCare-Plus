const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Notification = require('../models/Notification');

exports.register = async (req, res) => {
    try {
        console.log('Registration attempt for:', req.body.email, 'as', req.body.role);

        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
        if (existingUser) {
            console.log('User already exists:', req.body.email);
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // --- ONE ADMIN PER HOSPITAL CHECK ---
        if (req.body.role === 'admin') {
            if (!req.body.hospitalId) {
                return res.status(400).json({ message: "Admin must be linked to a hospital. Please provide hospitalId." });
            }

            const hospital = await Hospital.findById(req.body.hospitalId);
            if (!hospital) {
                return res.status(404).json({ message: "Hospital not found" });
            }

            // Check if hospital already has an admin
            if (hospital.adminId) {
                return res.status(400).json({ message: "This hospital already has an assigned admin." });
            }
        }

        // --- DOCTOR LINK TO HOSPITAL ---
        // If doctor, verify hospitalId and fetch name for legacy support
        let finalUserData = { ...req.body };

        if (req.body.role === 'doctor' && req.body.hospitalId) {
            const hospital = await Hospital.findById(req.body.hospitalId);
            if (hospital) {
                finalUserData.hospitalName = hospital.name; // Store name for backward compatibility
            }
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const userData = {
            ...finalUserData,
            email: req.body.email.toLowerCase(),
            password: hashedPassword
        };

        // Remove empty string fields to avoid enum validation errors
        Object.keys(userData).forEach(key => {
            if (userData[key] === '' || userData[key] === null) {
                delete userData[key];
            }
        });

        const user = await User.create(userData);
        console.log('User created successfully:', { id: user._id, email: user.email, role: user.role, approvalStatus: user.approvalStatus });

        // Link Hospital to Admin if role is admin
        if (user.role === 'admin' && user.hospitalId) {
            await Hospital.findByIdAndUpdate(user.hospitalId, { adminId: user._id });
            console.log(`Hospital ${user.hospitalId} linked to Admin ${user._id}`);
            console.log(`Hospital ${user.hospitalId} linked to Admin ${user._id}`);
        }

        // --- NOTIFY HOSPITAL ADMIN ON PATIENT REGISTRATION ---
        if (user.role === 'patient' && user.hospitalId) {
            try {
                const hospital = await Hospital.findById(user.hospitalId);
                if (hospital && hospital.adminId) {
                    // Create Notification record
                    const notification = await Notification.create({
                        userId: hospital.adminId,
                        type: 'REGISTRATION',
                        message: `New Patient Registered: ${user.name}`
                    });

                    // Real-time socket event to Admin
                    if (req.io) {
                        req.io.to(hospital.adminId.toString()).emit('new_notification', notification);
                    }
                    console.log(`Notification sent to admin ${hospital.adminId} for patient ${user.name}`);
                }
            } catch (notifyErr) {
                console.error('Error sending registration notification:', notifyErr);
                // Don't fail registration just because notification failed
            }
        }

        // Notify Admin Dashboard about new user
        if (req.io) {
            const userForBroadcast = user.toObject();
            delete userForBroadcast.password;
            req.io.emit('new_user', userForBroadcast);
        }

        // Different message based on role
        if (user.role === 'doctor') {
            res.json({
                message: "Registration Successful! Your account is pending admin approval. You will be notified once approved.",
                requiresApproval: true,
                approvalStatus: 'pending'
            });
        } else {
            res.json({ message: "User Created Successfully" });
        }
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: err.message || "Registration failed" });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('Login attempt payload:', req.body);
        console.log('Login attempt email:', req.body.email);

        // Find user and explicitly select password since it's excluded by default now
        const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
        if (!user) {
            console.log('User not found:', req.body.email);
            return res.status(404).json({ message: "User not found" });
        }

        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) {
            console.log('Invalid password for:', req.body.email);
            return res.status(400).json({ message: "Invalid Password" });
        }

        // CHECK APPROVAL STATUS FOR DOCTORS
        if (user.role === 'doctor' && !user.isApproved) {
            console.log('Doctor login blocked - not approved:', req.body.email, 'Status:', user.approvalStatus);

            if (user.approvalStatus === 'rejected') {
                return res.status(403).json({
                    message: `Your account has been rejected. Reason: ${user.rejectionReason || 'Not specified'}`,
                    approvalStatus: 'rejected'
                });
            }

            return res.status(403).json({
                message: "Your account is pending admin approval. Please wait for approval before logging in.",
                approvalStatus: 'pending'
            });
        }

        // Create token with user ID and role
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "supersecretkey123", { expiresIn: '7d' });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        console.log('Login successful:', { id: user._id, email: user.email, role: user.role });

        res.json({ token, result: userResponse });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, specialization, hospitalName, experience, vehicleNumber, licenseNumber } = req.body;

        const updateData = { name };

        // Add role-specific fields
        if (req.user.role === 'doctor') {
            if (specialization) updateData.specialization = specialization;
            if (hospitalName) updateData.hospitalName = hospitalName;
            if (experience) updateData.experience = experience;
        } else if (req.user.role === 'driver') {
            if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
            if (licenseNumber) updateData.licenseNumber = licenseNumber;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password').populate('hospitalId', 'name city adminId');

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        console.log('GET /profile - User ID from token:', req.user.id);
        console.log('GET /profile - User role from token:', req.user.role);

        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('hospitalId', 'name city adminId');

        if (!user) {
            console.log('User not found with ID:', req.user.id);
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (err) {
        console.error('Error in GET /profile:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.grantProfileAccess = async (req, res) => {
    try {
        // Only patients can grant access to their profiles
        if (req.user.role !== 'patient') {
            return res.status(403).json({ message: "Only patients can grant access to their profiles" });
        }

        // Verify the patient owns this profile
        const patient = await User.findById(req.user.id);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Verify the target user exists
        const targetUser = await User.findById(req.params.targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }

        // Update patient's privacy settings to grant access
        const privacySettings = patient.privacySettings || {};
        const profileAccess = privacySettings.profileAccess || {};

        profileAccess[req.params.targetUserId] = {
            approved: true,
            approvedAt: new Date(),
            approvedById: req.user.id
        };

        privacySettings.profileAccess = profileAccess;

        await User.findByIdAndUpdate(req.user.id, { privacySettings });

        res.json({
            message: `Access granted to ${targetUser.name} (${targetUser.role})`,
            grantedTo: {
                id: targetUser._id,
                name: targetUser.name,
                role: targetUser.role
            }
        });
    } catch (err) {
        console.error('Error granting profile access:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.revokeProfileAccess = async (req, res) => {
    try {
        // Only patients can revoke access to their profiles
        if (req.user.role !== 'patient') {
            return res.status(403).json({ message: "Only patients can revoke access to their profiles" });
        }

        // Verify the patient owns this profile
        const patient = await User.findById(req.user.id);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Update patient's privacy settings to revoke access
        const privacySettings = patient.privacySettings || {};
        const profileAccess = privacySettings.profileAccess || {};

        delete profileAccess[req.params.targetUserId];

        privacySettings.profileAccess = profileAccess;

        await User.findByIdAndUpdate(req.user.id, { privacySettings });

        res.json({ message: "Access revoked successfully" });
    } catch (err) {
        console.error('Error revoking profile access:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getProfileAccessList = async (req, res) => {
    try {
        // Only patients can view their access list
        if (req.user.role !== 'patient') {
            return res.status(403).json({ message: "Only patients can view their access list" });
        }

        // Get patient's privacy settings
        const patient = await User.findById(req.user.id).select('privacySettings');
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Get list of users who have access
        const profileAccess = patient.privacySettings?.profileAccess || {};
        const accessList = [];

        // Get details for each user who has access
        for (const [userId, accessInfo] of Object.entries(profileAccess)) {
            if (accessInfo.approved) {
                const user = await User.findById(userId).select('name role email');
                if (user) {
                    accessList.push({
                        id: user._id,
                        name: user.name,
                        role: user.role,
                        email: user.email,
                        approvedAt: accessInfo.approvedAt
                    });
                }
            }
        }

        res.json({ accessList });
    } catch (err) {
        console.error('Error fetching access list:', err);
        res.status(500).json({ message: err.message });
    }
};
