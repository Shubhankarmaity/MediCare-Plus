import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  Paper, Grid, Avatar, Typography, TextField, Button, Divider, Box, Chip, Card, CardContent, CircularProgress
} from '@mui/material';
import { Save, Camera, Mail, Phone, MapPin, Calendar, Briefcase, Award, Stethoscope, Truck } from 'lucide-react';

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

      console.log('Fetching profile with token:', token ? 'Token exists' : 'No token');
      console.log('Stored user in localStorage:', JSON.parse(storedUserData || '{}'));

      const res = await fetch('http://localhost:5000/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      console.log('Profile API response status:', res.status);
      console.log('Profile API response data:', data);

      if (res.ok) {
        console.log('Setting user data:', data.user);
        setUserData(data.user);
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        console.error('Error response:', data);
        // Fallback to stored user
        setUserData(JSON.parse(storedUserData || '{}'));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Fallback to stored user
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
      const res = await fetch('http://localhost:5000/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (res.ok) {
        // Update local storage with new data
        const updatedUser = { ...storedUser, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        alert("Profile Updated Successfully!");
        setEditMode(false);
        fetchUserData(); // Refresh data
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

  const getRoleColor = () => {
    if (!userData) return 'bg-blue-600';
    switch (userData.role) {
      case 'doctor': return 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)';
      case 'driver': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'admin': return 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
      default: return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
  };

  const getRoleIcon = () => {
    if (!userData) return <Briefcase size={20} />;
    switch (userData.role) {
      case 'doctor': return <Stethoscope size={20} />;
      case 'driver': return <Truck size={20} />;
      default: return <Briefcase size={20} />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile" userRole={userData?.role}>
        <div className="flex justify-center mt-20">
          <CircularProgress />
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout title="My Profile" userRole={storedUser.role}>
        <Typography color="error">Failed to load user data</Typography>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile" userRole={userData.role}>
      <Grid container spacing={4}>

        {/* Left Column: Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            <Box sx={{ height: 140, background: getRoleColor(), position: 'relative' }}>
              <div className="absolute inset-0 bg-black opacity-10"></div>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -8, px: 3, pb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 130,
                    height: 130,
                    border: '5px solid white',
                    fontSize: '3.5rem',
                    bgcolor: '#e5e7eb',
                    color: '#6b7280',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {userData.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    bgcolor: 'white',
                    p: 1.5,
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f3f4f6' },
                    transition: 'all 0.2s'
                  }}
                >
                  <Camera size={18} color="#6b7280" />
                </Box>
              </Box>

              <Typography variant="h5" fontWeight="bold" sx={{ mt: 2, color: '#1f2937' }}>
                {userData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Mail size={14} />
                {userData.email}
              </Typography>

              <Chip
                icon={getRoleIcon()}
                label={userData.role.toUpperCase()}
                sx={{
                  mt: 2,
                  fontWeight: 'bold',
                  color: 'white',
                  background: getRoleColor(),
                  px: 2,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px'
                }}
              />

              <Divider sx={{ width: '100%', my: 3 }} />

              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, px: 2, bgcolor: '#f9fafb', borderRadius: 2, mb: 1.5 }}>
                  <Box sx={{ p: 1, bgcolor: '#dbeafe', borderRadius: 1.5 }}>
                    <Calendar size={18} color="#3b82f6" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Joined</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, px: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                  <Box sx={{ p: 1, bgcolor: '#d1fae5', borderRadius: 1.5 }}>
                    <Award size={18} color="#10b981" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Status</Typography>
                    <Typography variant="body2" fontWeight="600" color="#10b981">Active</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Role-Specific Quick Info Card */}
          {(userData.role === 'doctor' || userData.role === 'driver') && (
            <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                  Professional Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {userData.role === 'doctor' && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">Specialization</Typography>
                      <Typography variant="body2" fontWeight="600">{userData.specialization || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Hospital</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {userData.hospitalId?.name || userData.hospitalName || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">Department</Typography>
                      <Typography variant="body2" fontWeight="600">{userData.department || 'N/A'}</Typography>
                    </Box>
                  </>
                )}
                {userData.role === 'driver' && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">Vehicle Number</Typography>
                      <Typography variant="body2" fontWeight="600">{userData.vehicleNumber || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">License</Typography>
                      <Typography variant="body2" fontWeight="600">{userData.licenseNumber || 'N/A'}</Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column: Information & Edit Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" color="#1f2937">
                  Account Information
                </Typography>
                <Button
                  variant={editMode ? 'outlined' : 'contained'}
                  onClick={() => setEditMode(!editMode)}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: '600' }}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>
              <Divider sx={{ mb: 4 }} />

              <form onSubmit={handleSave}>
                <Grid container spacing={3}>
                  {/* Basic Information Section */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Briefcase size={18} />
                      Basic Information
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      variant="outlined"
                      value={userData.name || ''}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      disabled={!editMode}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      variant="outlined"
                      disabled
                      value={userData.email || ''}
                      helperText="Email cannot be changed"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  {/* Role Specific Fields */}
                  {userData.role === 'doctor' && (
                    <>
                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Stethoscope size={18} />
                          Professional Details
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Specialization"
                          variant="outlined"
                          value={userData.specialization || ''}
                          onChange={(e) => setUserData({ ...userData, specialization: e.target.value })}
                          disabled={!editMode}
                          InputProps={{
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Hospital Name"
                          variant="outlined"
                          value={userData.hospitalName || ''}
                          onChange={(e) => setUserData({ ...userData, hospitalName: e.target.value })}
                          disabled={!editMode}
                          InputProps={{
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Experience"
                          variant="outlined"
                          value={userData.experience || ''}
                          onChange={(e) => setUserData({ ...userData, experience: e.target.value })}
                          disabled={!editMode}
                          placeholder="e.g., 5 years in Cardiology"
                          InputProps={{
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  {userData.role === 'driver' && (
                    <>
                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Truck size={18} />
                          Driver Details
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Vehicle Number"
                          variant="outlined"
                          value={userData.vehicleNumber || ''}
                          onChange={(e) => setUserData({ ...userData, vehicleNumber: e.target.value })}
                          disabled={!editMode}
                          InputProps={{
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="License Number"
                          variant="outlined"
                          value={userData.licenseNumber || ''}
                          onChange={(e) => setUserData({ ...userData, licenseNumber: e.target.value })}
                          disabled={!editMode}
                          InputProps={{
                            sx: { borderRadius: 2 }
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  {editMode && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={saving}
                          startIcon={saving ? <CircularProgress size={18} /> : <Save size={18} />}
                          sx={{
                            borderRadius: 2,
                            px: 4,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => {
                            setEditMode(false);
                            fetchUserData();
                          }}
                          sx={{ borderRadius: 2, px: 4, textTransform: 'none' }}
                        >
                          Discard
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </Box>
          </Paper>

          {/* Additional Info Card */}
          <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Account Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">User ID</Typography>
                    <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                      {userData._id}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Account Type</Typography>
                    <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5, textTransform: 'capitalize' }}>
                      {userData.role}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Last Updated</Typography>
                    <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                      {userData.updatedAt || userData.createdAt ? new Date(userData.updatedAt || userData.createdAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Patient-Specific Medical Information Card */}
          {userData.role === 'patient' && (
            <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Medical Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  {userData.phone && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Phone Number</Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                          {userData.phone}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {userData.age && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Age</Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                          {userData.age}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {userData.gender && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Gender</Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                          {userData.gender}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {userData.bloodGroup && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Blood Group</Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                          {userData.bloodGroup}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {userData.address && (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Address</Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                          {userData.address}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {userData.emergencyContact && (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Emergency Contact</Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                          {userData.emergencyContact}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {userData.medicalHistory && (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Medical History</Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                          {userData.medicalHistory}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {userData.hospitalId && (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Registered Hospital</Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ mt: 0.5 }}>
                          {userData.hospitalId.name || 'Unknown Hospital'}
                          {userData.hospitalId.city && ` (${userData.hospitalId.city})`}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </DashboardLayout >
  );
};

export default Profile;