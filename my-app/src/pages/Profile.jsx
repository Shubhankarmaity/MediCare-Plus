import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { API_URL } from '../config';
import {
  Paper, Grid, Avatar, Typography, TextField, Button, Divider, Box, Chip, CircularProgress, MenuItem, Container
} from '@mui/material';
import {
  Save, Camera, Mail, Phone, Calendar, Award, Stethoscope, Truck,
  User, Shield, Edit2, X, Activity, HeartPulse, MapPin
} from 'lucide-react';

const Profile = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Fetch user data from database
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const storedUserData = localStorage.getItem('user');

      const res = await fetch(`${API_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setUserData(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setUserData(JSON.parse(storedUserData || '{}'));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      const storedUserData = localStorage.getItem('user');
      setUserData(JSON.parse(storedUserData || '{}'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (res.ok) {
        const updatedUser = { ...storedUser, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert("Profile Updated Successfully!");
        setEditMode(false);
        fetchUserData();
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getRoleTheme = () => {
    if (!userData) return { gradient: 'from-blue-600 to-indigo-700', color: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-200' };
    switch (userData.role) {
      case 'doctor': return { gradient: 'from-teal-500 to-emerald-600', color: '#14b8a6', bg: 'bg-teal-50', border: 'border-teal-200' };
      case 'driver': return { gradient: 'from-red-500 to-rose-600', color: '#ef4444', bg: 'bg-red-50', border: 'border-red-200' };
      case 'admin': return { gradient: 'from-purple-500 to-violet-600', color: '#8b5cf6', bg: 'bg-purple-50', border: 'border-purple-200' };
      default: return { gradient: 'from-blue-500 to-indigo-600', color: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-200' };
    }
  };

  const getRoleIcon = () => {
    if (!userData) return <User size={18} />;
    switch (userData.role) {
      case 'doctor': return <Stethoscope size={18} />;
      case 'driver': return <Truck size={18} />;
      case 'admin': return <Shield size={18} />;
      default: return <User size={18} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile" userRole={userData?.role}>
        <div className="flex justify-center items-center h-[60vh]">
          <CircularProgress size={60} thickness={4} />
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout title="My Profile" userRole={storedUser.role}>
        <div className="text-center mt-20">
          <Typography variant="h5" color="error" fontWeight="bold">Failed to load user data</Typography>
          <Button variant="outlined" onClick={() => window.location.reload()} sx={{ mt: 2 }}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  const theme = getRoleTheme();

  return (
    <DashboardLayout title="My Profile" userRole={userData.role}>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <form onSubmit={handleSave}>
            <Grid container spacing={3} alignItems="flex-start">

              {/* LEFT COLUMN: Identity & Role Details */}
              <Grid item xs={12} md={4} lg={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                  {/* CARD 1: Profile Summary */}
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div className={`h-24 bg-gradient-to-r ${theme.gradient}`}></div>
                    <div className="px-6 flex flex-col items-center -mt-12 text-center pb-6">
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: '50%',
                          padding: '4px',
                          bgcolor: 'white',
                          boxShadow: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 100,
                            height: 100,
                            bgcolor: theme.color,
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            border: '2px solid white'
                          }}
                          src={userData.avatar}
                        >
                          {userData.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      </Box>

                      <Typography variant="h6" fontWeight="700" sx={{ mt: 1.5, color: '#1e293b' }}>
                        {userData.name}
                      </Typography>

                      <Chip
                        icon={getRoleIcon()}
                        label={userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1)}
                        size="small"
                        sx={{
                          mt: 1,
                          fontWeight: 600,
                          bgcolor: theme.bg,
                          color: theme.color,
                          border: `1px solid transparent`,
                          '& .MuiChip-icon': { color: 'inherit' }
                        }}
                      />

                      <div className="w-full mt-6 space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <Typography variant="caption" color="text.secondary" fontWeight="600">Joined</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </Paper>

                  {/* CARD 2: Role Specific Details (Inputs) */}
                  {(userData.role === 'doctor' || userData.role === 'driver' || userData.role === 'patient') && (
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        p: 3
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, color: theme.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {userData.role === 'doctor' ? 'Professional Details' : userData.role === 'driver' ? 'Vehicle Info' : 'Medical Profile'}
                      </Typography>

                      <Grid container spacing={2}>
                        {userData.role === 'doctor' && (
                          <>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Specialization"
                                value={userData.specialization || ''}
                                onChange={(e) => setUserData({ ...userData, specialization: e.target.value })}
                                disabled={!editMode}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Department"
                                value={userData.department || ''}
                                onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                                disabled={!editMode}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Hospital Name"
                                value={userData.hospitalName || ''}
                                onChange={(e) => setUserData({ ...userData, hospitalName: e.target.value })}
                                disabled={!editMode}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Experience"
                                value={userData.experience || ''}
                                onChange={(e) => setUserData({ ...userData, experience: e.target.value })}
                                disabled={!editMode}
                                size="small"
                                placeholder="e.g. 5 Years"
                              />
                            </Grid>
                          </>
                        )}

                        {userData.role === 'driver' && (
                          <>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Vehicle Number"
                                value={userData.vehicleNumber || ''}
                                onChange={(e) => setUserData({ ...userData, vehicleNumber: e.target.value })}
                                disabled={!editMode}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="License Number"
                                value={userData.licenseNumber || ''}
                                onChange={(e) => setUserData({ ...userData, licenseNumber: e.target.value })}
                                disabled={!editMode}
                                size="small"
                              />
                            </Grid>
                          </>
                        )}

                        {userData.role === 'patient' && (
                          <>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="Age"
                                type="number"
                                value={userData.age || ''}
                                onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                                disabled={!editMode}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="Gender"
                                select
                                value={userData.gender || ''}
                                onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                                disabled={!editMode}
                                size="small"
                              >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                              </TextField>
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Blood Group"
                                value={userData.bloodGroup || ''}
                                onChange={(e) => setUserData({ ...userData, bloodGroup: e.target.value })}
                                disabled={!editMode}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Medical History"
                                multiline
                                rows={3}
                                value={userData.medicalHistory || ''}
                                onChange={(e) => setUserData({ ...userData, medicalHistory: e.target.value })}
                                disabled={!editMode}
                                size="small"
                                placeholder="Allergies, conditions..."
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Paper>
                  )}
                </Box>
              </Grid>

              {/* RIGHT COLUMN: General Details & Settings */}
              <Grid item xs={12} md={8} lg={8}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    p: { xs: 3, md: 4 },
                    bgcolor: '#fff',
                    border: '1px solid #e2e8f0',
                    height: '100%' // Match height logic if possible, but auto is fine
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <Typography variant="h6" fontWeight="700" color="text.primary">General Information</Typography>
                      <Typography variant="body2" color="text.secondary">Manage your account details and contact info.</Typography>
                    </div>
                    <Button
                      variant={editMode ? 'outlined' : 'contained'}
                      color="primary"
                      onClick={() => {
                        if (editMode) fetchUserData(); // Reset
                        setEditMode(!editMode);
                      }}
                      startIcon={editMode ? <X size={16} /> : <Edit2 size={16} />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        fontWeight: 600,
                        boxShadow: editMode ? 0 : 2,
                        bgcolor: editMode ? 'transparent' : theme.color,
                        borderColor: editMode ? '#cbd5e1' : 'transparent',
                        color: editMode ? '#64748b' : '#fff',
                        '&:hover': {
                          bgcolor: editMode ? '#f1f5f9' : theme.color,
                          borderColor: editMode ? '#94a3b8' : 'transparent',
                          opacity: editMode ? 1 : 0.9
                        }
                      }}
                    >
                      {editMode ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>

                  <Grid container spacing={3}>
                    {/* Personal Info */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ color: theme.color, letterSpacing: '0.05em' }}>
                        PERSONAL DETAILS
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={userData.name || ''}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={userData.email || ''}
                        disabled
                        size="small"
                        helperText="Email cannot be changed."
                      />
                    </Grid>

                    {/* Contact Info */}
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ color: theme.color, letterSpacing: '0.05em' }}>
                        CONTACT INFORMATION
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={userData.phone || ''}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Emergency Contact"
                        value={userData.emergencyContact || ''}
                        onChange={(e) => setUserData({ ...userData, emergencyContact: e.target.value })}
                        disabled={!editMode}
                        size="small"
                      />
                    </Grid>

                    {userData.role === 'patient' && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Home Address"
                          value={userData.address || ''}
                          onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                          disabled={!editMode}
                          size="small"
                          multiline
                          rows={3}
                        />
                      </Grid>
                    )}

                    {/* Save Button */}
                    {editMode && (
                      <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditMode(false);
                            fetchUserData();
                          }}
                          sx={{ textTransform: 'none', px: 3, borderRadius: 2 }}
                        >
                          Discard Changes
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={saving}
                          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />}
                          sx={{
                            textTransform: 'none',
                            px: 4,
                            borderRadius: 2,
                            fontWeight: 600,
                            bgcolor: theme.color,
                            '&:hover': { bgcolor: theme.color, opacity: 0.9 }
                          }}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </form>
        </motion.div>
      </Container>
    </DashboardLayout>
  );
};

export default Profile;