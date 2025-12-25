const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// REQUEST ACCESS TO PATIENT PROFILE
router.post('/request-access/:targetUserId', auth, async (req, res) => {
  try {
    // Only admins and doctors can request access to patient profiles
    if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(403).json({ message: "Only admins and doctors can request access to patient profiles" });
    }

    // Verify the target user exists and is a patient
    const targetUser = await User.findById(req.params.targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    if (targetUser.role !== 'patient') {
      return res.status(400).json({ message: "Can only request access to patient profiles" });
    }

    // Check if request already exists
    // Mongoose Map: use .get()
    const accessRequests = targetUser.accessRequests || new Map();
    const existingRequest = accessRequests.get(req.user.id);

    if (existingRequest && existingRequest.status === 'pending') {
      return res.status(400).json({ message: "Access request already pending" });
    }

    // Add new access request
    accessRequests.set(req.user.id, {
      requestedAt: new Date(),
      requestedById: req.user.id,
      status: 'pending'
    });

    targetUser.accessRequests = accessRequests;
    await targetUser.save();

    res.json({
      message: `Access request sent to ${targetUser.name}`,
      requestId: req.user.id,
      targetUser: {
        id: targetUser._id,
        name: targetUser.name
      }
    });
  } catch (err) {
    console.error('Error requesting profile access:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET ACCESS REQUESTS FOR CURRENT USER (PATIENT)
router.get('/my-requests', auth, async (req, res) => {
  try {
    // Only patients can view their access requests
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: "Only patients can view access requests" });
    }

    // Get patient's access requests
    const patient = await User.findById(req.user.id).select('accessRequests');
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get details for each user who requested access
    const accessRequests = patient.accessRequests || new Map();
    const requestList = [];

    // Iterate over Map entries
    // accessRequests is a Map: [key, value]
    if (accessRequests && accessRequests.size > 0) {
      for (const [userId, requestInfo] of accessRequests) {
        if (requestInfo.status === 'pending') {
          const user = await User.findById(userId).select('name role email');
          if (user) {
            requestList.push({
              id: user._id,
              name: user.name,
              role: user.role,
              email: user.email,
              requestedAt: requestInfo.requestedAt,
              requestId: userId,
              status: requestInfo.status
            });
          }
        }
      }
    }

    res.json({ requests: requestList });
  } catch (err) {
    console.error('Error fetching access requests:', err);
    res.status(500).json({ message: err.message });
  }
});

// RESPOND TO ACCESS REQUEST
router.put('/respond/:requesterUserId', auth, async (req, res) => {
  try {
    // Only patients can respond to access requests
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: "Only patients can respond to access requests" });
    }

    const { action } = req.body; // 'approve' or 'reject'

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
    }

    // Get patient
    const patient = await User.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if request exists
    const accessRequests = patient.accessRequests || new Map();
    const requestInfo = accessRequests.get(req.params.requesterUserId);

    if (!requestInfo) {
      return res.status(404).json({ message: "Access request not found" });
    }

    if (requestInfo.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${requestInfo.status}` });
    }

    // Update request status
    // Warning: Mongoose Maps of subdocuments might return a subdocument which can be mutated, or a plain object.
    // Safe way: update object and .set() it back

    // Create new object based on existing
    const requestObj = requestInfo.toObject ? requestInfo.toObject() : requestInfo;
    const updatedRequest = {
      ...requestObj, // spread existing properties
      status: action === 'approve' ? 'approved' : 'rejected',
      respondedAt: new Date(),
      respondedById: req.user.id
    };

    // For approved requests, set expiration (e.g., 5 minutes) and mark as single-use
    if (action === 'approve') {
      updatedRequest.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      updatedRequest.singleUse = true;
      updatedRequest.used = false;
    }

    accessRequests.set(req.params.requesterUserId, updatedRequest);
    patient.accessRequests = accessRequests;

    // If approved, also grant profile access with same constraints
    if (action === 'approve') {
      const privacySettings = patient.privacySettings || {};
      const profileAccess = privacySettings.profileAccess || new Map();

      profileAccess.set(req.params.requesterUserId, {
        approved: true,
        approvedAt: new Date(),
        approvedById: req.user.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        singleUse: true,
        used: false
      });

      // Ensure privacySettings structure is maintained if it wasn't a Mongoose object
      patient.privacySettings = patient.privacySettings || {};
      patient.privacySettings.profileAccess = profileAccess;
    }

    await patient.save();

    res.json({
      message: `Access request ${action}d successfully`,
      action: action,
      requesterId: req.params.requesterUserId
    });
  } catch (err) {
    console.error('Error responding to access request:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET REQUEST STATUS
router.get('/request-status/:targetUserId', auth, async (req, res) => {
  try {
    // Only admins and doctors can check request status
    if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(403).json({ message: "Only admins and doctors can check request status" });
    }

    // Verify the target user exists and is a patient
    const targetUser = await User.findById(req.params.targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    if (targetUser.role !== 'patient') {
      return res.status(400).json({ message: "Can only check request status for patient profiles" });
    }

    // Check request status
    const accessRequests = targetUser.accessRequests || new Map();
    const requestInfo = accessRequests.get(req.user.id.toString());

    if (!requestInfo) {
      return res.json({ status: 'not_requested' });
    }

    // For approved requests, also check if the permission is still valid
    if (requestInfo.status === 'approved') {
      // Also check the profile access permission
      const privacySettings = targetUser.privacySettings || {};
      const profileAccess = privacySettings.profileAccess || new Map();
      const doctorAccess = profileAccess.get(req.user.id.toString());

      // Check for valid, non-expired, non-used access
      const hasValidAccess = (doctorAccess && doctorAccess.approved &&
        (!doctorAccess.expiresAt || new Date(doctorAccess.expiresAt) > new Date()) &&
        (!doctorAccess.singleUse || !doctorAccess.used));

      // If permission is no longer valid, return as if not requested
      if (!hasValidAccess) {
        return res.json({ status: 'not_requested' });
      }
    }

    res.json({ status: requestInfo.status });
  } catch (err) {
    console.error('Error checking request status:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;