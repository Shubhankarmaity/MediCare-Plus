const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt for:', req.body.email, 'as', req.body.role);

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists:', req.body.email);
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userData = {
      ...req.body,
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
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt payload:', req.body);
    console.log('Login attempt email:', req.body.email);
    console.log('Email length:', req.body.email.length);
    console.log('Email char codes:', [...req.body.email].map(c => c.charCodeAt(0)));

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
    const token = jwt.sign({ id: user._id, role: user.role }, "supersecretkey123", { expiresIn: '7d' });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('Login successful:', { id: user._id, email: user.email, role: user.role });

    res.json({ token, result: userResponse });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PROFILE
router.put('/profile', auth, async (req, res) => {
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
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET CURRENT USER PROFILE
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('GET /profile - User ID from token:', req.user.id);
    console.log('GET /profile - User role from token:', req.user.role);

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('Returning user profile:', { name: user.name, email: user.email, role: user.role });
    res.json({ user });
  } catch (err) {
    console.error('Error in GET /profile:', err);
    res.status(500).json({ message: err.message });
  }
});

// GRANT PROFILE ACCESS TO USER
router.post('/profile/grant-access/:targetUserId', auth, async (req, res) => {
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
});

// REVOKE PROFILE ACCESS FROM USER
router.delete('/profile/revoke-access/:targetUserId', auth, async (req, res) => {
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
});

// GET PROFILE ACCESS LIST
router.get('/profile/access-list', auth, async (req, res) => {
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
});

module.exports = router;