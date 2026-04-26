import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  Grid, Paper, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Avatar, CircularProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, Box, Tooltip,
  Select, MenuItem, FormControl, InputLabel, TextField
} from '@mui/material';
import { RefreshCw, X, Calendar, CheckCircle, XCircle, Clock, DoorOpen, MessageSquare, AlertTriangle } from 'lucide-react';
import io from 'socket.io-client';
import NotificationBell from '../components/NotificationBell';
import ChatWindow from '../components/ChatWindow';
import { API_URL } from '../config';

const socket = io(API_URL); // Connect to WebSocket Server

const AdminDashboard = () => {
  const [data, setData] = useState({ stats: { doctorCount: 0, patientCount: 0, driverCount: 0 }, users: [] });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [accessRequestStatus, setAccessRequestStatus] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  // Appointment Management State
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState('requested');
  const [assignDialog, setAssignDialog] = useState({ open: false, appointment: null });
  const [assignForm, setAssignForm] = useState({ date: '', timeSlot: '', adminNotes: '' });
  const [doctorSlots, setDoctorSlots] = useState({ doctor: null, existingAppointments: [] });
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rejectDialog, setRejectDialog] = useState({ open: false, appointment: null, reason: '' });

  // Chatbot Analytics State
  const [chatbotAnalytics, setChatbotAnalytics] = useState(null);
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [chatbotError, setChatbotError] = useState('');

  // Approval Modal State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvingDoctor, setApprovingDoctor] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const DEPARTMENTS = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology',
    'Radiology', 'Emergency Medicine', 'Internal Medicine', 'Surgery',
    'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT', 'Psychiatry', 'General'
  ];

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (err) {
      console.error("Error fetching admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setDetailsLoading(true);
    setOpenModal(true);
    setAccessRequestStatus(null); // Reset access request status
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/admin/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) {
        setUserDetails(result);
        setSelectedUser(result.user);
      } else if (res.status === 403 && result.requiresApproval) {
        // Handle access restriction
        const existingBasicUser = data.users.find(u => u._id === userId);
        setSelectedUser({
          _id: userId,
          name: existingBasicUser?.name || 'Restricted User',
          email: existingBasicUser?.email
        });
        setAccessRequestStatus({
          message: result.message,
          requestPending: result.requestPending,
          userId: result.userId
        });
        setUserDetails(null);
      }
    } catch (err) {
      console.error("Error fetching user details", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
    setUserDetails(null);
    setAccessRequestStatus(null);
  };

  // Function to request access to patient profile
  const requestAccessToPatient = async (patientId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/access-requests/request-access/${patientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await res.json();
      if (res.ok) {
        // Update the access request status
        setAccessRequestStatus({
          message: result.message,
          requestPending: true,
          userId: patientId
        });
      } else {
        console.error("Error requesting access:", result.message);
      }
    } catch (err) {
      console.error("Error requesting access", err);
    }
  };

  const fetchPendingDoctors = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/admin/pending-doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) setPendingDoctors(result);
    } catch (err) {
      console.error("Error fetching pending doctors", err);
    }
  };


  const handleApproveDoctor = (doctor) => {
    setApprovingDoctor(doctor);
    setSelectedDepartment(doctor.department || 'General');
    setApproveModalOpen(true);
  };

  const confirmApproveDoctor = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/admin/approve-doctor/${approvingDoctor._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ department: selectedDepartment || 'General' })
      });
      if (res.ok) {
        setApproveModalOpen(false);
        setApprovingDoctor(null);
        fetchPendingDoctors();
        fetchData();
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || 'Failed to approve doctor'}`);
      }
    } catch (err) {
      console.error("Error approving doctor", err);
      alert("Error approving doctor");
    }
  };


  const handleRejectDoctor = async (doctorId) => {
    const reason = prompt('Enter rejection reason (optional):');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/admin/reject-doctor/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Not specified' })
      });
      if (res.ok) {
        alert('Doctor registration rejected');
        fetchPendingDoctors();
        fetchData();
      }
    } catch (err) {
      console.error("Error rejecting doctor", err);
    }
  };

  const handleDischargePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to discharge this patient? They will be removed from your hospital's admitted lists.")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/admin/discharge-patient/${patientId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        handleCloseModal(); // Close modal if open
        fetchData(); // Refresh list
      } else {
        alert(data.message || "Failed to discharge patient");
      }
    } catch (err) {
      console.error("Error discharging patient:", err);
      alert("Error processing discharge");
    }
  };

  // ─── Appointment Management Functions ───
  const fetchAppointmentRequests = async (status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/appointments/hospital-requests?status=${status || appointmentFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) setAppointmentRequests(result);
    } catch (err) {
      console.error("Error fetching appointment requests:", err);
    }
  };

  const fetchChatbotAnalytics = async () => {
    setChatbotLoading(true);
    setChatbotError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/chatbot/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await res.json();
      if (res.ok) {
        setChatbotAnalytics(result);
      } else {
        setChatbotError(result.message || 'Unable to load chatbot analytics');
      }
    } catch (err) {
      console.error('Error fetching chatbot analytics:', err);
      setChatbotError('Unable to load chatbot analytics');
    } finally {
      setChatbotLoading(false);
    }
  };

  const fetchDoctorSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    setSlotsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/appointments/doctor-slots/${doctorId}?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) setDoctorSlots(result);
    } catch (err) {
      console.error("Error fetching doctor slots:", err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleAssignOpen = (appointment) => {
    setAssignForm({
      date: appointment.preferredDate ? new Date(appointment.preferredDate).toISOString().split('T')[0] : '',
      timeSlot: appointment.preferredTimeSlot || '',
      adminNotes: ''
    });
    setDoctorSlots({ doctor: null, existingAppointments: [] });
    setAssignDialog({ open: true, appointment });
    // Fetch doctor's schedule for the preferred date
    if (appointment.doctorId?._id && appointment.preferredDate) {
      fetchDoctorSlots(appointment.doctorId._id, new Date(appointment.preferredDate).toISOString().split('T')[0]);
    }
  };

  const handleAssignAppointment = async () => {
    const { appointment } = assignDialog;
    if (!assignForm.date || !assignForm.timeSlot) {
      alert('Please select a date and time slot.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/appointments/assign/${appointment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          assignedDate: assignForm.date,
          assignedTimeSlot: assignForm.timeSlot,
          adminNotes: assignForm.adminNotes
        })
      });
      const result = await res.json();
      if (res.ok) {
        setAssignDialog({ open: false, appointment: null });
        fetchAppointmentRequests();
      } else {
        alert(result.message || 'Failed to assign appointment');
      }
    } catch (err) {
      console.error("Error assigning appointment:", err);
      alert("Error assigning appointment");
    }
  };

  const handleRejectAppointment = async () => {
    const { appointment } = rejectDialog;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/appointments/reject/${appointment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reason: rejectDialog.reason })
      });
      if (res.ok) {
        setRejectDialog({ open: false, appointment: null, reason: '' });
        fetchAppointmentRequests();
      } else {
        const result = await res.json();
        alert(result.message || 'Failed to reject appointment');
      }
    } catch (err) {
      console.error("Error rejecting appointment:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPendingDoctors();
    fetchAppointmentRequests('requested');
    fetchChatbotAnalytics();

    // SOCKET.IO EVENT LISTENER
    socket.on('new_user', (newUser) => {
      setData(prevData => {
        // Update Stats
        const newStats = { ...prevData.stats };
        if (newUser.role === 'doctor') newStats.doctorCount++;
        else if (newUser.role === 'patient') newStats.patientCount++;
        else if (newUser.role === 'driver') newStats.driverCount++;

        // Update Table (Prepend new user)
        const newUsers = [newUser, ...prevData.users]; // Show all users

        return { stats: newStats, users: newUsers };
      });

      // Optional: Sound Alert
      new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3').play().catch(() => { });
    });

    // Listen for general admin role notifications
    socket.on('admin_notification', (data) => {
      // Check if this notification is means for this admin (if adminId is specified)
      const currentUserId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id;

      if (!data.adminId || data.adminId === currentUserId) {
        if (data.type === 'new_appointment') {
          fetchAppointmentRequests();
          fetchData();
        }
      }
    });

    return () => {
      socket.off('new_user');
      socket.off('admin_notification');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="flex justify-center mt-20"><CircularProgress /></div>;

  return (
    <DashboardLayout title="System Overview" userRole="admin">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <NotificationBell userId={JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id} />
      </Box>
      <div className="flex justify-between items-center mb-6">
        <Typography variant="body2" color="text.secondary">Live Real-time Data Feed</Typography>
        <IconButton
          onClick={() => {
            fetchData();
            fetchPendingDoctors();
            fetchAppointmentRequests(appointmentFilter);
            fetchChatbotAnalytics();
          }}
          title="Force Refresh"
        >
          <RefreshCw size={18} />
        </IconButton>
      </div>

      {/* PENDING DOCTOR APPROVALS */}
      {pendingDoctors.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#fef3c7', border: '2px solid #fbbf24' }}>
          <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock size={24} /> Pending Doctor Approvals ({pendingDoctors.length})
          </Typography>
          <div className="space-y-3">
            {pendingDoctors.map((doctor) => (
              <div key={doctor._id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow">
                <div className="flex items-center gap-4">
                  <Avatar sx={{ bgcolor: '#14b8a6', width: 48, height: 48 }}>
                    {doctor.name.charAt(0)}
                  </Avatar>
                  <div>
                    <Typography variant="subtitle1" fontWeight="bold">{doctor.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{doctor.email}</Typography>
                    <div className="text-sm mt-1">
                      <span className="font-semibold text-teal-600">{doctor.specialization}</span> • {doctor.hospitalName} • {doctor.experience} Years Exp.<br />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircle size={18} />}
                    onClick={() => handleApproveDoctor(doctor)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<XCircle size={18} />}
                    onClick={() => handleRejectDoctor(doctor._id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Paper>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 3, bgcolor: '#3b82f6', color: 'white', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Registered Doctors</Typography>
            <Typography variant="h3" fontWeight="bold">{data?.stats.doctorCount || 0}</Typography>
            <div className="absolute -right-4 -bottom-4 opacity-20 text-white"><Avatar sx={{ width: 80, height: 80 }} /></div>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 3, bgcolor: '#10b981', color: 'white', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Hospital Patients</Typography>
            <Typography variant="h3" fontWeight="bold">{data?.stats.patientCount || 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 3, bgcolor: '#f43f5e', color: 'white', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Ambulance Drivers</Typography>
            <Typography variant="h3" fontWeight="bold">{data?.stats.driverCount || 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 3, bgcolor: '#8b5cf6', color: 'white', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Pending Requests</Typography>
            <Typography variant="h3" fontWeight="bold">
              {appointmentRequests.filter(a => a.status === 'requested').length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Chatbot Quality Analytics */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MessageSquare size={22} /> Chatbot Quality (7 Days)
          </Typography>
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={chatbotAnalytics?.weekly?.period || '7 days'}
          />
        </Box>

        {chatbotLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : chatbotError ? (
          <Typography color="error" variant="body2">{chatbotError}</Typography>
        ) : chatbotAnalytics?.weekly ? (
          <>
            <Grid container spacing={2} mb={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center', bgcolor: '#f8fafc' }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: '#f59e0b' }}>
                    {chatbotAnalytics.weekly.clarificationRate || '0%'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Clarification Rate</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center', bgcolor: '#f8fafc' }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: '#10b981' }}>
                    {chatbotAnalytics.weekly.clarificationRecoveryRate || '0%'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Recovery After Clarify</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center', bgcolor: '#f8fafc' }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: '#3b82f6' }}>
                    {chatbotAnalytics.weekly.clarificationCount ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Clarification Prompts</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center', bgcolor: '#f8fafc' }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: '#8b5cf6' }}>
                    {chatbotAnalytics.weekly.clarificationRecoveredCount ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Recovered Conversations</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label={`30-day success: ${chatbotAnalytics.successRate || 'N/A'}`} color="success" size="small" icon={<CheckCircle size={14} />} />
              <Chip label={`Avg response: ${chatbotAnalytics.avgResponseTime || 'N/A'}`} size="small" />
              <Chip label={`Tracked queries: ${chatbotAnalytics.weekly.totalTrackedQueries ?? 0}`} size="small" />
              <Chip label={`Recovery window: ${chatbotAnalytics.weekly.recoveryWindowMinutes ?? 30} min`} size="small" />
            </Box>
          </>
        ) : (
          <Typography color="text.secondary" variant="body2">No chatbot analytics data available yet.</Typography>
        )}
      </Paper>

      {/* ── APPOINTMENT MANAGEMENT ── */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={22} /> Appointment Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['requested', 'approved', 'rejected', 'all'].map(f => (
              <Button
                key={f}
                size="small"
                variant={appointmentFilter === f ? 'contained' : 'outlined'}
                onClick={() => { setAppointmentFilter(f); fetchAppointmentRequests(f); }}
                sx={{ textTransform: 'capitalize', borderRadius: 2, fontWeight: 600 }}
                color={f === 'requested' ? 'warning' : f === 'approved' ? 'success' : f === 'rejected' ? 'error' : 'primary'}
              >
                {f}
              </Button>
            ))}
          </Box>
        </Box>

        {appointmentRequests.length === 0 ? (
          <Typography color="text.secondary" align="center" py={4}>No {appointmentFilter} appointment requests.</Typography>
        ) : (
          <div className="space-y-3">
            {appointmentRequests.map((apt) => (
              <Paper key={apt._id} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e5e7eb', bgcolor: apt.isEmergency ? '#fef2f2' : '#f9fafb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {apt.patientId?.name || 'Unknown Patient'}
                      </Typography>
                      {apt.isEmergency && (
                        <Chip label="EMERGENCY" size="small" color="error" icon={<AlertTriangle size={14} />} sx={{ fontWeight: 'bold' }} />
                      )}
                      <Chip
                        label={apt.status.toUpperCase()}
                        size="small"
                        color={apt.status === 'requested' ? 'warning' : apt.status === 'approved' ? 'success' : 'error'}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <b>Doctor:</b> Dr. {apt.doctorId?.name || 'Unknown'} ({apt.doctorId?.specialization || ''})
                    </Typography>
                    {apt.symptoms && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <b>Symptoms:</b> {apt.symptoms}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <b>Preferred:</b> {apt.preferredDate ? new Date(apt.preferredDate).toLocaleDateString() : 'Not specified'} — {apt.preferredTimeSlot || 'No preference'}
                    </Typography>
                    {apt.patientPhone && (
                      <Typography variant="body2" color="text.secondary">
                        <b>Phone:</b> {apt.patientPhone}
                      </Typography>
                    )}
                    {apt.assignedTimeSlot && (
                      <Typography variant="body2" sx={{ mt: 0.5, color: '#065f46', fontWeight: 600 }}>
                        <b>Assigned:</b> {new Date(apt.date).toLocaleDateString()} at {apt.assignedTimeSlot}
                      </Typography>
                    )}
                    {apt.rejectionReason && (
                      <Typography variant="body2" sx={{ mt: 0.5, color: '#991b1b' }}>
                        <b>Rejection Reason:</b> {apt.rejectionReason}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Requested: {new Date(apt.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  {apt.status === 'requested' && (
                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircle size={16} />}
                        onClick={() => handleAssignOpen(apt)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                      >
                        Assign
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<XCircle size={16} />}
                        onClick={() => setRejectDialog({ open: true, appointment: apt, reason: '' })}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </Box>
              </Paper>
            ))}
          </div>
        )}
      </Paper>

      {/* Detailed User Database */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>My Hospital — Users &amp; Staff</Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Details (Specific)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.users.map((user) => (
                <TableRow key={user._id} hover sx={{ '&:first-of-type': { bgcolor: '#f0f9ff' } }}>
                  <TableCell>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => fetchUserDetails(user._id)}>
                      <Avatar sx={{ bgcolor: user.role === 'doctor' ? 'teal' : user.role === 'driver' ? 'red' : 'orange' }}>
                        {user.name[0]}
                      </Avatar>
                      <div>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ '&:hover': { color: '#3b82f6', textDecoration: 'underline' } }}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.toUpperCase()}
                      size="small"
                      color={user.role === 'doctor' ? 'primary' : user.role === 'driver' ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {/* LOGIC TO SHOW SPECIFIC DATA BASED ON ROLE */}
                    {user.role === 'doctor' && (
                      <div className="text-sm">
                        <span className="font-bold text-gray-600">🏥 {user.hospitalName}</span><br />
                        <span className="text-gray-500">{user.specialization}</span><br />
                        <span className="text-gray-600">Department: {user.department || 'Not assigned'}</span>
                      </div>
                    )}
                    {user.role === 'driver' && (
                      <div className="text-sm">
                        <span className="font-bold text-gray-600">🚑 {user.vehicleNumber}</span><br />
                        <span className="text-gray-500">Lic: {user.licenseNumber}</span>
                      </div>
                    )}
                    {user.role === 'patient' && <span className="text-gray-400 italic">Standard Access</span>}
                    {user.role === 'admin' && <span className="text-purple-600 font-bold">System Administrator</span>}
                  </TableCell>
                  <TableCell>
                    {user.role === 'doctor' && user.approvalStatus === 'pending' && (
                      <Chip label="PENDING APPROVAL" size="small" color="warning" icon={<Clock size={14} />} />
                    )}
                    {user.role === 'doctor' && user.approvalStatus === 'rejected' && (
                      <Chip label="REJECTED" size="small" color="error" />
                    )}
                    {(user.role !== 'doctor' || user.approvalStatus === 'approved') && (
                      <Chip label="ACTIVE" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChat(user);
                      }}
                      sx={{
                        bgcolor: '#eff6ff',
                        '&:hover': { bgcolor: '#dbeafe' }
                      }}
                    >
                      <MessageSquare size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* User Details Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {selectedUser && (
                <Avatar sx={{
                  bgcolor: selectedUser.role === 'doctor' ? '#14b8a6' : selectedUser.role === 'driver' ? '#ef4444' : '#f59e0b',
                  width: 48,
                  height: 48,
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : '?'}
                </Avatar>
              )}
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {selectedUser ? (selectedUser.name || 'Unknown User') : 'User Details'}
                </Typography>
                {selectedUser && selectedUser.email && (
                  <Typography variant="caption" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton onClick={handleCloseModal} size="small" sx={{ '&:hover': { bgcolor: '#fee2e2', color: '#ef4444' } }}>
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : accessRequestStatus ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" variant="h6" gutterBottom>
                Access Restricted
              </Typography>
              <Typography color="text.secondary" paragraph>
                {accessRequestStatus.message}
              </Typography>
              {accessRequestStatus.requestPending === false && (
                <Typography color="text.secondary" paragraph>
                  Click "Request Access" to send a request to the patient for profile access.
                </Typography>
              )}
              {accessRequestStatus.requestPending === true && (
                <Typography color="primary" paragraph>
                  Your access request is pending patient approval.
                </Typography>
              )}
            </Box>
          ) : selectedUser && userDetails ? (
            <Box sx={{ pb: 2 }}>
              {/* Basic Information */}
              <Paper sx={{ p: 3, bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #e5e7eb', mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 20, bgcolor: '#3b82f6', borderRadius: 1 }} />
                  Basic Information
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Full Name</Typography>
                      <Typography variant="body1" fontWeight="600">{selectedUser.name || 'Unknown User'}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Email Address</Typography>
                      <Typography variant="body1" fontWeight="600" sx={{ wordBreak: 'break-all' }}>{selectedUser.email || 'No email provided'}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Role</Typography>
                      <Chip
                        label={(selectedUser.role || 'unknown').toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          bgcolor: selectedUser.role === 'doctor' ? '#d1fae5' : selectedUser.role === 'driver' ? '#fee2e2' : '#fef3c7',
                          color: selectedUser.role === 'doctor' ? '#065f46' : selectedUser.role === 'driver' ? '#991b1b' : '#92400e'
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Member Since</Typography>
                      <Typography variant="body1" fontWeight="600">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Role-Specific Information */}
              {selectedUser.role === 'doctor' && (
                <Paper sx={{ p: 3, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #99f6e4', mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={2.5} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0f766e' }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: '#14b8a6', borderRadius: 1 }} />
                    Doctor Information
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Specialization</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedUser.specialization || 'Not specified'}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Department</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedUser.department || 'Not assigned'}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Hospital</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedUser.hospitalName || 'Not specified'}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Experience</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedUser.experience || 'Not specified'}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {selectedUser.role === 'driver' && (
                <Paper sx={{ p: 3, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca', mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={2.5} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#991b1b' }}>
                    <Box sx={{ width: 4, height: 20, bgcolor: '#ef4444', borderRadius: 1 }} />
                    Driver Information
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Vehicle Number</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedUser.vehicleNumber || 'Not specified'}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>License Number</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedUser.licenseNumber || 'Not specified'}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Appointment Statistics */}
              {(selectedUser.role === 'doctor' || selectedUser.role === 'patient') && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" mb={2.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={20} color="#3b82f6" />
                    Appointment Overview
                  </Typography>
                  <Grid container spacing={2} mb={3}>
                    <Grid size={{ xs: 3 }}>
                      <Paper sx={{ p: 2.5, textAlign: 'center', bgcolor: '#dbeafe', borderRadius: 2, border: '1px solid #93c5fd' }}>
                        <Typography variant="h3" fontWeight="bold" color="#1e40af">
                          {userDetails.stats.totalAppointments}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mt: 0.5, display: 'block' }}>Total</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <Paper sx={{ p: 2.5, textAlign: 'center', bgcolor: '#fef3c7', borderRadius: 2, border: '1px solid #fde68a' }}>
                        <Typography variant="h3" fontWeight="bold" color="#b45309">
                          {userDetails.stats.pendingAppointments}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mt: 0.5, display: 'block' }}>Pending</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <Paper sx={{ p: 2.5, textAlign: 'center', bgcolor: '#d1fae5', borderRadius: 2, border: '1px solid #6ee7b7' }}>
                        <Typography variant="h3" fontWeight="bold" color="#065f46">
                          {userDetails.stats.approvedAppointments}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mt: 0.5, display: 'block' }}>Approved</Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <Paper sx={{ p: 2.5, textAlign: 'center', bgcolor: '#fee2e2', borderRadius: 2, border: '1px solid #fecaca' }}>
                        <Typography variant="h3" fontWeight="bold" color="#991b1b">
                          {userDetails.stats.rejectedAppointments}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mt: 0.5, display: 'block' }}>Rejected</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Recent Appointments */}
                  {userDetails.appointments.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 4, height: 20, bgcolor: '#3b82f6', borderRadius: 1 }} />
                        Recent Appointments
                      </Typography>
                      <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {userDetails.appointments.slice(0, 5).map((apt) => (
                            <Paper key={apt._id} sx={{ p: 2.5, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #e5e7eb', '&:hover': { boxShadow: 1 }, transition: 'all 0.2s' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                                    {selectedUser.role === 'doctor'
                                      ? `${apt.patientId?.name || apt.patientName || 'Unknown Patient'}`
                                      : `Dr. ${apt.doctorId?.name || 'Unknown Doctor'}`}
                                  </Typography>
                                  {selectedUser.role === 'patient' && apt.doctorId && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      {apt.doctorId.specialization} • {apt.doctorId.hospitalName}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Clock size={13} />
                                    {new Date(apt.date).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={apt.status.toUpperCase()}
                                  size="small"
                                  icon={apt.status === 'approved' ? <CheckCircle size={14} /> : apt.status === 'rejected' ? <XCircle size={14} /> : <Clock size={14} />}
                                  sx={{
                                    fontWeight: 'bold',
                                    bgcolor: apt.status === 'approved' ? '#d1fae5' : apt.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                    color: apt.status === 'approved' ? '#065f46' : apt.status === 'rejected' ? '#991b1b' : '#92400e',
                                    '& .MuiChip-icon': {
                                      color: apt.status === 'approved' ? '#10b981' : apt.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                    }
                                  }}
                                />
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No data available
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 4,
              textTransform: 'none',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
          >
            Close
          </Button>

          {/* MESSAGE BUTTON */}
          <Button
            onClick={() => {
              setActiveChat(selectedUser);
              handleCloseModal();
            }}
            variant="outlined"
            color="primary"
            startIcon={<MessageSquare size={18} />}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: '600',
              ml: 2
            }}
          >
            Message
          </Button>



          {/* MESSAGE BUTTON */}
          <Button
            onClick={() => {
              setActiveChat(selectedUser);
              handleCloseModal();
            }}
            variant="outlined"
            color="primary"
            startIcon={<MessageSquare size={18} />}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: '600',
              ml: 2
            }}
          >
            Message
          </Button>

          {(accessRequestStatus && accessRequestStatus.requestPending === false) ||
            (selectedUser && selectedUser.role === 'patient' && !accessRequestStatus) ? (
            <Button
              onClick={() => {
                if (selectedUser && selectedUser._id) {
                  requestAccessToPatient(selectedUser._id);
                } else if (selectedUser && selectedUser.role === 'patient') {
                  // If we only have the basic user info from the table
                  const userId = data?.users.find(u => u._id === selectedUser._id)?._id || selectedUser._id;
                  requestAccessToPatient(userId);
                }
              }}
              variant="contained"
              color="primary"
              sx={{
                borderRadius: 2,
                px: 4,
                textTransform: 'none',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                ml: 2
              }}
            >
              Request Access
            </Button>
          ) : null}


          {/* DISCHARGE BUTTON FOR PATIENTS */}
          {selectedUser && selectedUser.role === 'patient' && (!accessRequestStatus || accessRequestStatus.userId) && (
            <Button
              onClick={() => handleDischargePatient(selectedUser._id)}
              variant="outlined"
              color="error"
              startIcon={<DoorOpen size={18} />}
              sx={{
                borderRadius: 2,
                px: 4,
                textTransform: 'none',
                fontWeight: '600',
                ml: 2
              }}
            >
              Discharge Patient
            </Button>
          )}

        </DialogActions>
      </Dialog>

      {/* ── APPROVE DOCTOR MODAL ── */}
      <Dialog open={approveModalOpen} onClose={() => setApproveModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: '#f0fdf4', borderBottom: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle size={20} color="#10b981" />
          <Typography fontWeight="bold">Approve Doctor Registration</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {approvingDoctor && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#14b8a6', width: 52, height: 52, fontSize: '1.4rem', fontWeight: 'bold' }}>
                  {approvingDoctor.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography fontWeight="bold">{approvingDoctor.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{approvingDoctor.email}</Typography>
                  <br />
                  <Typography variant="body2" sx={{ color: '#0f766e', fontWeight: 600 }}>{approvingDoctor.specialization}</Typography>
                </Box>
              </Box>
              {approvingDoctor.department && (
                <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#fef3c7', borderRadius: 2, border: '1px solid #fde68a' }}>
                  <Typography variant="caption" color="#92400e" fontWeight={600}>Doctor requested:</Typography>
                  <Typography fontWeight={700} color="#b45309">{approvingDoctor.department}</Typography>
                </Box>
              )}
              <FormControl fullWidth size="small">
                <InputLabel>Assign Final Department</InputLabel>
                <Select value={selectedDepartment} label="Assign Final Department" onChange={(e) => setSelectedDepartment(e.target.value)}>
                  {DEPARTMENTS.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb', gap: 1 }}>
          <Button onClick={() => setApproveModalOpen(false)} variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={confirmApproveDoctor} variant="contained" color="success" startIcon={<CheckCircle size={16} />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>
            Approve &amp; Assign
          </Button>
        </DialogActions>
      </Dialog>

      {
        activeChat && (
          <ChatWindow
            currentUser={{ id: JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id, name: 'Admin' }}
            chatPartner={activeChat}
            onClose={() => setActiveChat(null)}
          />
        )
      }

      {/* ── ASSIGN APPOINTMENT DIALOG ── */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, appointment: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: '#f0fdf4', borderBottom: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Calendar size={20} color="#10b981" />
          <Typography fontWeight="bold">Assign Appointment</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {assignDialog.appointment && (
            <Box>
              {/* Patient & Doctor Summary */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Typography variant="body2"><b>Patient:</b> {assignDialog.appointment.patientId?.name}</Typography>
                <Typography variant="body2"><b>Doctor:</b> Dr. {assignDialog.appointment.doctorId?.name} ({assignDialog.appointment.doctorId?.specialization})</Typography>
                {assignDialog.appointment.symptoms && (
                  <Typography variant="body2"><b>Symptoms:</b> {assignDialog.appointment.symptoms}</Typography>
                )}
                {assignDialog.appointment.isEmergency && (
                  <Chip label="EMERGENCY" size="small" color="error" sx={{ mt: 1, fontWeight: 'bold' }} />
                )}
              </Paper>

              {/* Date Picker */}
              <TextField
                label="Appointment Date"
                type="date"
                fullWidth
                size="small"
                value={assignForm.date}
                onChange={(e) => {
                  setAssignForm(prev => ({ ...prev, date: e.target.value }));
                  if (assignDialog.appointment.doctorId?._id) {
                    fetchDoctorSlots(assignDialog.appointment.doctorId._id, e.target.value);
                  }
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ mb: 2, mt: 1 }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />

              {/* Doctor's Existing Appointments for the selected date */}
              {slotsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
              ) : doctorSlots.existingAppointments.length > 0 ? (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a' }}>
                  <Typography variant="caption" fontWeight="bold" color="#92400e">Doctor's existing appointments on this date:</Typography>
                  {doctorSlots.existingAppointments.map((slot, i) => (
                    <Typography key={i} variant="body2" color="text.secondary">
                      • {slot.assignedTimeSlot || new Date(slot.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {slot.patientId?.name || 'Patient'}
                    </Typography>
                  ))}
                </Paper>
              ) : assignForm.date ? (
                <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>No appointments on this date — doctor is free.</Typography>
              ) : null}

              {/* Doctor's available time info */}
              {doctorSlots.doctor && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <b>Doctor's availability:</b> {doctorSlots.doctor.availableDays || 'Not set'} | {doctorSlots.doctor.availableTime || 'Not set'}
                </Typography>
              )}

              {/* Time Slot Input */}
              <TextField
                label="Assigned Time Slot"
                fullWidth
                size="small"
                value={assignForm.timeSlot}
                onChange={(e) => setAssignForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                placeholder="e.g., 10:00 AM - 10:30 AM"
                sx={{ mb: 2 }}
              />

              {/* Admin Notes */}
              <TextField
                label="Admin Notes (optional)"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={assignForm.adminNotes}
                onChange={(e) => setAssignForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                placeholder="Any special instructions..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb', gap: 1 }}>
          <Button onClick={() => setAssignDialog({ open: false, appointment: null })} variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleAssignAppointment} variant="contained" color="success" startIcon={<CheckCircle size={16} />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>
            Confirm & Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── REJECT APPOINTMENT DIALOG ── */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, appointment: null, reason: '' })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 1 }}>
          <XCircle size={20} color="#ef4444" />
          <Typography fontWeight="bold">Reject Appointment</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {rejectDialog.appointment && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Rejecting appointment request from <b>{rejectDialog.appointment.patientId?.name}</b> for <b>Dr. {rejectDialog.appointment.doctorId?.name}</b>.
              </Typography>
              <TextField
                label="Rejection Reason"
                fullWidth
                size="small"
                multiline
                rows={3}
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why this request is being rejected..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb', gap: 1 }}>
          <Button onClick={() => setRejectDialog({ open: false, appointment: null, reason: '' })} variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleRejectAppointment} variant="contained" color="error" startIcon={<XCircle size={16} />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout >
  );
};

export default AdminDashboard;