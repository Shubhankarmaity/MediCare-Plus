import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  Grid, Card, CardContent, Typography, Button, CardActions, Chip, Avatar,
  Snackbar, Alert, Tabs, Tab, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  Paper
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { MapPin, Stethoscope, Clock, Ambulance, Calendar, Phone, IndianRupee, CheckCircle, FileText, Activity, Pill, TestTube, User, Download, XCircle, AlertTriangle, MessageCircle, MessageSquare, Video, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ChatWindow from '../components/ChatWindow';
import VideoCall from '../components/VideoCall';
import AIDecisionSupport from '../components/AIDecisionSupport';
import HealthSummaryPanel from '../components/HealthSummaryPanel';
import HealthSidePanel from '../components/HealthSidePanel';
import HealthVitals from '../components/HealthVitals';
import PrescriptionManager from '../components/PrescriptionManager';
import PatientSettings from '../components/PatientSettings';
import PatientPaymentHistory from '../components/PatientPaymentHistory';
import { API_URL } from '../config';
import { Settings, CreditCard, Brain, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

const PatientDashboard = () => {
  // ... existing state

  // Custom Appointment Booking State
  const [bookingStep, setBookingStep] = useState(1);
  const [intakeForm, setIntakeForm] = useState({
    patientName: '',
    email: '',
    phone: '',
    date: '',
    timeSlot: '',
    symptoms: '',
    isEmergency: false
  });
  const [intakeErrors, setIntakeErrors] = useState({});

  // Video Call State
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callerName, setCallerName] = useState("");

  const user = JSON.parse(localStorage.getItem('user'));
  // Socket connection is global in this file (or passed down), assume logic from ChatWindow or direct import
  // Wait, I see no `socket` imported in original file, but `ChatWindow` uses one.
  // I need to import io and use the one from `api` or create new instance.
  // The file doesn't seem to have `socket` defined at top level. 
  // I will add the import `import io from 'socket.io-client';` and `const socket = io(API_URL);` 
  // BUT `ChatWindow` also has one. It's better to have a single socket context, but for now I'll use a new instance to ensure it works.

  // Actually, I should check if `socket` is already there. 
  // Looking at file content: No socket import. 
  // Use useEffect to manage socket listener.



  // Wait, if I create a NEW socket connection here, it might conflict or just be redundant.
  // But since I need to listen for `callUser` continuously, this is fine.
  // Note: initializing socket inside useEffect without ref might cause reconnects on render if not careful, but dependency [] handles it.

  // However, I need to pass THIS socket to `VideoCall` component. So I should store it in ref or state.
  // Initialize socket using useState lazy initializer to persist it and allow render access
  const [socket] = useState(() => io(API_URL));

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join_room", user._id);

    // Define listener
    const handleCallUser = (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
      // Play Ringtone
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.loop = true;
      audio.play().then(() => {
        window.ringtone = audio; // Save to stop later
      }).catch(e => {
        console.warn("Ringtone blocked by browser autoplay policy. User interaction required.", e);
      });
    };

    socket.on("callUser", handleCallUser);

    return () => {
      if (window.ringtone) {
        window.ringtone.pause();
        window.ringtone = null;
      }
      socket.off("callUser", handleCallUser);
      socket.disconnect();
    }
  }, [user?._id, socket]);

  // ... video call logic ends here ...

  // Call management functions
  const answerCall = () => {
    setCallAccepted(true);
    if (window.ringtone) {
      window.ringtone.pause();
      window.ringtone = null;
    }
  };

  const leaveCall = () => {
    setCallAccepted(false);
    setReceivingCall(false);
    setCaller("");
    if (window.ringtone) {
      window.ringtone.pause();
      window.ringtone = null;
    }
  };

  // --- Original State Declarations ---
  const [tabValue, setTabValue] = useState(0);

  const menuItems = [
    { label: "Overview", icon: <Activity size={20} />, index: 0 },
    { label: "Find Doctors", icon: <Stethoscope size={20} />, index: 1 },
    { label: "My Appointments", icon: <Calendar size={20} />, index: 2 },
    { label: "Health Vitals", icon: <Activity size={20} />, index: 3 },
    { label: "Health Summary", icon: <HeartPulse size={20} />, index: 12 },
    { label: "Prescriptions", icon: <Pill size={20} />, index: 4 },
    { label: "My Reports", icon: <FileText size={20} />, index: 6 },
    { label: "AI Health Check", icon: <Brain size={20} />, index: 11 },
    { label: "Book Ambulance", icon: <Ambulance size={20} />, index: 5 },
    { label: "Access Requests", icon: <User size={20} />, index: 7 },
    { label: "Messages", icon: <MessageCircle size={20} />, index: 8 },
    { label: "Payments", icon: <CreditCard size={20} />, index: 9 },
    { label: "Settings", icon: <Settings size={20} />, index: 10 },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const [doctors, setDoctors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]); // Track patient's appointments
  const [notify, setNotify] = useState({ open: false, msg: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, doctor: null });
  const [ambulanceDialog, setAmbulanceDialog] = useState({ open: false, driver: null });
  const [booking, setBooking] = useState(false);
  const [accessRequests, setAccessRequests] = useState([]); // New state for access requests
  const [conversations, setConversations] = useState([]); // New state for conversations
  const [activeChat, setActiveChat] = useState(false);
  const [chatPartner, setChatPartner] = useState(null); // Explicit state for who we are chatting with
  const [hospitalAdmin, setHospitalAdmin] = useState(null);
  const [patientHospital, setPatientHospital] = useState(null);
  const [patientLocation, setPatientLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default location
  // const mapContainer = useRef(null);
  // const map = useRef(null);
  // const marker = useRef(null);

  // Mapbox access token removed

  // Get patient's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPatientLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
          setPatientLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
  }, []);

  // Map initialization removed

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Doctors
        const docRes = await fetch(`${API_URL}/api/doctors`, { headers });
        const docData = await docRes.json();
        setDoctors(docData);

        // Fetch Drivers
        const driverRes = await fetch(`${API_URL}/api/ambulance/drivers`, { headers });
        const driverData = await driverRes.json();
        setDrivers(driverData);

        // Fetch Patient's Appointments with populated doctor info
        const aptRes = await fetch(`${API_URL}/api/appointments/my-appointments`, { headers });
        const aptData = await aptRes.json();
        setPatientAppointments(aptData);

        // Fetch access requests
        const accessRes = await fetch(`${API_URL}/api/access-requests/my-requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const accessResult = await accessRes.json();
        if (accessRes.ok) {
          setAccessRequests(accessResult.requests);
        }

        // Fetch user profile to get hospital admin info
        const profileRes = await fetch(`${API_URL}/profile`, { headers });
        const profileData = await profileRes.json();
        if (profileData.user && profileData.user.hospitalId) {
          const hosp = profileData.user.hospitalId;
          setPatientHospital(hosp);
          if (hosp.adminId) {
            setHospitalAdmin({
              _id: hosp.adminId,
              name: `${hosp.name} Admin`
            });
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setNotify({ open: true, msg: 'Error loading data. Please refresh the page.', type: 'error' });
      }
    };
    fetchData();
  }, []);

  // Real-time: refresh doctor list when a new doctor is approved
  useEffect(() => {
    const socket2 = io(API_URL);
    socket2.on('doctor_approved', () => {
      const token = localStorage.getItem('token');
      fetch(`${API_URL}/api/doctors`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setDoctors(data))
        .catch(err => console.error('Error refreshing doctors:', err));
    });
    return () => { socket2.off('doctor_approved'); socket2.disconnect(); };
  }, []);

  // Real-time: listen for appointment status changes (admin assigned, doctor completed)
  useEffect(() => {
    if (!user?._id) return;
    const refreshAppointments = () => {
      const token = localStorage.getItem('token');
      fetch(`${API_URL}/api/appointments/my-appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setPatientAppointments(data); })
        .catch(err => console.error('Error refreshing appointments:', err));
    };

    const handleNotification = (data) => {
      if (data.type === 'appointment_completed') {
        setNotify({ open: true, msg: '✅ Your checkup is complete! Doctor\'s report is ready.', type: 'success' });
        refreshAppointments();
      } else if (data.type === 'appointment_assigned') {
        setNotify({ open: true, msg: data.message || 'Your appointment has been confirmed!', type: 'success' });
        refreshAppointments();
      } else if (data.type === 'appointment_rejected') {
        setNotify({ open: true, msg: data.message || 'Your appointment request was declined.', type: 'error' });
        refreshAppointments();
      }
    };

    socket.on(`notification_${user._id}`, handleNotification);
    return () => { socket.off(`notification_${user._id}`, handleNotification); };
  }, [user?._id, socket]);

  // Refetch appointments when My Reports tab is selected
  useEffect(() => {
    if (tabValue === 6) { // My Reports tab
      const fetchAppointments = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = { 'Authorization': `Bearer ${token}` };

          const aptRes = await fetch(`${API_URL}/api/appointments/my-appointments`, { headers });
          const aptData = await aptRes.json();
          setPatientAppointments(aptData);
        } catch (error) {
          console.error('Error fetching appointments for reports:', error);
        }
      };

      fetchAppointments();
    } else if (tabValue === 8) { // Messages Tab
      const fetchConversations = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/api/messages/conversations/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setConversations(data);
          }
        } catch (error) {
          console.error('Error fetching conversations:', error);
        }
      };
      fetchConversations();
    }
  }, [tabValue]);

  // 1. Doctor Booking Logic
  const handleBookingClick = (doctor) => {
    setBookingStep(1);
    setIntakeForm(prev => ({
      ...prev,
      patientName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      date: '',
      timeSlot: '',
      symptoms: '',
      isEmergency: false
    }));
    setIntakeErrors({});
    setConfirmDialog({ open: true, doctor });
  };

  const handleIntakeChange = (field, value) => {
    setIntakeForm(prev => ({ ...prev, [field]: value }));
    if (intakeErrors[field]) {
      setIntakeErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = () => {
    const errors = {};
    if (bookingStep === 1) {
      if (!intakeForm.patientName) errors.patientName = 'Full Name is required';
      if (!intakeForm.phone) errors.phone = 'Phone number is required';
    } else if (bookingStep === 2) {
      if (!intakeForm.symptoms) errors.symptoms = 'Please describe your symptoms';
    } else if (bookingStep === 3) {
      if (!intakeForm.date) errors.date = 'Please select a date';
      if (!intakeForm.timeSlot) errors.timeSlot = 'Please select a preferred time slot';
    }

    setIntakeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const confirmBooking = async () => {
    if (!validateStep()) return;

    const doctor = confirmDialog.doctor;
    setBooking(true);

    const token = localStorage.getItem('token');

    const res = await fetch(`${API_URL}/api/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        doctorId: doctor._id,
        date: new Date(intakeForm.date).toISOString(),
        symptoms: intakeForm.symptoms,
        isEmergency: intakeForm.isEmergency,
        phone: intakeForm.phone,
        timeSlot: intakeForm.timeSlot
      })
    });

    setBooking(false);
    setConfirmDialog({ open: false, doctor: null });

    if (res.ok) {
      // Refresh appointments to update the UI
      const aptRes = await fetch(`${API_URL}/api/appointments/my-appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const aptData = await aptRes.json();
      setPatientAppointments(aptData);

      setNotify({ open: true, msg: `✅ Appointment request sent for ${doctor.name}! The hospital admin will review and assign a time slot.`, type: 'success' });
    } else {
      // Try to get error message from response
      let errorMsg = 'Booking Failed. Please try again.';
      try {
        const errorData = await res.json();
        if (errorData.message) {
          errorMsg = ` Booking Failed: ${errorData.message}`;
        }
      } catch (error) {
        // If we can't parse the error, use the default message
        console.error('Error parsing error response:', error);
      }
      setNotify({ open: true, msg: errorMsg, type: 'error' });
    }
  };

  // 2. Ambulance Booking Logic
  const handleAmbulanceClick = (driver) => {
    setAmbulanceDialog({ open: true, driver });
  };

  const confirmAmbulance = async () => {
    const driver = ambulanceDialog.driver;
    setBooking(true);

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    const res = await fetch(`${API_URL}/api/ambulance/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        driverId: driver._id,
        patientName: user.name,
        location: patientLocation // Include patient location
      })
    });

    setBooking(false);
    setAmbulanceDialog({ open: false, driver: null });

    if (res.ok) {
      setNotify({ open: true, msg: `🚑 Ambulance ${driver.name} dispatched to your location!`, type: 'warning' });
    } else {
      setNotify({ open: true, msg: '❌ Request Failed. Please try again.', type: 'error' });
    }
  };

  // 3. Report Download Logic
  const downloadReport = (appointment) => {
    const reportElement = document.getElementById(`report-${appointment._id}`);
    if (reportElement) {
      html2canvas(reportElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Medical_Report_${appointment._id}.pdf`);
      });
    }
  };

  // 4. Access Request Response Logic
  const respondToAccessRequest = async (requestId, action) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/access-requests/respond/${requestId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action })
    });

    if (res.ok) {
      setNotify({ open: true, msg: `Access request ${action === 'approve' ? 'approved' : 'rejected'}.`, type: 'success' });
      // Refetch access requests to update the UI
      const accessRes = await fetch(`${API_URL}/api/access-requests/my-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const accessResult = await accessRes.json();
      if (accessRes.ok) {
        setAccessRequests(accessResult.requests);
      }
    } else {
      const errorResult = await res.json();
      setNotify({ open: true, msg: `Failed to ${action} access request: ${errorResult.message}`, type: 'error' });
    }
  };

  // 5. Cancel Appointment Logic
  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/status/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await res.json();

      if (res.ok) {
        setNotify({ open: true, msg: 'Appointment cancelled successfully.', type: 'success' });
        // Refresh list
        const aptRes = await fetch(`${API_URL}/api/appointments/my-appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const aptData = await aptRes.json();
        setPatientAppointments(aptData);
      } else {
        setNotify({ open: true, msg: data.message || 'Failed to cancel appointment.', type: 'error' });
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setNotify({ open: true, msg: 'Error cancelling appointment.', type: 'error' });
    }
  };

  return (
    <DashboardLayout title="Medical Services" userRole="patient">
      {/* Incoming Call Modal */}
      <Dialog open={receivingCall && !callAccepted} onClose={() => { }}>
        <DialogContent className="text-center p-6">
          <div className="animate-bounce bg-blue-100 p-4 rounded-full inline-block mb-4">
            <Video size={40} className="text-blue-600" />
          </div>
          <Typography variant="h5" fontWeight="bold">Incoming Call</Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            {callerName || "Unknown Doctor"} is calling you...
          </Typography>
          <div className="flex justify-center gap-4">
            <Button
              variant="contained"
              color="success"
              onClick={answerCall}
              startIcon={<Phone className="rotate-0" />}
              className="bg-green-500 hover:bg-green-600"
            >
              Answer
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={leaveCall}
              startIcon={<Phone className="rotate-[135deg]" />}
            >
              Decline
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Call Component */}
      {callAccepted && (
        <VideoCall
          socket={socket}
          user={user}
          partnerId={caller}
          isInitiator={false}
          incomingSignal={callerSignal}
          onEnd={leaveCall}
        />
      )}
      {/* TABS */}

      {/* MOBILE NAVIGATION (Tabs) */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': { minHeight: 60, textTransform: 'none', fontWeight: 600 },
            '& .Mui-selected': { color: '#2563eb' },
            '& .MuiTabs-indicator': { bgcolor: '#2563eb' }
          }}
        >
          {menuItems.map((item) => (
            <Tab key={item.index} label={item.label} icon={item.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={4} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, alignItems: 'stretch' }}>
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <Grid sx={{ width: { md: '260px' }, flexShrink: 0, display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
          <Paper elevation={0} sx={{
            p: 2.5, borderRadius: 4, 
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03), 0 1px 4px rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            position: 'sticky', top: 16,
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
            height: '100%',
            minHeight: '82vh',
          }}>
            {/* User Mini Profile */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, mb: 1,
              borderRadius: 3, bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02), inset 0 0 0 1px rgba(226, 232, 240, 0.5)'
            }}>
              <Avatar sx={{
                width: 36, height: 36, fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #2563eb, #6366f1)',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'block', lineHeight: 1.2, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name?.split(' ')[0]}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>Patient Portal</Typography>
              </Box>
            </Box>

            <Typography variant="overline" color="text.disabled" fontWeight="700" sx={{ px: 2, mt: 1, mb: 0.5, display: 'block', fontSize: '0.65rem', letterSpacing: 1.5 }}>MENU</Typography>

            {/* Nav Items */}
            <div className="space-y-1" style={{ flex: 1 }}>
              {menuItems.map((item) => (
                <motion.button
                  key={item.index}
                  onClick={() => setTabValue(item.index)}
                  whileHover={{ x: 3, backgroundColor: tabValue === item.index ? 'transparent' : '#f8fafc' }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 text-sm font-semibold ${
                    tabValue === item.index
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={`${tabValue === item.index ? 'opacity-100' : 'opacity-70'} transition-opacity`}>
                    {item.icon}
                  </span>
                  <span className="truncate tracking-tight">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Bottom: Quick Info Card */}
            <Box sx={{ mt: 'auto', pt: 2.5 }}>
              <Divider sx={{ mb: 2 }} />
              {patientHospital && (
                <Box sx={{
                  p: 2, borderRadius: 2,
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
                  border: '1px solid #ddd6fe', mb: 2
                }}>
                  <Typography variant="caption" sx={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.62rem', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Your Hospital
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', color: '#1e293b', lineHeight: 1.3 }}>
                    {patientHospital.name}
                  </Typography>
                  {patientHospital.city && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <MapPin size={11} color="#94a3b8" />
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>{patientHospital.city}</Typography>
                    </Box>
                  )}
                </Box>
              )}
              <Box sx={{
                p: 2, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0',
                display: 'flex', alignItems: 'flex-start', gap: 1.5
              }}>
                <Activity size={14} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" fontWeight="bold" sx={{ color: '#15803d', fontSize: '0.68rem', display: 'block' }}>Health Tip</Typography>
                  <Typography variant="caption" sx={{ color: '#166534', fontSize: '0.65rem', lineHeight: 1.4 }}>
                    Log your vitals daily for better AI recommendations
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* MAIN CONTENT AREA */}
        <Grid sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tabValue}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >

              {/* TAB 0: DASHBOARD OVERVIEW */}
              {tabValue === 0 && (
                <Grid container spacing={4}>
                  {/* Welcome Banner */}
                  <Grid size={{ xs: 12 }}>
                    <div className="rounded-3xl p-8 text-white relative overflow-hidden shadow-lg transition-transform hover:-translate-y-1" 
                         style={{ 
                           background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                           boxShadow: '0 10px 40px -10px rgba(37,99,235,0.5)'
                         }}>
                      <div className="relative z-10 flex items-start justify-between flex-wrap gap-5">
                        <div className="space-y-3">
                          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                            Welcome back, {user?.name?.split(' ')[0]}! 👋
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 500, fontWeight: 500, lineHeight: 1.6 }}>
                            Your personal health hub. Track your vitals, manage appointments, and stay connected with your care team.
                          </Typography>
                          {patientHospital && (
                            <div className="mt-2 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-2xl px-4 py-2 transition-colors cursor-default">
                              <MapPin size={16} className="text-blue-200" />
                              <span className="text-white text-sm font-bold tracking-wide">{patientHospital.name}</span>
                              {patientHospital.city && (<span className="text-blue-100 text-sm font-medium opacity-80 pl-1 border-l border-white/20 ml-1 block">• {patientHospital.city}</span>)}
                            </div>
                          )}
                        </div>
                        {/* Quick Action Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                          <button onClick={() => setTabValue(1)} className="flex items-center justify-center gap-2.5 bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 active:scale-95 shadow-lg shadow-black/10 rounded-2xl px-5 py-3 text-sm font-bold transition-all">
                            <Stethoscope size={18} /> Find a Doctor
                          </button>
                          <button onClick={() => setTabValue(5)} className="flex items-center justify-center gap-2.5 bg-red-500 hover:bg-red-400 text-white hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20 rounded-2xl px-5 py-3 text-sm font-bold transition-all border border-red-400/30">
                            <Ambulance size={18} /> Book Ambulance
                          </button>
                        </div>
                      </div>
                      
                      {/* Decorative Glass Elements */}
                      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-[60px] pointer-events-none"></div>
                      <div className="absolute bottom-0 left-1/4 -mb-20 w-60 h-60 bg-indigo-500 opacity-20 rounded-full blur-[50px] pointer-events-none"></div>
                      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-cyan-300 opacity-20 rounded-full blur-[40px] pointer-events-none"></div>
                    </div>
                  </Grid>

                  {/* Quick Stats — 4 cards in a row */}
                  {[
                    {
                      label: 'APPOINTMENTS', value: patientAppointments.filter(apt => ['scheduled', 'rescheduled', 'approved', 'requested'].includes(apt.status)).length,
                      subtext: 'Upcoming', icon: Calendar, tab: 2,
                      colors: { from: '#eff6ff', to: '#ffffff', text: '#2563eb', iconBg: '#dbeafe', hoverShadow: 'rgba(37,99,235,0.15)' }
                    },
                    {
                      label: 'PRESCRIPTIONS', value: patientAppointments.filter(apt => apt.doctorReport?.prescription).length,
                      subtext: 'Records', icon: Pill, tab: 4,
                      colors: { from: '#f0fdf4', to: '#ffffff', text: '#16a34a', iconBg: '#dcfce7', hoverShadow: 'rgba(22,163,74,0.15)' }
                    },
                    {
                      label: 'MESSAGES', value: conversations.length,
                      subtext: 'Active Chats', icon: MessageCircle, tab: 8,
                      colors: { from: '#faf5ff', to: '#ffffff', text: '#9333ea', iconBg: '#f3e8ff', hoverShadow: 'rgba(147,51,234,0.15)' }
                    },
                    {
                      label: 'MY REPORTS', value: patientAppointments.filter(apt => apt.doctorReport).length,
                      subtext: 'Available', icon: FileText, tab: 6,
                      colors: { from: '#fffbeb', to: '#ffffff', text: '#d97706', iconBg: '#fef3c7', hoverShadow: 'rgba(217,119,6,0.15)' }
                    }
                  ].map((stat, idx) => (
                    <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                      <Card elevation={0} sx={{ 
                        p: 3, borderRadius: 4, 
                        background: `linear-gradient(135deg, ${stat.colors.from} 0%, ${stat.colors.to} 100%)`,
                        border: '1px solid rgba(255,255,255,0.6)', 
                        height: '100%', cursor: 'pointer', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02), inset 0 2px 0 rgba(255,255,255,0.7)',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 24px -8px ${stat.colors.hoverShadow}, inset 0 2px 0 rgba(255,255,255,0.9)` 
                        }, 
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                      }} onClick={() => setTabValue(stat.tab)}>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div style={{ backgroundColor: stat.colors.iconBg, color: stat.colors.text }} className="p-2.5 rounded-2xl shadow-sm">
                              <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-1px' }}>
                              {stat.value}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="caption" fontWeight="800" sx={{ color: stat.colors.text, fontSize: '0.65rem', letterSpacing: 1.2, display: 'block', mb: 0.5 }}>
                              {stat.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>{stat.subtext}</Typography>
                          </div>
                        </div>
                      </Card>
                    </Grid>
                  ))}

                  {/* Recent Appointments Quick View */}
                  {patientAppointments.filter(apt => ['approved', 'requested'].includes(apt.status)).length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Card elevation={0} sx={{ 
                        borderRadius: 4, 
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.02)'
                      }}>
                        <CardContent sx={{ p: 4 }}>
                          <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a' }}>
                            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><Calendar size={18} strokeWidth={2.5} /></div>
                            Upcoming Appointments
                          </Typography>
                          <div className="space-y-3">
                            {patientAppointments.filter(apt => ['approved', 'requested'].includes(apt.status)).slice(0, 3).map(apt => (
                              <div key={apt._id} className="group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200" 
                                   style={{ 
                                     background: apt.status === 'approved' ? 'linear-gradient(to right, #ffffff, #f0fdf4)' : 'linear-gradient(to right, #ffffff, #fffbeb)', 
                                     border: apt.status === 'approved' ? '1px solid #dcfce7' : '1px solid #fef3c7',
                                     boxShadow: '0 2px 10px rgba(0,0,0,0.01)'
                                   }}>
                                <div className="flex items-center gap-4">
                                  <Avatar sx={{ 
                                    bgcolor: apt.status === 'approved' ? '#10b981' : '#f59e0b', 
                                    width: 42, height: 42, fontSize: '1rem', fontWeight: 'bold',
                                    boxShadow: apt.status === 'approved' ? '0 4px 10px rgba(16,185,129,0.2)' : '0 4px 10px rgba(245,158,11,0.2)'
                                  }}>
                                    {apt.doctorId?.name?.[0] || 'D'}
                                  </Avatar>
                                  <div>
                                    <Typography variant="body2" fontWeight="800" sx={{ color: '#1e293b' }}>Dr. {apt.doctorId?.name}</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>{apt.doctorId?.specialization}</Typography>
                                  </div>
                                </div>
                                <Chip
                                  size="small"
                                  label={apt.status === 'approved' ? (apt.assignedTimeSlot || 'Confirmed') : 'Awaiting Confirmation'}
                                  sx={{
                                    bgcolor: apt.status === 'approved' ? '#dcfce7' : '#fef3c7',
                                    color: apt.status === 'approved' ? '#15803d' : '#b45309',
                                    fontWeight: 700, fontSize: '0.7rem', px: 1, height: 26, borderRadius: 2
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <Button 
                            disableElevation
                            size="small" 
                            sx={{ mt: 3, borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#2563eb', bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' }, px: 3 }} 
                            onClick={() => setTabValue(2)}
                          >
                            View All Appointments →
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Quick Navigation Grid */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="overline" fontWeight="800" sx={{ mb: 2, display: 'block', color: '#64748b', fontSize: '0.7rem', letterSpacing: 1.5 }}>
                      QUICK ACCESS
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { label: 'Find Doctors', icon: <Stethoscope size={20} strokeWidth={2.5} />, color: '#2563eb', bg: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', border: '#bfdbfe', tab: 1 },
                        { label: 'Health Vitals', icon: <Activity size={20} strokeWidth={2.5} />, color: '#059669', bg: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', border: '#bbf7d0', tab: 3 },
                        { label: 'Prescriptions', icon: <Pill size={20} strokeWidth={2.5} />, color: '#7c3aed', bg: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)', border: '#ddd6fe', tab: 4 },
                        { label: 'Ambulance', icon: <Ambulance size={20} strokeWidth={2.5} />, color: '#dc2626', bg: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', border: '#fecaca', tab: 5 },
                        { label: 'My Reports', icon: <FileText size={20} strokeWidth={2.5} />, color: '#d97706', bg: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)', border: '#fde68a', tab: 6 },
                        { label: 'AI Health', icon: <Sparkles size={20} strokeWidth={2.5} />, color: '#0891b2', bg: 'linear-gradient(135deg, #ecfeff 0%, #ffffff 100%)', border: '#a5f3fc', tab: 11 },
                      ].map(item => (
                        <Grid size={{ xs: 6, sm: 4 }} key={item.tab}>
                          <button
                            onClick={() => setTabValue(item.tab)}
                            className="group flex items-center gap-3 w-full p-3.5 rounded-2xl transition-all duration-300"
                            style={{ 
                              background: item.bg, 
                              border: `1px solid ${item.border}`, 
                              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = `0 8px 16px -4px ${item.color}33`;
                              e.currentTarget.style.borderColor = item.color;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                              e.currentTarget.style.borderColor = item.border;
                            }}
                          >
                            <div className="p-2 rounded-xl transition-colors duration-300" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                              {item.icon}
                            </div>
                            <Typography variant="body2" fontWeight="700" sx={{ color: '#334155', groupHover: { color: item.color } }}>{item.label}</Typography>
                          </button>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* TAB 1: DOCTORS */}
              {tabValue === 1 && (
                <Grid container spacing={3.5}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Stethoscope size={20} className="text-blue-600" /> Available Doctors
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Book an appointment with our verified specialists.</Typography>
                  </Grid>
                  {doctors.length === 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #e2e8f0' }}>
                        <Stethoscope size={48} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                        <Typography fontWeight="semibold" color="text.secondary" mb={0.5}>No Doctors Available Yet</Typography>
                        <Typography variant="body2" color="text.disabled">There are no approved doctors at your registered hospital at this time.</Typography>
                      </Paper>
                    </Grid>
                  )}
                  {doctors.map(doc => (
                    <Grid size={{ xs: 12, sm: 6 }} key={doc._id}>
                      <Card elevation={0} sx={{ 
                        borderRadius: 4, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 30px -10px rgba(37, 99, 235, 0.15)',
                          borderColor: '#bfdbfe'
                        }
                      }}>
                        <CardContent sx={{ p: 3.5, flex: 1 }}>
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar sx={{ 
                              bgcolor: 'teal', width: 64, height: 64, 
                              fontSize: '1.5rem', fontWeight: 'bold',
                              background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
                              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
                            }}>
                              {doc.name[0]}
                            </Avatar>
                            <div>
                              <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', lineHeight: 1.2, mb: 0.5 }}>{doc.name}</Typography>
                              <Chip 
                                label={doc.specialization} 
                                size="small" 
                                sx={{ 
                                  bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 700, 
                                  border: '1px solid #bfdbfe', borderRadius: 2, px: 0.5
                                }} 
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2.5 mt-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3 text-slate-600">
                              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100"><MapPin size={16} className="text-slate-400" /></div>
                              <Typography variant="body2" fontWeight="600">{doc.hospitalName}</Typography>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100"><Clock size={16} className="text-slate-400" /></div>
                              <Typography variant="body2" fontWeight="600">{doc.experience} Years Exp.</Typography>
                            </div>
                            {doc.consultationFee && (
                              <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100"><IndianRupee size={16} className="text-slate-400" /></div>
                                <Typography variant="body2" fontWeight="600">{doc.consultationFee} Consultation Fee</Typography>
                              </div>
                            )}
                            {doc.availableTime && (
                              <div className="flex items-center gap-3 text-slate-600">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100"><Calendar size={16} className="text-slate-400" /></div>
                                <Typography variant="body2" fontWeight="600">{doc.availableDays} | {doc.availableTime}</Typography>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        
                        <CardActions sx={{ p: 3, pt: 0 }}>
                          {(() => {
                            const activeApt = patientAppointments.find(apt =>
                              apt.doctorId?._id === doc._id &&
                              ['requested', 'pending', 'approved'].includes(apt.status)
                            );
                            const isDisabled = !!activeApt;
                            let label = 'Book Appointment';
                            let btnDesign = { 
                              bgcolor: '#2563eb', color: 'white', 
                              boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 6px 20px rgba(37,99,235,0.23)' }
                            };
                            
                            if (activeApt?.status === 'requested' || activeApt?.status === 'pending') {
                              label = '⏳ Awaiting Admin Approval';
                              btnDesign = { 
                                bgcolor: '#fef3c7', color: '#b45309', 
                                border: '1px solid #fde68a', boxShadow: 'none',
                                '&.Mui-disabled': { bgcolor: '#fef3c7', color: '#b45309', opacity: 1 } 
                              };
                            } else if (activeApt?.status === 'approved') {
                              label = `✅ Confirmed — ${activeApt.assignedTimeSlot ? new Date(activeApt.date).toLocaleDateString() + ' at ' + activeApt.assignedTimeSlot : 'Scheduled'}`;
                              btnDesign = { 
                                bgcolor: '#dcfce7', color: '#166534', 
                                border: '1px solid #bbf7d0', boxShadow: 'none',
                                '&.Mui-disabled': { bgcolor: '#dcfce7', color: '#166534', opacity: 1 } 
                              };
                            }
                            return (
                              <Button
                                fullWidth
                                disableElevation
                                variant="contained"
                                onClick={() => handleBookingClick(doc)}
                                disabled={isDisabled}
                                sx={{
                                  borderRadius: 3,
                                  fontWeight: '800',
                                  py: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.9rem',
                                  ...btnDesign
                                }}
                              >
                                {label}
                              </Button>
                            );
                          })()}
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* TAB 2: MY APPOINTMENTS */}
              {tabValue === 2 && (
                <Grid container spacing={3.5}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a' }}>
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Calendar size={20} strokeWidth={2.5}/></div> My Appointments
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>Manage your upcoming and past appointments.</Typography>
                  </Grid>

                  {/* UPCOMING APPOINTMENTS */}
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                          <Calendar className="text-blue-500" size={18} strokeWidth={2.5}/> Upcoming
                        </Typography>

                        {patientAppointments.filter(apt => ['requested', 'pending', 'approved'].includes(apt.status)).length === 0 ? (
                          <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                            <Calendar size={40} className="text-slate-300" />
                            <Typography color="text.secondary" fontWeight="600">No upcoming appointments.</Typography>
                          </Box>
                        ) : (
                          <div className="space-y-4">
                            {patientAppointments
                              .filter(apt => ['requested', 'pending', 'approved'].includes(apt.status))
                              .map(apt => (
                                <Card key={apt._id} elevation={0} sx={{
                                  borderRadius: 4,
                                  border: apt.status === 'approved' ? '1px solid #dcfce7' : '1px solid #fef3c7',
                                  background: apt.status === 'approved' ? 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                                  boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                                  overflow: 'hidden'
                                }}>
                                  {/* Status Banner */}
                                  {apt.status === 'approved' && (
                                    <Box sx={{ bgcolor: '#10b981', color: 'white', px: 2.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CheckCircle size={16} strokeWidth={2.5}/>
                                      <Typography variant="caption" fontWeight="800" sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}>Appointment Confirmed by Admin</Typography>
                                    </Box>
                                  )}
                                  {(apt.status === 'requested' || apt.status === 'pending') && (
                                    <Box sx={{ bgcolor: '#f59e0b', color: 'white', px: 2.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Clock size={16} strokeWidth={2.5}/>
                                      <Typography variant="caption" fontWeight="800" sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}>Waiting for Admin Approval</Typography>
                                    </Box>
                                  )}

                                  <CardContent sx={{ p: 3 }}>
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-4">
                                        <Avatar sx={{ 
                                          bgcolor: apt.status === 'approved' ? '#10b981' : '#f59e0b', 
                                          width: 48, height: 48, fontSize: '1.2rem', fontWeight: 'bold',
                                          boxShadow: apt.status === 'approved' ? '0 4px 10px rgba(16,185,129,0.2)' : '0 4px 10px rgba(245,158,11,0.2)'
                                        }}>
                                          {apt.doctorId?.name?.[0] || 'D'}
                                        </Avatar>
                                        <div>
                                          <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', lineHeight: 1.2 }}>Dr. {apt.doctorId?.name}</Typography>
                                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{apt.doctorId?.specialization}</Typography>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Confirmed Date/Time — Big & Prominent */}
                                    {apt.status === 'approved' && apt.assignedTimeSlot ? (
                                      <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #bbf7d0', boxShadow: '0 2px 8px rgba(22, 163, 74, 0.05)' }}>
                                        <Typography variant="caption" color="#166534" fontWeight="800" sx={{ display: 'block', mb: 1.5, letterSpacing: 1 }}>YOUR APPOINTMENT</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#f0fdf4', px: 2, py: 1, borderRadius: 2 }}>
                                            <Calendar size={18} className="text-green-600" />
                                            <Typography variant="subtitle1" fontWeight="800" color="#166534">
                                              {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#f0fdf4', px: 2, py: 1, borderRadius: 2 }}>
                                            <Clock size={18} className="text-green-600" />
                                            <Typography variant="subtitle1" fontWeight="800" color="#166534">
                                              {apt.assignedTimeSlot}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Paper>
                                    ) : (
                                      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #fde68a', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.05)' }}>
                                        <Typography variant="body2" sx={{ color: '#92400e', mb: 0.5 }}>
                                          <b className="font-extrabold text-[#78350f]">Your Preference:</b> {apt.preferredDate ? new Date(apt.preferredDate).toLocaleDateString() : new Date(apt.date).toLocaleDateString()} — {apt.preferredTimeSlot || 'Any time'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 500 }}>Admin will confirm the final date & time.</Typography>
                                      </Paper>
                                    )}

                                    <div className="flex gap-3">
                                      {apt.status === 'approved' && (
                                        <Button
                                          disableElevation
                                          variant="contained"
                                          size="medium"
                                          color="primary"
                                          startIcon={<Video size={18} />}
                                          onClick={() => {
                                            setNotify({ open: true, msg: 'Please wait, the doctor will initiate the call at the scheduled time.', type: 'info' });
                                          }}
                                          sx={{ flex: 1, borderRadius: 2.5, fontWeight: 'bold', textTransform: 'none', bgcolor: '#2563eb' }}
                                        >
                                          Join Call
                                        </Button>
                                      )}

                                      <Button
                                        variant="outlined"
                                        size="medium"
                                        startIcon={<MessageCircle size={18} />}
                                        onClick={() => {
                                          setChatPartner(apt.doctorId);
                                          setActiveChat(true);
                                        }}
                                        sx={{ flex: 1, borderRadius: 2.5, fontWeight: 'bold', textTransform: 'none', borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
                                      >
                                        Chat
                                      </Button>

                                      {(apt.status === 'pending' || apt.status === 'requested') && (
                                        <Button
                                          disableElevation
                                          variant="contained"
                                          size="medium"
                                          color="error"
                                          startIcon={<XCircle size={18} />}
                                          onClick={() => cancelAppointment(apt._id)}
                                          sx={{ flex: 0.8, borderRadius: 2.5, fontWeight: 'bold', textTransform: 'none', bgcolor: '#ef4444' }}
                                        >
                                          Cancel
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* PAST APPOINTMENTS */}
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, height: '100%' }}>
                      <CardContent sx={{ p: 3.5 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle className="text-gray-500" size={20} /> History
                        </Typography>

                        {patientAppointments.filter(apt => ['completed', 'cancelled', 'rejected'].includes(apt.status)).length === 0 ? (
                          <Typography color="text.secondary" align="center" py={4}>No past appointments.</Typography>
                        ) : (
                          <div className="space-y-4">
                            {patientAppointments
                              .filter(apt => ['completed', 'cancelled', 'rejected'].includes(apt.status))
                              .map(apt => (
                                <Card key={apt._id} elevation={0} sx={{
                                  borderRadius: 4,
                                  border: apt.status === 'completed' ? '1px solid #bfdbfe' : '1px solid #fecaca',
                                  bgcolor: apt.status === 'completed' ? '#f8fafc' : '#fef2f2',
                                  transition: 'transform 0.2s',
                                  '&:hover': {
                                    transform: 'translateX(4px)',
                                    bgcolor: apt.status === 'completed' ? '#f0f9ff' : '#fff1f2'
                                  }
                                }}>
                                  <CardContent sx={{ p: 2.5, display: 'flex', gap: 3, alignItems: 'center' }}>
                                    <Avatar sx={{ 
                                      bgcolor: apt.status === 'completed' ? '#3b82f6' : '#ef4444', 
                                      width: 48, height: 48, fontWeight: 'bold' 
                                    }}>
                                      {apt.doctorId?.name?.[0] || 'D'}
                                    </Avatar>
                                    
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                        <div>
                                          <Typography variant="subtitle1" fontWeight="800" color="#0f172a">Dr. {apt.doctorId?.name}</Typography>
                                          <Typography variant="caption" color="#64748b" fontWeight="600">{apt.doctorId?.specialization}</Typography>
                                        </div>
                                        <Chip
                                          label={apt.status === 'completed' ? 'CHECKUP DONE' : apt.status.toUpperCase()}
                                          color={apt.status === 'completed' ? 'primary' : 'error'}
                                          size="small"
                                          icon={apt.status === 'completed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                          sx={{ fontSize: '0.65rem', height: 24, fontWeight: '800', px: 0.5, letterSpacing: 0.5 }}
                                        />
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1.5 font-medium">
                                        <Calendar size={14} className="text-slate-400" /> {new Date(apt.date).toLocaleDateString()}
                                        {apt.assignedTimeSlot && <span>at {apt.assignedTimeSlot}</span>}
                                      </div>
                                      
                                      {apt.status === 'completed' && apt.doctorReport && (
                                        <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <FileText size={12} /> Doctor's report available — check My Reports tab
                                        </Typography>
                                      )}
                                      {apt.status === 'rejected' && apt.rejectionReason && (
                                        <Typography variant="caption" color="error" fontWeight="600">
                                          Reason: {apt.rejectionReason}
                                        </Typography>
                                      )}
                                      {apt.status === 'completed' && (
                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: '#059669', fontWeight: 600 }}>
                                          <CheckCircle size={12} /> You can now book a new appointment with this doctor.
                                        </Typography>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

              )}

              {/* TAB 3: HEALTH VITALS */}
              {tabValue === 3 && (
                <HealthVitals />
              )}

              {/* TAB 4: PRESCRIPTIONS */}
              {tabValue === 4 && (
                <PrescriptionManager appointments={patientAppointments} />
              )}

              {/* TAB 5: AMBULANCE DRIVERS */}
              {tabValue === 5 && (
                <Grid container spacing={3.5}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a' }}>
                      <div className="p-2 bg-red-50 text-red-600 rounded-xl"><Ambulance size={20} className="text-red-500" strokeWidth={2.5} /></div> Book Ambulance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>Request emergency ambulance service to your location.</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3, color: '#1e293b' }}>
                          Available Ambulance Drivers
                        </Typography>
                        {drivers.length === 0 ? (
                          <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                            <Ambulance size={40} className="text-slate-300" />
                            <Typography color="text.secondary" fontWeight="600">No ambulance drivers online.</Typography>
                          </Box>
                        ) : (
                          <div className="space-y-4">
                            {drivers.map(driver => (
                              <Card key={driver._id} elevation={0} sx={{ 
                                borderRadius: 3, border: '1px solid #fecaca', background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
                                transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px -8px rgba(220, 38, 38, 0.2)' }
                              }}>
                                <CardContent sx={{ p: 2.5 }}>
                                  <div className="flex items-center gap-4 mb-3">
                                    <Avatar sx={{ 
                                      bgcolor: '#ef4444', width: 56, height: 56, 
                                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' 
                                    }}>
                                      <Ambulance />
                                    </Avatar>
                                    <div>
                                      <Typography variant="h6" fontWeight="800" color="#0f172a" sx={{ lineHeight: 1.2 }}>{driver.name}</Typography>
                                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Vehicle: {driver.vehicleNumber}</Typography>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between bg-white border border-red-100 p-2.5 rounded-xl">
                                    <span className="text-red-600 font-bold text-sm tracking-wide flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Live Location
                                    </span>
                                    <span className="text-sm font-semibold text-slate-500">2.4 km away</span>
                                  </div>
                                </CardContent>
                                <CardActions sx={{ p: 2.5, pt: 0 }}>
                                  <Button 
                                    fullWidth 
                                    disableElevation 
                                    variant="contained" 
                                    color="error" 
                                    onClick={() => handleAmbulanceClick(driver)}
                                    sx={{ borderRadius: 2.5, py: 1.5, fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'none' }}
                                  >
                                    Call Now (SOS)
                                  </Button>
                                </CardActions>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 5 }}>
                    <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                      <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                          <MapPin size={18} className="text-blue-500" strokeWidth={2.5}/> Your Location
                        </Typography>

                        <div className="flex-1 bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-8 border border-slate-100 relative overflow-hidden">
                          <div className="absolute inset-0 bg-blue-50/50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.5 }}></div>
                          
                          <div className="flex justify-center mb-6 relative z-10">
                            <div className="relative">
                              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30 w-16 h-16 -ml-2 -mt-2"></div>
                              <div className="bg-blue-600 p-3.5 rounded-full relative z-10 shadow-lg shadow-blue-600/30">
                                <MapPin className="text-white" size={24} />
                              </div>
                            </div>
                          </div>
                          
                          <Typography variant="subtitle2" fontWeight="800" color="#334155" gutterBottom className="relative z-10">
                            GPS Tracking Active
                          </Typography>
                          
                          <div className="inline-block bg-white px-4 py-2.5 rounded-xl border border-blue-100 shadow-sm mt-3 relative z-10">
                            <Typography variant="caption" className="font-mono text-blue-800 font-bold" sx={{ letterSpacing: 0.5 }}>
                              Lat: {patientLocation.lat.toFixed(6)} | Lng: {patientLocation.lng.toFixed(6)}
                            </Typography>
                          </div>
                        </div>

                        <Typography variant="caption" color="text.secondary" fontWeight="500" sx={{ mt: 3, lineHeight: 1.5, display: 'block' }}>
                          Your current location is shown above. When you request an ambulance,
                          this location will be sent to the driver for immediate response.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* TAB 6: MY REPORTS */}
              {tabValue === 6 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <FileText className="text-blue-600" /> My Medical Reports
                  </h3>

                  {patientAppointments && patientAppointments.length > 0 && (
                    patientAppointments.filter(apt => apt.doctorReport && Object.keys(apt.doctorReport).length > 0).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No medical reports available yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {patientAppointments
                          .filter(apt => {
                            // Check if appointment has a doctor report
                            if (!apt.doctorReport || Object.keys(apt.doctorReport).length === 0) {
                              return false;
                            }
                            return true;
                          })
                          .sort((a, b) => {
                            try {
                              const dateA = a.doctorReport?.reportDate ? new Date(a.doctorReport.reportDate) : new Date(0);
                              const dateB = b.doctorReport?.reportDate ? new Date(b.doctorReport.reportDate) : new Date(0);
                              return dateB - dateA;
                            } catch (error) {
                              console.error('Error sorting reports:', error);
                              return 0;
                            }
                          })
                          .map((appointment, index) => {
                            // Add safety checks for report data
                            try {
                              // Validate that we have a doctor report with meaningful content
                              if (!appointment.doctorReport || Object.keys(appointment.doctorReport).length === 0) {
                                return null;
                              }

                              // Check if the report has at least one meaningful field with content
                              const hasMeaningfulContent =
                                (appointment.doctorReport.diagnosis && appointment.doctorReport.diagnosis.trim() !== '') ||
                                (appointment.doctorReport.symptoms && appointment.doctorReport.symptoms.trim() !== '') ||
                                (appointment.doctorReport.prescription && appointment.doctorReport.prescription.trim() !== '') ||
                                (appointment.doctorReport.recommendations && appointment.doctorReport.recommendations.trim() !== '');

                              if (!hasMeaningfulContent) {
                                return null;
                              }

                              // Validate required fields
                              if (!appointment._id) {
                                return null;
                              }

                              // Additional validation for doctor and patient info
                              if (!appointment.doctorId || !appointment.patientId) {
                                return null;
                              }

                              return (
                                <Accordion key={appointment._id || `report-${index}`} elevation={0} sx={{ 
                                  borderRadius: 4, overflow: 'hidden', mb: 2,
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                                  '&:before': { display: 'none' } 
                                }}>
                                  <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    sx={{
                                      p: 2.5,
                                      bgcolor: '#f8fafc',
                                      '&:hover': { bgcolor: '#f1f5f9' },
                                      borderBottom: '1px solid #e2e8f0'
                                    }}
                                  >
                                    <div className="flex items-center gap-4 w-full">
                                      <Avatar sx={{ bgcolor: 'teal', width: 48, height: 48, fontWeight: 'bold' }}>
                                        {(appointment.doctorId?.name || 'D').charAt(0)}
                                      </Avatar>
                                      <div className="flex-1">
                                        <Typography variant="subtitle1" fontWeight="800" color="#0f172a">
                                          {appointment.doctorId?.name || 'Unknown Doctor'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                          {appointment.doctorId?.specialization || 'General Physician'}
                                          <span className="text-slate-300">•</span>
                                          {appointment.doctorReport.reportDate ?
                                            (() => {
                                              try {
                                                return new Date(appointment.doctorReport.reportDate).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric'
                                                });
                                              } catch {
                                                return 'Invalid Date';
                                              }
                                            })() :
                                            'Unknown Date'}
                                        </Typography>
                                      </div>
                                      {appointment.doctorReport.severity && (
                                        <Chip
                                          label={`Severity: ${appointment.doctorReport.severity || 'Medium'}`}
                                          size="small"
                                          sx={{ 
                                            mr: 1, fontWeight: 700, borderRadius: 2,
                                            bgcolor: appointment.doctorReport.severity === 'Critical' ? '#fee2e2' :
                                              appointment.doctorReport.severity === 'High' ? '#fef3c7' :
                                                appointment.doctorReport.severity === 'Low' ? '#e0f2fe' : '#f1f5f9',
                                            color: appointment.doctorReport.severity === 'Critical' ? '#dc2626' :
                                              appointment.doctorReport.severity === 'High' ? '#d97706' :
                                                appointment.doctorReport.severity === 'Low' ? '#0284c7' : '#475569',
                                            border: `1px solid ${appointment.doctorReport.severity === 'Critical' ? '#fca5a5' :
                                              appointment.doctorReport.severity === 'High' ? '#fcd34d' :
                                                appointment.doctorReport.severity === 'Low' ? '#7dd3fc' : '#cbd5e1'}`
                                          }}
                                        />
                                      )}
                                      <Chip
                                        label="New Report"
                                        size="small"
                                        sx={{
                                          fontWeight: 800, borderRadius: 2, bgcolor: '#dcfce7', color: '#166534', border: '1px solid #86efac',
                                          visibility: index === 0 && appointment.doctorReport.reportDate &&
                                            (new Date() - new Date(appointment.doctorReport.reportDate)) < 7 * 24 * 60 * 60 * 1000 ?
                                            'visible' : 'hidden'
                                        }}
                                      />
                                    </div>
                                  </AccordionSummary>
                                  <AccordionDetails sx={{ p: 4, bgcolor: '#ffffff' }}>
                                    <div id={`report-${appointment._id}`} className="space-y-6">
                                      {/* Report Actions */}
                                      <div className="flex justify-end mb-4">
                                        <Button
                                          disableElevation
                                          variant="contained"
                                          color="primary"
                                          onClick={() => downloadReport(appointment)}
                                          startIcon={<Download size={18} />}
                                          sx={{
                                            bgcolor: '#0f766e',
                                            borderRadius: 2.5,
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: '#115e59' }
                                          }}
                                        >
                                          Download PDF
                                        </Button>
                                      </div>

                                      {/* Report Header */}
                                      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-3xl shadow-xl shadow-blue-900/10">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                          <div className="flex items-center gap-5">
                                            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/10">
                                              <FileText className="text-blue-100" size={32} />
                                            </div>
                                            <div>
                                              <Typography variant="h5" fontWeight="800" className="flex items-center gap-2 text-white" sx={{ letterSpacing: 0.5 }}>
                                                Medical Report
                                              </Typography>
                                              <Typography variant="body2" className="mt-1 text-blue-200" fontWeight="500">
                                                Comprehensive Patient Health Assessment
                                              </Typography>
                                            </div>
                                          </div>
                                          <div className="bg-black/20 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-white/10">
                                            <Typography variant="body2" className="text-white font-bold" sx={{ letterSpacing: 0.5 }}>
                                              {appointment.doctorReport.reportDate ?
                                                new Date(appointment.doctorReport.reportDate).toLocaleDateString('en-IN', {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric'
                                                }) : 'Date Unknown'}
                                            </Typography>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Patient Info */}
                                      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                                        <CardContent sx={{ p: 3 }}>
                                          <Typography variant="h6" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a' }}>
                                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><User size={18} strokeWidth={2.5} /></div> Patient Information
                                          </Typography>
                                          <Grid container spacing={3}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Patient Name</Typography>
                                              <Typography variant="body1" fontWeight="700" color="#1e293b" mt={0.5}>{appointment.patientId?.name || 'Unknown'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Doctor</Typography>
                                              <Typography variant="body1" fontWeight="700" color="#1e293b" mt={0.5}>{appointment.doctorId?.name || 'Unknown'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Specialization</Typography>
                                              <Typography variant="body1" fontWeight="700" color="#1e293b" mt={0.5}>{appointment.doctorId?.specialization || 'General Physician'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hospital</Typography>
                                              <Typography variant="body1" fontWeight="700" color="#1e293b" mt={0.5}>{appointment.doctorId?.hospitalName || 'Not Specified'}</Typography>
                                            </Grid>
                                          </Grid>
                                        </CardContent>
                                      </Card>

                                      {/* Diagnosis */}
                                      {appointment.doctorReport.diagnosis && (
                                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0f2fe', borderLeft: '4px solid #3b82f6', bgcolor: '#f0f9ff' }}>
                                          <CardContent sx={{ p: 3 }}>
                                            <Typography variant="h6" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0369a1' }}>
                                              <Activity size={20} strokeWidth={2.5} /> Diagnosis
                                            </Typography>
                                            <Typography variant="body1" color="#0f172a" fontWeight="500" sx={{ lineHeight: 1.6 }}>{appointment.doctorReport.diagnosis}</Typography>
                                          </CardContent>
                                        </Card>
                                      )}

                                      {/* Symptoms */}
                                      {appointment.doctorReport.symptoms && (
                                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #fef3c7', borderLeft: '4px solid #f59e0b', bgcolor: '#fffbeb' }}>
                                          <CardContent sx={{ p: 3 }}>
                                            <Typography variant="h6" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, color: '#b45309' }}>
                                              <TestTube size={20} strokeWidth={2.5} /> Reported Symptoms
                                            </Typography>
                                            <Typography variant="body1" color="#0f172a" fontWeight="500" sx={{ lineHeight: 1.6 }}>{appointment.doctorReport.symptoms}</Typography>
                                          </CardContent>
                                        </Card>
                                      )}

                                      {/* Prescription */}
                                      {appointment.doctorReport.prescription && (
                                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #dcfce7', borderLeft: '4px solid #10b981', bgcolor: '#f0fdf4' }}>
                                          <CardContent sx={{ p: 3 }}>
                                            <Typography variant="h6" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, color: '#047857' }}>
                                              <Pill size={20} strokeWidth={2.5} /> Prescription
                                            </Typography>
                                            <Typography variant="body1" component="pre" color="#0f172a" fontWeight="500" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6, m: 0 }}>
                                              {appointment.doctorReport.prescription}
                                            </Typography>
                                          </CardContent>
                                        </Card>
                                      )}

                                      {/* Recommendations */}
                                      {appointment.doctorReport.recommendations && (
                                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #f3e8ff', borderLeft: '4px solid #8b5cf6', bgcolor: '#faf5ff' }}>
                                          <CardContent sx={{ p: 3 }}>
                                            <Typography variant="h6" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, color: '#6d28d9' }}>
                                              <CheckCircle size={20} strokeWidth={2.5} /> Recommendations
                                            </Typography>
                                            <Typography variant="body1" color="#0f172a" fontWeight="500" sx={{ lineHeight: 1.6 }}>{appointment.doctorReport.recommendations}</Typography>
                                          </CardContent>
                                        </Card>
                                      )}

                                      {/* Severity */}
                                      {appointment.doctorReport.severity && (
                                        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #f1f5f9' }}>
                                          <CardContent sx={{ p: 3 }}>
                                            <Typography variant="h6" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a' }}>
                                              <AlertTriangle size={20} strokeWidth={2.5} className={
                                                appointment.doctorReport.severity === 'Critical' ? 'text-red-500' :
                                                  appointment.doctorReport.severity === 'High' ? 'text-orange-500' :
                                                    appointment.doctorReport.severity === 'Medium' ? 'text-yellow-500' :
                                                      'text-green-500'
                                              } /> Condition Severity
                                            </Typography>
                                            <Chip
                                              label={appointment.doctorReport.severity}
                                              color={
                                                appointment.doctorReport.severity === 'Critical' ? 'error' :
                                                  appointment.doctorReport.severity === 'High' ? 'warning' :
                                                    appointment.doctorReport.severity === 'Medium' ? 'info' : 'success'
                                              }
                                              size="medium"
                                              sx={{ fontWeight: '800', borderRadius: 2 }}
                                            />
                                          </CardContent>
                                        </Card>
                                      )}
                                    </div>
                                  </AccordionDetails>
                                </Accordion>
                              );
                            } catch {
                              return null;
                            }
                          })
                          .filter(Boolean) // Remove null entries
                        }
                      </div>
                    )
                  )}
                </div>
              )}

              {/* TAB 7: ACCESS REQUESTS */}
              {tabValue === 7 && (
                <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-2xl border border-blue-200">
                        <User className="text-blue-600" size={28} strokeWidth={2.5} />
                      </div>
                      <div>
                        <Typography variant="h5" fontWeight="800" color="#0f172a">Access Requests</Typography>
                        <Typography color="#64748b" fontWeight="500">Manage who can view your medical profile</Typography>
                      </div>
                    </div>
                  </div>

                  {accessRequests.length === 0 ? (
                    <Card sx={{ p: 8, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 4 }} elevation={0}>
                      <div className="mx-auto bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                        <User className="text-slate-300" size={32} />
                      </div>
                      <Typography variant="h6" color="#475569" fontWeight="700">No Pending Requests</Typography>
                      <Typography color="#94a3b8" fontWeight="500" mt={1}>You have no pending access requests at this time.</Typography>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {accessRequests.map((request) => (
                        <Card key={request.requestId} elevation={0} sx={{ 
                          borderRadius: 4, 
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: '#bfdbfe', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.05)' }
                        }}>
                          <CardContent sx={{ p: '24px !important' }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <Avatar sx={{ width: 48, height: 48, bgcolor: '#f1f5f9', color: '#3b82f6', fontWeight: 'bold' }}>
                                  {request.name?.charAt(0) || 'U'}
                                </Avatar>
                                <div>
                                  <Typography variant="subtitle1" fontWeight="800" color="#0f172a">
                                    {request.name || 'Unknown User'}
                                  </Typography>
                                  <Typography variant="body2" color="#64748b" fontWeight="500">
                                    Requested access to your medical profile
                                  </Typography>
                                  <Typography variant="caption" color="#94a3b8" fontWeight="600" sx={{ display: 'block', mt: 0.5 }}>
                                    {new Date(request.requestedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                  </Typography>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {request.status === 'pending' ? (
                                  <>
                                    <Button
                                      variant="contained"
                                      sx={{ 
                                        borderRadius: 3, 
                                        color: '#fff', 
                                        bgcolor: '#10b981', 
                                        textTransform: 'none', 
                                        fontWeight: 'bold',
                                        boxShadow: 'none',
                                        '&:hover': { bgcolor: '#059669', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }
                                      }}
                                      size="small"
                                      onClick={() => respondToAccessRequest(request.requestId, 'approve')}
                                      startIcon={<CheckCircle size={16} />}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      onClick={() => respondToAccessRequest(request.requestId, 'reject')}
                                      startIcon={<XCircle size={16} />}
                                      sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                ) : (
                                  <Chip
                                    label={(request.status || 'pending').toUpperCase()}
                                    sx={{ 
                                      fontWeight: '800', 
                                      borderRadius: 2,
                                      bgcolor: request.status === 'approved' ? '#dcfce7' : '#fee2e2',
                                      color: request.status === 'approved' ? '#166534' : '#991b1b',
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: MESSAGES */}
              {tabValue === 8 && (
                <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-2xl border border-blue-200">
                        <MessageCircle className="text-blue-600" size={28} strokeWidth={2.5} />
                      </div>
                      <div>
                        <Typography variant="h5" fontWeight="800" color="#0f172a">My Messages</Typography>
                        <Typography color="#64748b" fontWeight="500">Chat with doctors and hospital staff</Typography>
                      </div>
                    </div>
                  </div>

                  {conversations.length === 0 ? (
                    <Card sx={{ p: 8, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 4 }} elevation={0}>
                      <div className="mx-auto bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                        <MessageSquare className="text-slate-300" size={32} />
                      </div>
                      <Typography variant="h6" color="#475569" fontWeight="700">No Conversations Yet</Typography>
                      <Typography color="#94a3b8" fontWeight="500" mt={1}>You have no active messages. Reach out to a doctor to start a chat.</Typography>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {conversations.map((convo, index) => (
                        <Card
                          key={index}
                          elevation={0}
                          sx={{ 
                            borderRadius: 4, 
                            border: convo.unreadCount > 0 ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                            bgcolor: convo.unreadCount > 0 ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer', 
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#f8fafc', borderColor: '#e2e8f0' } 
                          }}
                          onClick={() => {
                            setChatPartner(convo.user);
                            setActiveChat(true);
                          }}
                        >
                          <CardContent sx={{ p: '16px 20px !important' }}>
                            <div className="flex items-center gap-4">
                              <Avatar sx={{ width: 48, height: 48, bgcolor: 'white', color: '#3b82f6', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                                {convo.user.name?.charAt(0) || '?'}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                  <Typography variant="subtitle1" fontWeight="800" color="#0f172a" noWrap>
                                    {convo.user.name || 'Unknown User'}
                                  </Typography>
                                  <Typography variant="caption" color={convo.unreadCount > 0 ? "#3b82f6" : "#94a3b8"} fontWeight={convo.unreadCount > 0 ? "bold" : "600"}>
                                    {new Date(convo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                </div>
                                <div className="flex justify-between items-center">
                                  <Typography variant="body2" color={convo.unreadCount > 0 ? "#1e293b" : "#64748b"} fontWeight={convo.unreadCount > 0 ? "700" : "500"} noWrap sx={{ maxWidth: '85%' }}>
                                    {convo.lastMessage}
                                  </Typography>
                                  {convo.unreadCount > 0 && (
                                    <Box
                                      sx={{
                                        bgcolor: '#3b82f6',
                                        color: 'white',
                                        borderRadius: 'full',
                                        px: 1,
                                        py: 0.2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        minWidth: 20
                                      }}
                                    >
                                      {convo.unreadCount}
                                    </Box>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 9: PAYMENTS */}
              {tabValue === 9 && (
                <PatientPaymentHistory />
              )}

              {/* TAB 10: SETTINGS */}
              {tabValue === 10 && (
                <PatientSettings />
              )}

              {/* Confirm Doctor Booking Dialog */}
              {/* MULTI-STEP APPOINTMENT BOOKING MODAL */}
              <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, doctor: null })}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
              >
                <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #f1f5f9' }}>
                  <div className="flex justify-between items-center">
                    <Typography variant="h5" fontWeight="bold" className="text-slate-800">
                      Patient Intake Form
                    </Typography>
                    {confirmDialog.doctor && (
                      <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        <Stethoscope size={16} />
                        Dr. {confirmDialog.doctor.name.split(' ')[1] || confirmDialog.doctor.name}
                      </div>
                    )}
                  </div>
                  {/* Custom Stepper */}
                  <div className="flex items-center mt-6 mb-2">
                    {[1, 2, 3].map((step) => (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${bookingStep === step ? 'bg-blue-600 text-white shadow-md' :
                            bookingStep > step ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                            {bookingStep > step ? <CheckCircle size={16} /> : step}
                          </div>
                          <span className={`text-xs mt-1 font-semibold ${bookingStep >= step ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step === 1 ? 'Patient Info' : step === 2 ? 'Medical Details' : 'Scheduling'}
                          </span>
                        </div>
                        {step < 3 && (
                          <div className={`flex-grow h-1 mx-2 rounded-full transition-colors ${bookingStep > step ? 'bg-green-500' : 'bg-slate-200'
                            }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </DialogTitle>

                <DialogContent sx={{ mt: 3, minHeight: '300px' }}>
                  {bookingStep === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Full Patient Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${intakeErrors.patientName ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'}`}
                          value={intakeForm.patientName}
                          onChange={(e) => handleIntakeChange('patientName', e.target.value)}
                          placeholder="John Doe"
                        />
                        {intakeErrors.patientName && <p className="text-red-500 text-xs mt-1">{intakeErrors.patientName}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                          <input
                            type="tel"
                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${intakeErrors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'}`}
                            value={intakeForm.phone}
                            onChange={(e) => handleIntakeChange('phone', e.target.value)}
                            placeholder="+1 (555) 000-0000"
                          />
                          {intakeErrors.phone && <p className="text-red-500 text-xs mt-1">{intakeErrors.phone}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            className="w-full p-3 border border-slate-300 bg-slate-50 focus:bg-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={intakeForm.email}
                            onChange={(e) => handleIntakeChange('email', e.target.value)}
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {bookingStep === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Describe Your Symptoms <span className="text-red-500">*</span></label>
                        <textarea
                          rows={4}
                          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${intakeErrors.symptoms ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'}`}
                          value={intakeForm.symptoms}
                          onChange={(e) => handleIntakeChange('symptoms', e.target.value)}
                          placeholder="Briefly describe what you are experiencing..."
                        />
                        {intakeErrors.symptoms && <p className="text-red-500 text-xs mt-1">{intakeErrors.symptoms}</p>}
                      </div>

                      <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${intakeForm.isEmergency ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`} onClick={() => handleIntakeChange('isEmergency', !intakeForm.isEmergency)}>
                        <div className="mt-0.5">
                          <input
                            type="checkbox"
                            className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                            checked={intakeForm.isEmergency}
                            readOnly
                          />
                        </div>
                        <div>
                          <p className={`font-bold ${intakeForm.isEmergency ? 'text-red-700' : 'text-slate-700'}`}>This is an Emergency</p>
                          <p className="text-sm text-slate-500">Check this box if your condition is severe. Note: our system will flag this for priority review.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {bookingStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Select Date <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 transition-all ${intakeErrors.date ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'}`}
                          value={intakeForm.date}
                          onChange={(e) => handleIntakeChange('date', e.target.value)}
                        />
                        {intakeErrors.date && <p className="text-red-500 text-xs mt-1">{intakeErrors.date}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Preferred Time Slot <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Morning', 'Afternoon', 'Evening'].map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleIntakeChange('timeSlot', slot)}
                              className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${intakeForm.timeSlot === slot
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                                }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                        {intakeErrors.timeSlot && <p className="text-red-500 text-xs mt-1 block">{intakeErrors.timeSlot}</p>}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                        <AlertTriangle className="text-blue-600 shrink-0" size={20} />
                        <p className="text-sm text-blue-800">
                          By confirming, your appointment request will be sent to the <b>hospital admin</b> for review. The admin will verify doctor availability and assign a confirmed date and time. You will be notified once your appointment is confirmed.
                        </p>
                      </div>
                    </div>
                  )}
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0, borderTop: '1px solid #f1f5f9', mt: 2 }}>
                  {bookingStep > 1 && (
                    <Button
                      onClick={() => setBookingStep(step => step - 1)}
                      color="inherit"
                      variant="text"
                      sx={{ mr: 'auto', fontWeight: 'bold' }}
                    >
                      Back
                    </Button>
                  )}
                  {bookingStep === 1 && (
                    <Button onClick={() => setConfirmDialog({ open: false, doctor: null })} color="inherit" sx={{ mr: 'auto', fontWeight: 'bold' }}>
                      Cancel
                    </Button>
                  )}

                  {bookingStep < 3 ? (
                    <Button
                      onClick={() => {
                        if (validateStep()) setBookingStep(step => step + 1);
                      }}
                      variant="contained"
                      color="primary"
                      sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold' }}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      onClick={confirmBooking}
                      variant="contained"
                      color="primary"
                      disabled={booking}
                      sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold' }}
                    >
                      {booking ? <CircularProgress size={24} color="inherit" /> : `Confirm Appointment`}
                    </Button>
                  )}
                </DialogActions>
              </Dialog>
              {/* Confirm Ambulance Booking Dialog */}
              <Dialog open={ambulanceDialog.open} onClose={() => setAmbulanceDialog({ open: false, driver: null })}>
                <DialogTitle>Confirm Ambulance Request</DialogTitle>
                <DialogContent>
                  <Typography>
                    Are you sure you want to request an ambulance from <strong>{ambulanceDialog.driver?.name}</strong>?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    Your current location will be sent to the driver for immediate response.
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setAmbulanceDialog({ open: false, driver: null })} autoFocus>Cancel</Button>
                  <Button
                    onClick={confirmAmbulance}
                    variant="contained"
                    color="error"
                    disabled={booking}
                    startIcon={<Ambulance size={18} />}
                  >
                    {booking ? <CircularProgress size={24} /> : 'Request Ambulance'}
                  </Button>
                </DialogActions>
              </Dialog>
              {/* Notification Snackbar */}
              <Snackbar
                open={notify.open}
                autoHideDuration={6000}
                onClose={() => setNotify({ ...notify, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Alert
                  onClose={() => setNotify({ ...notify, open: false })}
                  severity={notify.type}
                  sx={{ width: '100%' }}
                >
                  {notify.msg}
                </Alert>
              </Snackbar>
              {/* Floating Chat Button */}
              {hospitalAdmin && (
                <>
                  <Box
                    sx={{
                      position: 'fixed',
                      bottom: 100,
                      right: 30,
                      zIndex: 1200
                    }}
                  >
                    <button
                      onClick={() => setActiveChat(!activeChat)}
                      className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none text-white"
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      <MessageSquare size={28} />
                    </button>
                  </Box>

                  {activeChat && (
                    <ChatWindow
                      currentUser={{
                        id: JSON.parse(localStorage.getItem('user') || '{}')._id,
                        name: JSON.parse(localStorage.getItem('user') || '{}').name || 'Me'
                      }}
                      chatPartner={chatPartner || hospitalAdmin}
                      onClose={() => setActiveChat(false)}
                    />
                  )}
                </>
              )}

              {/* TAB 11: AI DECISION SUPPORT */}
              {tabValue === 11 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <AIDecisionSupport
                      doctors={doctors}
                      onBookAppointment={handleBookingClick}
                    />
                  </Grid>
                </Grid>
              )}

              {/* TAB 12: HEALTH SUMMARY & WELLNESS PLAN */}
              {tabValue === 12 && (
                <HealthSummaryPanel />
              )}

            </motion.div>
          </AnimatePresence>
        </Grid> {/* End of Content Grid Item */}

        {/* RIGHT SIDEBAR - Always visible: Diet Plan & AI Recommendations */}
        <Grid sx={{
          width: { xl: '260px' },
          flexShrink: 0,
          display: { xs: 'none', xl: 'block' }
        }}>
          <Box sx={{
            position: 'sticky',
            top: 24,
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            bgcolor: 'white',
            p: 2,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#e2e8f0', borderRadius: '4px' },
          }}>
            {/* Panel Header */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1, mb: 1.5,
              pb: 1.5, borderBottom: '1px solid #f1f5f9'
            }}>
              <Box sx={{
                p: 0.75, borderRadius: 1.5,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: 14 }}>🤖</span>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.82rem', lineHeight: 1.2 }}>
                  AI Health Panel
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                  Diet & Wellness
                </Typography>
              </Box>
            </Box>
            <HealthSidePanel />
          </Box>
        </Grid>

      </Grid > {/* End of Main Grid Container */}
    </DashboardLayout >
  );
};

export default PatientDashboard;
