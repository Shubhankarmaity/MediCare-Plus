import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Paper, Grid, Avatar, Typography, TextField, Button, Divider, Box, Chip 
} from '@mui/material';
import { Save, Camera } from 'lucide-react';

const Profile = () => {
  // 1. Get User Data from Local Storage
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // 2. State for Form Fields
  const [userData, setUserData] = useState({
    name: storedUser.name || '',
    email: storedUser.email || '',
    role: storedUser.role || 'patient',
    phone: '555-0123', // Mock data
    address: '123 Health St, Wellness City', // Mock data
    specialization: 'Cardiology', // Mock for Doctor
    license: 'DL-987654321', // Mock for Driver
  });

  const handleSave = (e) => {
    e.preventDefault();
    // Here you would send a PUT request to your backend
    alert("Profile Updated Successfully! (Mock)");
    
    // Update local storage to reflect changes immediately
    const updatedUser = { ...storedUser, name: userData.name, email: userData.email };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Helper to determine header color based on role
  const getRoleColor = () => {
    switch (userData.role) {
      case 'doctor': return 'bg-teal-600';
      case 'driver': return 'bg-red-600';
      case 'admin': return 'bg-purple-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <DashboardLayout title="My Profile" userRole={userData.role}>
      <Grid container spacing={4} justifyContent="center">
        
        {/* Left Column: Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <div className={`h-32 ${getRoleColor()} relative`}></div>
            <div className="flex flex-col items-center -mt-16 px-6 pb-6">
              <div className="relative">
                <Avatar 
                  sx={{ width: 120, height: 120, border: '4px solid white', fontSize: '3rem', bgcolor: 'grey.300' }}
                  src="https://i.pravatar.cc/300" // Placeholder image
                />
                <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600">
                  <Camera size={18}/>
                </button>
              </div>
              
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
                {userData.name}
              </Typography>
              <Chip 
                label={userData.role.toUpperCase()} 
                size="small" 
                sx={{ mt: 1, fontWeight: 'bold', color: 'white', bgcolor: 'text.secondary' }} 
              />
              
              <div className="w-full mt-6 space-y-3">
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-600 font-bold">Active</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-medium">Nov 2025</span>
                </div>
              </div>
            </div>
          </Paper>
        </Grid>

        {/* Right Column: Edit Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Account Settings
            </Typography>
            <Divider sx={{ mb: 4 }} />

            <form onSubmit={handleSave}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Full Name" variant="outlined"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Email Address" variant="outlined" disabled
                    value={userData.email}
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Phone Number" variant="outlined"
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Address" variant="outlined"
                    value={userData.address}
                    onChange={(e) => setUserData({...userData, address: e.target.value})}
                  />
                </Grid>

                {/* Role Specific Fields */}
                {userData.role === 'doctor' && (
                   <Grid item xs={12}>
                     <TextField
                       fullWidth label="Specialization" variant="outlined"
                       value={userData.specialization}
                       onChange={(e) => setUserData({...userData, specialization: e.target.value})}
                     />
                   </Grid>
                )}
                
                {userData.role === 'driver' && (
                   <Grid item xs={12}>
                     <TextField
                       fullWidth label="Driving License ID" variant="outlined"
                       value={userData.license}
                       onChange={(e) => setUserData({...userData, license: e.target.value})}
                     />
                   </Grid>
                )}

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    startIcon={<Save size={18} />}
                    sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

      </Grid>
    </DashboardLayout>
  );
};

export default Profile;