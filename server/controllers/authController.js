const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Notification = require('../models/Notification');
const { sendOtpEmail } = require('../utils/emailService'); // Import email service

// Helper to generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

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

        // Determine if verification is needed
        const needsVerification = ['patient', 'doctor', 'driver'].includes(req.body.role);

        let otp = undefined;
        let otpExpires = undefined;
        let isVerified = true; // Default to true (for admins/super-admins)

        if (needsVerification) {
            otp = generateOTP();
            otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            isVerified = false;
        }

        const userData = {
            ...finalUserData,
            email: req.body.email.toLowerCase(),
            password: hashedPassword,
            otp,
            otpExpires,
            isVerified
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

        // Send OTP Email if needed
        if (needsVerification && otp) {
            await sendOtpEmail(user.email, otp);
        }

        // Different message based on role
        if (user.role === 'doctor') {
            res.json({
                message: "Registration Successful! Please check your email for OTP to verify your account.",
                requiresApproval: true,
                approvalStatus: 'pending',
                requiresVerification: true,
                email: user.email
            });
        } else if (needsVerification) {
            res.json({
                message: "Registration Successful! Please check your email for OTP.",
                requiresVerification: true,
                email: user.email
            });
        } else {
            res.json({
                message: "Registration Successful! You can now login.",
                requiresVerification: false, // Explicitly false for admins
                email: user.email
            });
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

        // CHECK VERIFICATION STATUS
        if (user.isVerified === false) {
            // Generate and send new OTP
            const otp = generateOTP();
            user.otp = otp;
            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await user.save();

            await sendOtpEmail(user.email, otp);

            return res.status(403).json({
                message: "Email not verified. A new OTP has been sent to your email.",
                requiresVerification: true,
                email: user.email
            });
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

// --- NEW AUTH METHODS ---

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified. Please login." });
        }

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "Invalid request. Please Request OTP again." });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // OTP Valid
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: "Email verified successfully! You can now login." });
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified." });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOtpEmail(user.email, otp);

        res.json({ message: "OTP resent successfully." });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Security: Don't reveal if user exists or not, but for this app we might want to for UX?
            // Standard: "If an account exists, an OTP has been sent."
            // But for dev/MVP:
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOtpEmail(user.email, otp);

        res.json({ message: "OTP sent to your email." });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        // Also verify them if they weren't
        user.isVerified = true;
        await user.save();

        res.json({ message: "Password reset successfully. You can now login." });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
