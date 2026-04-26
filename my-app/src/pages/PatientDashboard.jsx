import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  Grid, Card, CardContent, Typography, Button, CardActions, Chip, Avatar,
  Tabs, Tab, Box, Dialog, DialogTitle, DialogContent,
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
import HealthSummaryPanel from '../components/HealthSummaryPanel';
import HealthVitals from '../components/HealthVitals';
import PrescriptionManager from '../components/PrescriptionManager';
import PatientSettings from '../components/PatientSettings';
import PatientPaymentHistory from '../components/PatientPaymentHistory';
import { API_URL } from '../config';
import { Settings, CreditCard, Brain, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import OverviewTab from '../components/patient-tabs/OverviewTab';
import FindDoctorsTab from '../components/patient-tabs/FindDoctorsTab';
import MyAppointmentsTab from '../components/patient-tabs/MyAppointmentsTab';
import BookAmbulanceTab from '../components/patient-tabs/BookAmbulanceTab';
import MyReportsTab from '../components/patient-tabs/MyReportsTab';
import AccessRequestsTab from '../components/patient-tabs/AccessRequestsTab';
import MessagesTab from '../components/patient-tabs/MessagesTab';
import { toast } from 'react-hot-toast';

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
    { label: "Health Summary", icon: <HeartPulse size={20} />, index: 12 },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const [doctors, setDoctors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]); // Track patient's appointments
  
  const setNotify = ({ open, msg, type }) => {
    if (!open) return;
    if (type === 'success') toast.success(msg);
    else if (type === 'error' || type === 'warning') toast.error(msg);
    else toast(msg);
  };

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
                <OverviewTab 
                  user={user} 
                  patientHospital={patientHospital} 
                  patientAppointments={patientAppointments} 
                  conversations={conversations} 
                />
              )}

              {/* TAB 1: DOCTORS */}
              {tabValue === 1 && (
                <FindDoctorsTab
                  doctors={doctors}
                  patientAppointments={patientAppointments}
                  handleBookingClick={handleBookingClick}
                />
              )}

              {/* TAB 2: MY APPOINTMENTS */}
              {tabValue === 2 && (
                <MyAppointmentsTab
                  patientAppointments={patientAppointments}
                  setNotify={setNotify}
                  setChatPartner={setChatPartner}
                  setActiveChat={setActiveChat}
                  cancelAppointment={cancelAppointment}
                />
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
                <BookAmbulanceTab
                  drivers={drivers}
                  handleAmbulanceClick={handleAmbulanceClick}
                  patientLocation={patientLocation}
                />
              )}

              {/* TAB 6: MY REPORTS */}
              {tabValue === 6 && (
                <MyReportsTab
                  patientAppointments={patientAppointments}
                  downloadReport={downloadReport}
                />
              )}

              {/* TAB 7: ACCESS REQUESTS */}
              {tabValue === 7 && (
                <AccessRequestsTab
                  accessRequests={accessRequests}
                  respondToAccessRequest={respondToAccessRequest}
                />
              )}

              {/* TAB 8: MESSAGES */}
              {tabValue === 8 && (
                <MessagesTab
                  conversations={conversations}
                  setChatPartner={setChatPartner}
                  setActiveChat={setActiveChat}
                />
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
      </Grid > {/* End of Main Grid Container */}
    </DashboardLayout >
  );
};

export default PatientDashboard;
