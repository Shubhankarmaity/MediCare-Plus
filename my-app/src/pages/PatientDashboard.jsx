import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  Grid, Card, CardContent, Typography, Button, CardActions, Chip, Avatar,
  Snackbar, Alert, Tabs, Tab, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  Paper
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { MapPin, Stethoscope, Clock, Ambulance, Calendar, Phone, IndianRupee, CheckCircle, FileText, Activity, Pill, TestTube, User, Download, XCircle, AlertTriangle, MessageCircle, MessageSquare, Video } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ChatWindow from '../components/ChatWindow';
import VideoCall from '../components/VideoCall';
import AIDecisionSupport from '../components/AIDecisionSupport';
import HealthVitals from '../components/HealthVitals';
import PrescriptionManager from '../components/PrescriptionManager';
import PatientSettings from '../components/PatientSettings';
import PatientPaymentHistory from '../components/PatientPaymentHistory';
import { API_URL } from '../config';
import { Settings, CreditCard, Brain } from 'lucide-react';
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
    { label: "Prescriptions", icon: <Pill size={20} />, index: 4 },
    { label: "Book Ambulance", icon: <Ambulance size={20} />, index: 5 },
    { label: "My Reports", icon: <FileText size={20} />, index: 6 },
    { label: "Access Requests", icon: <User size={20} />, index: 7 },
    { label: "Messages", icon: <MessageCircle size={20} />, index: 8 },
    { label: "Payments", icon: <CreditCard size={20} />, index: 9 },
    { label: "Settings", icon: <Settings size={20} />, index: 10 },
    { label: "AI Health Check", icon: <Brain size={20} />, index: 11 },
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
    const socket = io(API_URL);
    socket.on('doctor_approved', () => {
      const token = localStorage.getItem('token');
      fetch(`${API_URL}/api/doctors`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setDoctors(data))
        .catch(err => console.error('Error refreshing doctors:', err));
    });
    return () => { socket.off('doctor_approved'); socket.disconnect(); };
  }, []);

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

    // Structure notes to include symptoms, emergency status and preferred time slot
    const professionalNotes = `Symptoms: ${intakeForm.symptoms}\nPreferred Time: ${intakeForm.timeSlot}\nEmergency: ${intakeForm.isEmergency ? 'YES' : 'NO'}\nPhone: ${intakeForm.phone}`;

    const res = await fetch(`${API_URL}/api/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        doctorId: doctor._id,
        date: new Date(intakeForm.date).toISOString(),
        notes: professionalNotes
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

      setNotify({ open: true, msg: `✅ Appointment booked with ${doctor.name}!`, type: 'success' });
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

      <Grid container spacing={3} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        {/* DESKTOP SIDEBAR NAVIGATION - FIXED WIDTH */}
        <Grid sx={{ width: { md: '280px' }, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, height: '100%', border: '1px solid #e2e8f0', minHeight: '80vh' }}>
            <Typography variant="overline" color="text.secondary" fontWeight="bold" sx={{ px: 2, mb: 2, display: 'block' }}>Menu</Typography>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <motion.button
                  key={item.index}
                  onClick={() => setTabValue(item.index)}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 text-sm font-medium ${tabValue === item.index
                    ? 'bg-primary-blue text-white shadow-sm'
                    : 'text-body-gray hover:bg-slate-50 hover:text-primary-navy'
                    }`}
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              ))}
            </div>
          </Paper>
        </Grid>

        {/* MAIN CONTENT AREA - FLEX GROW */}
        <Grid sx={{ flexGrow: 1, width: { xs: '100%', md: 'calc(100% - 280px)' }, minWidth: 0 }}>
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
                <Grid container spacing={3} mb={4}>
                  {/* Welcome Banner */}
                  <Grid size={{ xs: 12 }}>
                    <div className="bg-primary-navy rounded-2xl p-8 text-white relative overflow-hidden shadow-sm">
                      <div className="relative z-10">
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                          Welcome back, {user?.name?.split(' ')[0]}! 👋
                        </Typography>
                        <Typography variant="body1" className="opacity-90 max-w-2xl">
                          Track your health, manage appointments, and connect with top doctors all in one place.
                        </Typography>
                        {patientHospital && (
                          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                            <MapPin size={16} className="text-white" />
                            <span className="text-white text-sm font-semibold">{patientHospital.name}</span>
                            {patientHospital.city && (
                              <span className="text-white/70 text-sm">• {patientHospital.city}</span>
                            )}
                            <span className="text-white/60 text-xs bg-white/20 rounded-full px-2 py-0.5">Your Hospital</span>
                          </div>
                        )}
                      </div>
                      {/* Decorative circles */}
                      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
                    </div>
                  </Grid>

                  {/* Quick Stats */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Calendar size={24} /></div>
                        <div>
                          <Typography color="text.secondary" variant="caption" fontWeight="bold">UPCOMING</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {patientAppointments.filter(apt => ['scheduled', 'rescheduled', 'approved'].includes(apt.status)).length} Appointments
                          </Typography>
                        </div>
                      </div>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full text-green-600"><Pill size={24} /></div>
                        <div>
                          <Typography color="text.secondary" variant="caption" fontWeight="bold">PRESCRIPTIONS</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {patientAppointments.filter(apt => apt.doctorReport?.prescription).length} Records
                          </Typography>
                        </div>
                      </div>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600"><MessageCircle size={24} /></div>
                        <div>
                          <Typography color="text.secondary" variant="caption" fontWeight="bold">MESSAGES</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {conversations.length} Chats
                          </Typography>
                        </div>
                      </div>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* TAB 1: DOCTORS */}
              {tabValue === 1 && (
                <Grid container spacing={3}>
                  {doctors.length === 0 && (
                    <div className="col-span-3 p-8 text-center text-gray-500">
                      <Stethoscope size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="font-semibold text-gray-600 mb-1">No Doctors Available Yet</p>
                      <p className="text-sm">There are no approved doctors at your registered hospital at this time. Please check back later or contact your hospital admin.</p>
                    </div>
                  )}
                  {doctors.map(doc => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc._id}>
                      <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <div className="flex items-center gap-4 mb-3">
                            <Avatar sx={{ bgcolor: 'teal', width: 56, height: 56 }}>{doc.name[0]}</Avatar>
                            <div>
                              <Typography variant="h6" fontWeight="bold">{doc.name}</Typography>
                              <Chip label={doc.specialization} size="small" color="primary" variant="outlined" />
                            </div>
                          </div>
                          <div className="text-gray-600 text-sm space-y-1">
                            <div className="flex items-center gap-2"><MapPin size={16} /> {doc.hospitalName}</div>
                            <div className="flex items-center gap-2"><Clock size={16} /> {doc.experience} Years Exp.</div>
                            {doc.consultationFee && (
                              <div className="flex items-center gap-2"><IndianRupee size={16} /> {doc.consultationFee} Consultation Fee</div>
                            )}
                            {doc.availableTime && (
                              <div className="flex items-center gap-2"><Calendar size={16} /> {doc.availableDays} | {doc.availableTime}</div>
                            )}
                          </div>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleBookingClick(doc)}
                            disabled={patientAppointments.some(apt =>
                              apt.doctorId._id === doc._id &&
                              (apt.status === 'pending' || apt.status === undefined)
                            )}
                            sx={{
                              ...(patientAppointments.some(apt =>
                                apt.doctorId._id === doc._id &&
                                (apt.status === 'pending' || apt.status === undefined)
                              ) && {
                                bgcolor: 'grey.600',
                                color: 'grey.300',
                                '&:hover': {
                                  bgcolor: 'grey.700'
                                }
                              })
                            }}
                          >
                            {patientAppointments.some(apt =>
                              apt.doctorId._id === doc._id &&
                              (apt.status === 'pending' || apt.status === undefined)
                            ) ? "Pending Approval" : "Book Appointment"}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* TAB 2: MY APPOINTMENTS */}
              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>My Appointments</Typography>
                  </Grid>

                  {/* UPCOMING APPOINTMENTS */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Calendar className="text-blue-600" size={20} /> Upcoming
                        </Typography>

                        {patientAppointments.filter(apt => ['pending', 'approved'].includes(apt.status)).length === 0 ? (
                          <Typography color="text.secondary" align="center" py={4}>No upcoming appointments.</Typography>
                        ) : (
                          <div className="space-y-4">
                            {patientAppointments
                              .filter(apt => ['pending', 'approved'].includes(apt.status))
                              .map(apt => (
                                <Card key={apt._id} elevation={0} sx={{ bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #f3f4f6' }}>
                                  <CardContent sx={{ p: 2 }}>
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <Typography variant="subtitle1" fontWeight="bold">{apt.doctorId?.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{apt.doctorId?.specialization}</Typography>
                                      </div>
                                      <Chip
                                        label={apt.status.toUpperCase()}
                                        color={apt.status === 'approved' ? 'success' : 'warning'}
                                        size="small"
                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                      />
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                      <Clock size={14} />
                                      {new Date(apt.date).toLocaleDateString()} at {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                      {apt.status === 'approved' && (
                                        <Button
                                          variant="contained"
                                          size="small"
                                          color="primary"
                                          startIcon={<Video size={16} />}
                                          fullWidth
                                          onClick={() => {
                                            // Normally we would just wait for the doctor to call, 
                                            // but we can also have a "Join Waiting Room" feature if needed.
                                            // For now, let's just show a toast that "Doctor will call you"
                                            setNotify({ open: true, msg: 'Please wait, the doctor will initiate the call at the scheduled time.', type: 'info' });
                                          }}
                                        >
                                          Join Call
                                        </Button>
                                      )}

                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<MessageCircle size={16} />}
                                        onClick={() => {
                                          setChatPartner(apt.doctorId);
                                          setActiveChat(true);
                                        }}
                                        sx={{ flex: 1 }}
                                      >
                                        Chat
                                      </Button>

                                      {apt.status === 'pending' && (
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          color="error"
                                          onClick={() => cancelAppointment(apt._id)}
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, height: '100%' }}>
                      <CardContent>
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
                                <Card key={apt._id} elevation={0} sx={{ bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #f3f4f6', opacity: 0.8 }}>
                                  <CardContent sx={{ p: 2 }}>
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <Typography variant="subtitle1" fontWeight="bold">{apt.doctorId?.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{apt.doctorId?.specialization}</Typography>
                                      </div>
                                      <Chip
                                        label={apt.status.toUpperCase()}
                                        color={apt.status === 'completed' ? 'primary' : 'error'}
                                        size="small"
                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                      />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Calendar size={14} /> {new Date(apt.date).toLocaleDateString()}
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
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                          Available Ambulance Drivers
                        </Typography>
                        {drivers.length === 0 ? (
                          <Typography p={3}>No ambulance drivers online.</Typography>
                        ) : (
                          <div className="space-y-4">
                            {drivers.map(driver => (
                              <Card key={driver._id} elevation={1} sx={{ borderRadius: 2 }}>
                                <CardContent>
                                  <div className="flex items-center gap-4 mb-3">
                                    <Avatar sx={{ bgcolor: '#ef4444', width: 56, height: 56 }}><Ambulance /></Avatar>
                                    <div>
                                      <Typography variant="h6" fontWeight="bold">{driver.name}</Typography>
                                      <Typography variant="caption" className="text-gray-500">Vehicle: {driver.vehicleNumber}</Typography>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between bg-red-50 p-2 rounded">
                                    <span className="text-red-700 font-bold text-sm">● Live Location</span>
                                    <span className="text-xs text-gray-500">2.4 km away</span>
                                  </div>
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                  <Button fullWidth variant="contained" color="error" onClick={() => handleAmbulanceClick(driver)}>
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

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2} className="flex items-center gap-2">
                          <MapPin size={20} /> Your Location
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
                            GPS tracking is active.
                          </Typography>
                          <div className="inline-block bg-white px-4 py-2 rounded-lg border shadow-sm">
                            <Typography variant="code" className="font-mono text-sm text-gray-600">
                              Lat: {patientLocation.lat.toFixed(6)} | Lng: {patientLocation.lng.toFixed(6)}
                            </Typography>
                          </div>
                        </div>

                        <Typography variant="body2" color="text.secondary" mt={2}>
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
                                <Accordion key={appointment._id || `report-${index}`} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                                  <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    sx={{
                                      bgcolor: '#f8fafc',
                                      '&:hover': { bgcolor: '#f1f5f9' }
                                    }}
                                  >
                                    <div className="flex items-center gap-4 w-full">
                                      <Avatar sx={{ bgcolor: 'teal' }}>
                                        {(appointment.doctorId?.name || 'D').charAt(0)}
                                      </Avatar>
                                      <div className="flex-1">
                                        <Typography variant="subtitle1" fontWeight="bold">
                                          {appointment.doctorId?.name || 'Unknown Doctor'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {appointment.doctorId?.specialization || 'General Physician'}
                                          &nbsp;
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
                                          color={
                                            appointment.doctorReport.severity === 'Critical' ? 'error' :
                                              appointment.doctorReport.severity === 'High' ? 'warning' :
                                                appointment.doctorReport.severity === 'Low' ? 'info' : 'default'
                                          }
                                          sx={{ mr: 1 }}
                                        />
                                      )}
                                      <Chip
                                        label="New Report"
                                        size="small"
                                        color="success"
                                        sx={{
                                          visibility: index === 0 && appointment.doctorReport.reportDate &&
                                            (new Date() - new Date(appointment.doctorReport.reportDate)) < 7 * 24 * 60 * 60 * 1000 ?
                                            'visible' : 'hidden'
                                        }}
                                      />
                                    </div>
                                  </AccordionSummary>
                                  <AccordionDetails sx={{ p: 3 }}>
                                    <div id={`report-${appointment._id}`} className="space-y-6">
                                      {/* Report Actions */}
                                      <div className="flex justify-end">
                                        <Button
                                          variant="contained"
                                          color="primary"
                                          onClick={() => downloadReport(appointment)}
                                          startIcon={<Download size={18} />}
                                          sx={{
                                            bgcolor: '#14b8a6',
                                            '&:hover': { bgcolor: '#0d9488' }
                                          }}
                                        >
                                          Download PDF
                                        </Button>
                                      </div>

                                      {/* Report Header */}
                                      <div className="bg-primary-navy p-6 rounded-xl border border-divider-gray shadow-sm">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                          <div className="flex items-center gap-4">
                                            <div className="bg-white/20 p-3 rounded-full">
                                              <FileText className="text-white" size={32} />
                                            </div>
                                            <div>
                                              <Typography variant="h4" fontWeight="bold" className="flex items-center gap-2 text-white">
                                                Medical Report
                                              </Typography>
                                              <Typography variant="body1" className="mt-1 text-blue-100">
                                                Comprehensive Patient Health Assessment
                                              </Typography>
                                            </div>
                                          </div>
                                          <div className="bg-white/20 px-4 py-2 rounded-full">
                                            <Typography variant="body2" className="text-white font-medium">
                                              {appointment.doctorReport.reportDate ?
                                                new Date(appointment.doctorReport.reportDate).toLocaleDateString('en-IN', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric'
                                                }) : 'Date Unknown'}
                                            </Typography>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Patient Info */}
                                      <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                        <CardContent>
                                          <Typography variant="h6" fontWeight="bold" mb={2} className="flex items-center gap-2">
                                            <User size={20} className="text-blue-600" /> Patient Information
                                          </Typography>
                                          <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <Typography variant="body2" color="text.secondary">Patient Name</Typography>
                                              <Typography variant="body1" fontWeight="medium">{appointment.patientId?.name || 'Unknown'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <Typography variant="body2" color="text.secondary">Doctor</Typography>
                                              <Typography variant="body1" fontWeight="medium">{appointment.doctorId?.name || 'Unknown'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <Typography variant="body2" color="text.secondary">Specialization</Typography>
                                              <Typography variant="body1" fontWeight="medium">{appointment.doctorId?.specialization || 'General Physician'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                              <Typography variant="body2" color="text.secondary">Hospital</Typography>
                                              <Typography variant="body1" fontWeight="medium">{appointment.doctorId?.hospitalName || 'Not Specified'}</Typography>
                                            </Grid>
                                          </Grid>
                                        </CardContent>
                                      </Card>

                                      {/* Diagnosis */}
                                      {appointment.doctorReport.diagnosis && (
                                        <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '4px solid #3b82f6' }}>
                                          <CardContent>
                                            <Typography variant="h6" fontWeight="bold" mb={2} className="flex items-center gap-2">
                                              <Activity size={20} className="text-blue-600" /> Diagnosis
                                            </Typography>
                                            <Typography variant="body1">{appointment.doctorReport.diagnosis}</Typography>
                                          </CardContent>
                                        </Card>
                                      )}

                                      {/* Symptoms */}
                                      {appointment.doctorReport.symptoms && (
                                        <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '4px solid #f59e0b' }}>
                                          <CardContent>
                                            <Typography variant="h6" fontWeight="bold" mb={2} className="flex items-center gap-2">
                                              <TestTube size={20} className="text-amber-500" /> Reported Symptoms
                                            </Typography>
                                            <Typography variant="body1">{appointment.doctorReport.symptoms}</Typography>
                                          </CardContent>
                                        </Card>
                                      )}

                                      {/* Prescription */}
                                      {appointment.doctorReport.prescription && (
                                        <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '4px solid #10b981' }}>
                                          <CardContent>
                                            <Typography variant="h6" fontWeight="bold" mb={2} className="flex items-center gap-2">
                                              <Pill size={20} className="text-green-500" /> Prescription
                                            </Typography>
                                            <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                              {appointment.doctorReport.prescription}
                                            </Typography>
                                          </CardContent>
                                        </Card>
                                      )}

                                      {/* Recommendations */}
                                      {appointment.doctorReport.recommendations && (
                                        <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '4px solid #8b5cf6' }}>
                                          <CardContent>
                                            <Typography variant="h6" fontWeight="bold" mb={2} className="flex items-center gap-2">
                                              <CheckCircle size={20} className="text-purple-500" /> Recommendations
                                            </Typography>
                                            <Typography variant="body1">{appointment.doctorReport.recommendations}</Typography>
                                          </CardContent>
                                        </Card>
                                      )}

                                      {/* Severity */}
                                      {appointment.doctorReport.severity && (
                                        <Card variant="outlined" sx={{ borderRadius: 3 }}>
                                          <CardContent>
                                            <Typography variant="h6" fontWeight="bold" mb={2} className="flex items-center gap-2">
                                              <AlertTriangle size={20} className={
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
                                              sx={{ fontWeight: 'bold' }}
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
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <User className="text-blue-600" /> Access Requests
                  </h3>

                  {accessRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No access requests at this time.</p>
                  ) : (
                    <div className="space-y-4">
                      {accessRequests.map((request) => (
                        <Card key={request.requestId} elevation={1} sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div>
                                <Typography variant="h6" fontWeight="bold">
                                  {request.name || 'Unknown User'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Requested access to your profile
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(request.requestedAt).toLocaleString()}
                                </Typography>
                              </div>
                              <div className="flex items-center gap-2">
                                <Chip
                                  label={(request.status || 'pending').toUpperCase()}
                                  color={
                                    request.status === 'approved' ? 'success' :
                                      request.status === 'rejected' ? 'error' : 'warning'
                                  }
                                  size="small"
                                />
                                {request.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      onClick={() => respondToAccessRequest(request.requestId, 'approve')}
                                      startIcon={<CheckCircle size={16} />}
                                      sx={{ borderRadius: 2 }}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      onClick={() => respondToAccessRequest(request.requestId, 'reject')}
                                      startIcon={<XCircle size={16} />}
                                      sx={{ borderRadius: 2 }}
                                    >
                                      Reject
                                    </Button>
                                  </>
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
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <MessageCircle className="text-blue-600" /> My Messages
                  </h3>

                  {conversations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No conversations yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {conversations.map((convo, index) => (
                        <Card
                          key={index}
                          elevation={1}
                          sx={{ borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f9fafb' } }}
                          onClick={() => {
                            setChatPartner(convo.user);
                            setActiveChat(true);
                          }}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <div className="flex items-center gap-4">
                              <Avatar sx={{ bgcolor: '#3b82f6' }}>{convo.user.name?.charAt(0) || '?'}</Avatar>
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {convo.user.name || 'Unknown User'}
                                  </Typography>
                                  <div className="flex flex-col items-end">
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(convo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                    {convo.unreadCount > 0 && (
                                      <Box
                                        sx={{
                                          bgcolor: '#25D366', // WhatsApp green
                                          color: 'white',
                                          borderRadius: '50%',
                                          width: 20,
                                          height: 20,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '0.7rem',
                                          fontWeight: 'bold',
                                          mt: 0.5
                                        }}
                                      >
                                        {convo.unreadCount}
                                      </Box>
                                    )}
                                  </div>
                                </div>
                                <Typography variant="body2" color={convo.unreadCount > 0 ? "text.primary" : "text.secondary"} fontWeight={convo.unreadCount > 0 ? "bold" : "normal"} noWrap>
                                  {convo.lastMessage}
                                </Typography>
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
                          By confirming, your intake form will be sent directly to <b>Dr. {confirmDialog.doctor?.name.split(' ')[1] || confirmDialog.doctor?.name}</b> for immediate review.
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

            </motion.div>
          </AnimatePresence>
        </Grid> {/* End of Content Grid Item */}
      </Grid > {/* End of Main Grid Container */}
    </DashboardLayout >
  );
};

export default PatientDashboard;
