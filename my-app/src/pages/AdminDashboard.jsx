import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  Grid, Paper, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Avatar, CircularProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, Box, Tooltip
} from '@mui/material';
import { RefreshCw, X, Calendar, CheckCircle, XCircle, Clock, DoorOpen, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';
import NotificationBell from '../components/NotificationBell';
import ChatWindow from '../components/ChatWindow';

const socket = io('http://localhost:5000'); // Connect to WebSocket Server

const AdminDashboard = () => {
  const [data, setData] = useState({ stats: { doctorCount: 0, patientCount: 0, driverCount: 0 }, users: [] });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [accessRequestStatus, setAccessRequestStatus] = useState(null); // New state for access request status
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/dashboard-data', {
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
      const res = await fetch(`http://localhost:5000/api/admin/user/${userId}`, {
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
      const res = await fetch(`http://localhost:5000/api/access-requests/request-access/${patientId}`, {
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
      const res = await fetch('http://localhost:5000/api/admin/pending-doctors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) setPendingDoctors(result);
    } catch (err) {
      console.error("Error fetching pending doctors", err);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    const token = localStorage.getItem('token');

    // Prompt admin to select department for the doctor
    const departments = [
      'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology',
      'Radiology', 'Emergency Medicine', 'Internal Medicine', 'Surgery',
      'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT', 'Psychiatry'
    ];

    const departmentList = departments.join('\n');
    const departmentInput = prompt(`Assign department for the doctor:

${departmentList}

Enter department name:`);

    if (departmentInput === null) return; // User cancelled

    try {
      const res = await fetch(`http://localhost:5000/api/admin/approve-doctor/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ department: departmentInput || 'General' })
      });
      if (res.ok) {
        alert('Doctor approved and assigned to department successfully!');
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
      const res = await fetch(`http://localhost:5000/api/admin/reject-doctor/${doctorId}`, {
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
      const res = await fetch(`http://localhost:5000/api/admin/discharge-patient/${patientId}`, {
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

  useEffect(() => {
    fetchData();
    fetchPendingDoctors();

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
          // Show notification (simple alert for now, or update state to show generic notification)
          alert(`New Appointment: ${data.appointment.patientId?.name || 'Patient'} has booked an appointment.`);
          // Refresh data
          fetchData();
        }
      }
    });

    return () => {
      socket.off('new_user');
      socket.off('admin_notification');
    };
  }, []);

  if (loading) return <div className="flex justify-center mt-20"><CircularProgress /></div>;

  return (
    <DashboardLayout title="System Overview" userRole="admin">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <NotificationBell userId={JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id} />
      </Box>
      <div className="flex justify-between items-center mb-6">
        <Typography variant="body2" color="text.secondary">Live Real-time Data Feed</Typography>
        <IconButton onClick={fetchData} title="Force Refresh"><RefreshCw size={18} /></IconButton>
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
                    onClick={() => handleApproveDoctor(doctor._id)}
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, bgcolor: '#3b82f6', color: 'white', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Registered Doctors</Typography>
            <Typography variant="h3" fontWeight="bold">{data?.stats.doctorCount || 0}</Typography>
            <div className="absolute -right-4 -bottom-4 opacity-20 text-white"><Avatar sx={{ width: 80, height: 80 }} /></div>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, bgcolor: '#10b981', color: 'white', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Patients</Typography>
            <Typography variant="h3" fontWeight="bold">{data?.stats.patientCount || 0}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, bgcolor: '#f43f5e', color: 'white', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Ambulance Drivers</Typography>
            <Typography variant="h3" fontWeight="bold">{data?.stats.driverCount || 0}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed User Database */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Master User Database (Live)</Typography>
        <Table>
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

      {
        activeChat && (
          <ChatWindow
            currentUser={{ id: JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id, name: 'Admin' }}
            chatPartner={activeChat}
            onClose={() => setActiveChat(null)}
          />
        )
      }
    </DashboardLayout >
  );
};

export default AdminDashboard;