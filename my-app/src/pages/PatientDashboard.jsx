import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  Grid, Card, CardContent, Typography, Button, CardActions, Chip, Avatar,
  Snackbar, Alert, Tabs, Tab, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, CircularProgress, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { MapPin, Stethoscope, Clock, Ambulance, Calendar, Phone, DollarSign, CheckCircle, FileText, Activity, Pill, TestTube, User, Download, XCircle, AlertTriangle, MessageCircle, MessageSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ChatWindow from '../components/ChatWindow';



// Mapbox disabled
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

const PatientDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
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
        const docRes = await fetch('http://localhost:5000/api/doctors', { headers });
        const docData = await docRes.json();
        setDoctors(docData);

        // Fetch Drivers
        const driverRes = await fetch('http://localhost:5000/api/ambulance/drivers', { headers });
        const driverData = await driverRes.json();
        setDrivers(driverData);

        // Fetch Patient's Appointments with populated doctor info
        const aptRes = await fetch('http://localhost:5000/api/appointments/my-appointments', { headers });
        const aptData = await aptRes.json();
        console.log('Fetched appointments:', aptData);
        setPatientAppointments(aptData);

        // Fetch access requests
        const accessRes = await fetch('http://localhost:5000/api/access-requests/my-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const accessResult = await accessRes.json();
        if (accessRes.ok) {
          setAccessRequests(accessResult.requests);
        }

        // Fetch user profile to get hospital admin info
        const profileRes = await fetch('http://localhost:5000/profile', { headers });
        const profileData = await profileRes.json();
        if (profileData.user && profileData.user.hospitalId && profileData.user.hospitalId.adminId) {
          setHospitalAdmin({
            _id: profileData.user.hospitalId.adminId,
            name: `${profileData.user.hospitalId.name} Admin`
          });
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setNotify({ open: true, msg: 'Error loading data. Please refresh the page.', type: 'error' });
      }
    };
    fetchData();
  }, []);

  // Refetch appointments when My Reports tab is selected
  useEffect(() => {
    if (tabValue === 2) { // My Reports tab
      const fetchAppointments = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = { 'Authorization': `Bearer ${token}` };

          const aptRes = await fetch('http://localhost:5000/api/appointments/my-appointments', { headers });
          const aptData = await aptRes.json();
          console.log('Refetched appointments for reports:', aptData);
          setPatientAppointments(aptData);
        } catch (error) {
          console.error('Error fetching appointments for reports:', error);
        }
      };

      fetchAppointments();
    } else if (tabValue === 4) { // Messages Tab
      const fetchConversations = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:5000/api/messages/conversations/list', {
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
    setConfirmDialog({ open: true, doctor });
  };

  const confirmBooking = async () => {
    const doctor = confirmDialog.doctor;
    setBooking(true);

    const token = localStorage.getItem('token');
    // Remove the user.name from the request body since it's fetched from the token on the backend

    const res = await fetch('http://localhost:5000/api/appointments/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        doctorId: doctor._id,
        date: new Date().toISOString()
      })
    });

    setBooking(false);
    setConfirmDialog({ open: false, doctor: null });

    if (res.ok) {
      // Refresh appointments to update the UI
      const aptRes = await fetch('http://localhost:5000/api/appointments/my-appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const aptData = await aptRes.json();
      setPatientAppointments(aptData);

      setNotify({ open: true, msg: `âœ… Appointment booked with ${doctor.name}!`, type: 'success' });
    } else {
      // Try to get error message from response
      let errorMsg = 'âŒ Booking Failed. Please try again.';
      try {
        const errorData = await res.json();
        if (errorData.message) {
          errorMsg = `âŒ Booking Failed: ${errorData.message}`;
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

    const res = await fetch('http://localhost:5000/api/ambulance/book', {
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
      setNotify({ open: true, msg: `ðŸš‘ Ambulance ${driver.name} dispatched to your location!`, type: 'warning' });
    } else {
      setNotify({ open: true, msg: 'âŒ Request Failed. Please try again.', type: 'error' });
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
    const res = await fetch(`http://localhost:5000/api/access-requests/respond/${requestId}`, {
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
      const accessRes = await fetch('http://localhost:5000/api/access-requests/my-requests', {
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

  return (
    <DashboardLayout title="Medical Services" userRole="patient">
      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="Find Doctors" icon={<Stethoscope size={18} />} iconPosition="start" />
          <Tab label="Book Ambulance" icon={<Ambulance size={18} />} iconPosition="start" />
          <Tab label="My Reports" icon={<FileText size={18} />} iconPosition="start" />
          <Tab label="Access Requests" icon={<User size={18} />} iconPosition="start" />
          <Tab label="Messages" icon={<MessageCircle size={18} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* TAB 1: DOCTORS */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {doctors.length === 0 && <Typography p={3}>No doctors available.</Typography>}
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
                      <div className="flex items-center gap-2"><DollarSign size={16} /> â‚¹{doc.consultationFee} Consultation Fee</div>
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

      {/* TAB 2: AMBULANCE DRIVERS */}
      {tabValue === 1 && (
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
                            <span className="text-red-700 font-bold text-sm">â— Live Location</span>
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

      {/* TAB 3: MY REPORTS */}
      {tabValue === 2 && (
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
                    // Add extensive debugging
                    console.log(`Rendering report ${index + 1}:`, {
                      appointmentId: appointment._id,
                      hasDoctorReport: !!appointment.doctorReport,
                      doctorReportKeys: appointment.doctorReport ? Object.keys(appointment.doctorReport) : null,
                      doctorReport: appointment.doctorReport,
                      doctorId: appointment.doctorId,
                      patientId: appointment.patientId
                    });

                    // Add safety checks for report data
                    try {
                      // Validate that we have a doctor report with meaningful content
                      if (!appointment.doctorReport || Object.keys(appointment.doctorReport).length === 0) {
                        console.log('Skipping appointment - no doctor report or empty report');
                        return null;
                      }

                      // Check if the report has at least one meaningful field with content
                      const hasMeaningfulContent =
                        (appointment.doctorReport.diagnosis && appointment.doctorReport.diagnosis.trim() !== '') ||
                        (appointment.doctorReport.symptoms && appointment.doctorReport.symptoms.trim() !== '') ||
                        (appointment.doctorReport.prescription && appointment.doctorReport.prescription.trim() !== '') ||
                        (appointment.doctorReport.recommendations && appointment.doctorReport.recommendations.trim() !== '');

                      if (!hasMeaningfulContent) {
                        console.log('Skipping appointment - report has no meaningful content');
                        return null;
                      }

                      // Validate required fields
                      if (!appointment._id) {
                        console.warn('Appointment missing _id:', appointment);
                        return null;
                      }

                      // Additional validation for doctor and patient info
                      if (!appointment.doctorId || !appointment.patientId) {
                        console.warn('Appointment missing doctor or patient info:', appointment);
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
                                  {appointment.doctorId?.specialization || 'General Physician'} â€¢
                                  {appointment.doctorReport.reportDate ?
                                    (() => {
                                      try {
                                        return new Date(appointment.doctorReport.reportDate).toLocaleDateString();
                                      } catch (e) {
                                        console.error('Date parsing error:', e);
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
                              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 rounded-xl border border-blue-200 shadow-lg">
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
                                        new Date(appointment.doctorReport.reportDate).toLocaleDateString('en-US', {
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
                    } catch (error) {
                      console.error('Error rendering report:', error);
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

      {/* TAB 4: ACCESS REQUESTS */}
      {tabValue === 3 && (
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

      {/* TAB 5: MESSAGES */}
      {tabValue === 4 && (
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

      {/* Confirm Doctor Booking Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, doctor: null })}>
        <DialogTitle>Confirm Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to book an appointment with <strong>{confirmDialog.doctor?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, doctor: null })}>Cancel</Button>
          <Button
            onClick={confirmBooking}
            variant="contained"
            color="primary"
            disabled={booking}
          >
            {booking ? <CircularProgress size={24} /> : 'Confirm Booking'}
          </Button>
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
          <Button onClick={() => setAmbulanceDialog({ open: false, driver: null })}>Cancel</Button>
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
              bottom: 30,
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

    </DashboardLayout>
  );
};

export default PatientDashboard;
