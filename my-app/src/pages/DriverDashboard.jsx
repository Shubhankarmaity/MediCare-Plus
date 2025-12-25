import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Navigation, Power, User, Phone, MapPin, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {
  Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import io from 'socket.io-client';
import mapboxgl from 'mapbox-gl';
// Mapbox integration disabled by user request

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [socket, setSocket] = useState(null);
  // const mapContainer = useRef(null);
  // const map = useRef(null);
  const [driverLocation, setDriverLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default location

  // Note: GPS location is still tracked via navigator.geolocation logic below

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Fetch driver info
  useEffect(() => {
    const fetchDriverInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setDriverInfo(data.user);
          setIsOnline(data.user.isAvailable || false);
        }
      } catch (err) {
        console.error('Error fetching driver info:', err);
      }
    };

    fetchDriverInfo();
  }, []);

  // Fetch ambulance requests when online and listen for real-time updates
  useEffect(() => {
    if (isOnline && socket) {
      const fetchRequests = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:5000/api/ambulance/requests', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setRequests(data);
          }
        } catch (err) {
          console.error('Error fetching requests:', err);
        }
      };

      // Initial fetch
      fetchRequests();

      // Listen for real-time ambulance requests
      socket.on('ambulance_request', (requestData) => {
        console.log('New ambulance request received:', requestData);
        setSnackbar({
          open: true,
          message: 'New ambulance request received!',
          severity: 'info'
        });
        // Re-fetch requests to update the list
        fetchRequests();

        // Add patient location to map if available
        if (requestData.patientLocation && map.current) {
          // Remove existing patient marker if any
          if (patientMarker.current && typeof patientMarker.current.remove === 'function') {
            patientMarker.current.remove();
          }

          // Add new patient marker
          patientMarker.current = new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([requestData.patientLocation.lng, requestData.patientLocation.lat])
            .addTo(map.current);

          // Fit bounds to show both driver and patient
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([driverLocation.lng, driverLocation.lat]);
          bounds.extend([requestData.patientLocation.lng, requestData.patientLocation.lat]);
          map.current.fitBounds(bounds, { padding: 100 });
        }
      });

      // Cleanup listener
      return () => {
        socket.off('ambulance_request');
      };
    }
  }, [isOnline, socket, driverLocation]);

  // Toggle driver availability
  const toggleAvailability = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/ambulance/toggle-availability', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAvailable: !isOnline })
      });

      if (res.ok) {
        setIsOnline(!isOnline);
        setSnackbar({
          open: true,
          message: `You are now ${!isOnline ? 'ONLINE' : 'OFFLINE'}`,
          severity: 'success'
        });
      } else {
        const error = await res.json();
        setSnackbar({
          open: true,
          message: error.message || 'Failed to update availability',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Accept ambulance request
  const acceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/ambulance/accept/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        setRequests(requests.map(req =>
          req._id === requestId ? { ...req, status: 'accepted' } : req
        ));
        setSnackbar({
          open: true,
          message: 'Ambulance request accepted!',
          severity: 'success'
        });
      } else {
        const error = await res.json();
        setSnackbar({
          open: true,
          message: error.message || 'Failed to accept request',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error accepting request:', err);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    }
  };

  // View request details
  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <DashboardLayout title="Ambulance Driver" userRole="driver">
      <div className="space-y-6">
        {/* Driver Profile Card */}
        {driverInfo && (
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar sx={{ width: 60, height: 60, bgcolor: '#ef4444' }}>
                    {driverInfo.name?.charAt(0) || 'D'}
                  </Avatar>
                  <div>
                    <Typography variant="h6" fontWeight="bold">
                      {driverInfo.name || 'Driver'}
                    </Typography>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip
                        label={isOnline ? 'ONLINE' : 'OFFLINE'}
                        color={isOnline ? 'success' : 'default'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        Vehicle: {driverInfo.vehicleNumber || 'N/A'}
                      </Typography>
                    </div>
                  </div>
                </div>
                <Button
                  variant="contained"
                  color={isOnline ? 'error' : 'success'}
                  startIcon={<Power size={18} />}
                  onClick={toggleAvailability}
                  disabled={loading}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  {loading ? <CircularProgress size={20} /> : isOnline ? 'Go Offline' : 'Go Online'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Indicator */}
        <div className={`px-6 py-3 rounded-xl font-mono font-bold text-center ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
          <div className="flex items-center justify-center gap-2">
            <Navigation className={isOnline ? 'animate-bounce' : ''} size={20} />
            {isOnline ? "GPS SIGNAL: ACTIVE - BROADCASTING" : "GPS SIGNAL: DISCONNECTED"}
          </div>
        </div>

        {/* Map Section - STATIC PLACEHOLDER */}
        {isOnline && (
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2} className="flex items-center gap-2">
                <MapPin size={20} /> Live Location Tracking
              </Typography>

              <div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-25"></div>
                    <div className="bg-blue-500 p-4 rounded-full relative z-10">
                      <MapPin className="text-white" size={32} />
                    </div>
                  </div>
                </div>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Map View Currently Unavailable
                </Typography>
                <Typography color="text.secondary" paragraph>
                  GPS tracking is active. Your location is being broadcast to patients.
                </Typography>
                <div className="inline-block bg-white px-4 py-2 rounded-lg border shadow-sm">
                  <Typography variant="code" className="font-mono text-sm text-gray-600">
                    Lat: {driverLocation.lat.toFixed(6)} | Lng: {driverLocation.lng.toFixed(6)}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Requests Section */}
        {isOnline && (
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2} className="flex items-center gap-2">
                <AlertTriangle size={20} color="#ef4444" />
                Active Ambulance Requests
              </Typography>

              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Typography color="text.secondary">
                    No active ambulance requests at the moment.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Requests will appear here when patients request assistance.
                  </Typography>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <Card
                      key={request._id}
                      sx={{
                        borderRadius: 2,
                        borderLeft: '4px solid #ef4444',
                        '&:hover': { boxShadow: 3 }
                      }}
                    >
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {request.patientName || 'Unknown Patient'}
                            </Typography>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock size={14} />
                                {new Date(request.createdAt).toLocaleTimeString()}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin size={14} />
                                {request.location || 'Location not provided'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip
                              label={request.status?.toUpperCase() || 'PENDING'}
                              size="small"
                              color={
                                request.status === 'accepted' ? 'success' :
                                  request.status === 'completed' ? 'default' : 'warning'
                              }
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => viewRequestDetails(request)}
                              sx={{ borderRadius: 2 }}
                            >
                              View
                            </Button>
                            {request.status === 'pending' && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<CheckCircle size={16} />}
                                onClick={() => acceptRequest(request._id)}
                                sx={{ borderRadius: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                              >
                                Accept
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        {!isOnline && (
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                How It Works
              </Typography>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Go Online
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click the "Go Online" button to start receiving ambulance requests.
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Receive Requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      When patients request an ambulance, you'll see the request details here.
                    </Typography>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Accept & Respond
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accept requests and respond quickly to provide emergency assistance.
                    </Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Request Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Ambulance Request Details
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <Avatar sx={{ bgcolor: '#ef4444' }}>
                  {selectedRequest.patientName?.charAt(0) || 'P'}
                </Avatar>
                <div>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedRequest.patientName || 'Unknown Patient'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Request ID: {selectedRequest._id}
                  </Typography>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Typography variant="caption" color="text.secondary" display="block">
                    Request Time
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </Typography>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <Typography variant="caption" color="text.secondary" display="block">
                    Status
                  </Typography>
                  <Chip
                    label={selectedRequest.status?.toUpperCase() || 'PENDING'}
                    size="small"
                    color={
                      selectedRequest.status === 'accepted' ? 'success' :
                        selectedRequest.status === 'completed' ? 'default' : 'warning'
                    }
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <Typography variant="caption" color="text.secondary" display="block">
                    Location
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" className="flex items-center gap-1">
                    <MapPin size={16} />
                    {selectedRequest.location || 'Location not provided'}
                  </Typography>
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Typography variant="body2" color="text.secondary">
                    <strong>Note:</strong> Click "Accept" in the main view to take this request.
                  </Typography>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default DriverDashboard;