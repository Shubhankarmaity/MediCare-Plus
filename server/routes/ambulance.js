const router = require('express').Router();
const User = require('../models/User');
const AmbulanceRequest = require('../models/AmbulanceRequest');
const auth = require('../middleware/auth');

// 1. Get All Available Drivers
router.get('/drivers', auth, async (req, res) => {
  try {
    console.log('Fetching all ambulance drivers...');
    const drivers = await User.find({ role: 'driver' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${drivers.length} drivers`);
    res.json(drivers);
  } catch (err) {
    console.error('Error fetching drivers:', err);
    res.status(500).json({ message: err.message });
  }
});

// 2. Book a Driver
router.post('/book', auth, async (req, res) => {
  try {
    console.log('Booking ambulance - Patient:', req.user.id, 'Driver:', req.body.driverId);
    
    // Validate driver exists and is available
    const driver = await User.findOne({ 
      _id: req.body.driverId, 
      role: 'driver',
      isAvailable: true
    });
    
    if (!driver) {
      return res.status(404).json({ 
        message: "Driver not found or not available" 
      });
    }
    
    // Get patient information
    const patient = await User.findById(req.user.id).select('name location');
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    // Use patient's location if available, otherwise use default
    const patientLocation = patient.location || { lat: 40.7128, lng: -74.0060 };
    
    const newRequest = new AmbulanceRequest({
      patientId: req.user.id,
      driverId: req.body.driverId,
      patientName: patient.name,
      location: `${patientLocation.lat}, ${patientLocation.lng}`
    });
    await newRequest.save();
    
    // Notify driver via Socket.io if available
    if (req.io) {
      req.io.emit('ambulance_request', {
        requestId: newRequest._id,
        patientId: req.user.id,
        patientName: patient.name,
        driverId: req.body.driverId,
        patientLocation: patientLocation,
        timestamp: new Date()
      });
    }
    
    console.log('Ambulance request created:', newRequest._id);
    res.json({ 
      message: "Ambulance Dispatched!",
      request: newRequest,
      patientLocation: patientLocation
    });
  } catch (err) {
    console.error('Error booking ambulance:', err);
    res.status(500).json({ message: err.message });
  }
});

// 3. Toggle Driver Availability
router.put('/toggle-availability', auth, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    // Update driver's availability status
    const updatedDriver = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable: isAvailable },
      { new: true }
    ).select('-password');
    
    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    
    console.log(`Driver ${req.user.id} availability updated to: ${isAvailable}`);
    res.json({ 
      message: `You are now ${isAvailable ? 'ONLINE' : 'OFFLINE'}`,
      driver: updatedDriver
    });
  } catch (err) {
    console.error('Error updating driver availability:', err);
    res.status(500).json({ message: err.message });
  }
});

// 4. Get Pending Ambulance Requests for Driver
router.get('/requests', auth, async (req, res) => {
  try {
    // Get all pending requests assigned to this driver
    const requests = await AmbulanceRequest.find({ 
      driverId: req.user.id,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${requests.length} pending requests for driver ${req.user.id}`);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching ambulance requests:', err);
    res.status(500).json({ message: err.message });
  }
});

// 5. Accept Ambulance Request
router.put('/accept/:id', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Find and update the request
    const request = await AmbulanceRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    // Verify the request is assigned to this driver
    if (request.driverId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to accept this request" });
    }
    
    // Update request status
    request.status = 'accepted';
    await request.save();
    
    console.log(`Ambulance request ${requestId} accepted by driver ${req.user.id}`);
    res.json({ 
      message: "Request accepted successfully",
      request
    });
  } catch (err) {
    console.error('Error accepting ambulance request:', err);
    res.status(500).json({ message: err.message });
  }
});

// 6. Get Driver's Active Requests (Pending and Accepted)
router.get('/active-requests', auth, async (req, res) => {
  try {
    // Get all pending and accepted requests assigned to this driver
    const requests = await AmbulanceRequest.find({ 
      driverId: req.user.id,
      status: { $in: ['pending', 'accepted'] }
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${requests.length} active requests for driver ${req.user.id}`);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching active ambulance requests:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;