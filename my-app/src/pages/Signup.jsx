import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Grid, Paper, Typography, TextField, Button, 
  Card, CardContent, Avatar, CardActionArea, Box, IconButton 
} from '@mui/material';
import { User, Stethoscope, Ambulance, Shield, ArrowLeft } from 'lucide-react';

const roleCards = [
  { id: 'patient', label: 'Patient', icon: <User size={32} />, description: 'Find doctors and book appointments.', color: 'bg-blue-100 text-blue-600', avatarBg: 'primary.main' },
  { id: 'doctor', label: 'Doctor', icon: <Stethoscope size={32} />, description: 'Register your clinic/hospital availability.', color: 'bg-teal-100 text-teal-600', avatarBg: 'teal' },
  { id: 'driver', label: 'Ambulance Driver', icon: <Ambulance size={32} />, description: 'Join the emergency response network.', color: 'bg-red-100 text-red-600', avatarBg: 'error.main' },
  { id: 'admin', label: 'Administrator', icon: <Shield size={32} />, description: 'Manage system resources.', color: 'bg-purple-100 text-purple-600', avatarBg: 'secondary.main' }
];

const Signup = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Initial State holds all possible fields
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', 
    hospitalName: '', specialization: '', experience: '', // Doctor
    vehicleNumber: '', licenseNumber: '' // Driver
  });

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // We send EVERYTHING in formData + the role. 
    // The backend will only save the fields defined in the schema.
    const finalData = { ...formData, role: selectedRole };
    
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
      
      if (response.ok) {
        alert("Registration Successful! Please Login.");
        navigate('/login');
      } else {
        const data = await response.json();
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const currentRoleDetails = roleCards.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      
      {/* VIEW 1: SELECTION CARDS */}
      {!selectedRole && (
        <div className="max-w-5xl w-full text-center">
          <Typography variant="h3" fontWeight="bold" mb={1} color="#1e293b">Join MediCare Plus</Typography>
          <Typography variant="h6" color="text.secondary" mb={6}>Select your profile type to register</Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {roleCards.map((role) => (
              <Grid item xs={12} sm={6} md={3} key={role.id}>
                <Card elevation={3} sx={{ borderRadius: 4, height: '100%', '&:hover': { transform: 'translateY(-5px)', transition: '0.3s' } }}>
                  <CardActionArea onClick={() => handleRoleSelect(role.id)} sx={{ height: '100%', p: 3 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Avatar sx={{ bgcolor: role.avatarBg, width: 64, height: 64, mb: 2 }}>{role.icon}</Avatar>
                      <Typography variant="h6" fontWeight="bold">{role.label}</Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>{role.description}</Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography mt={4}>Already have an account? <Link to="/login" className="text-blue-600 font-bold">Log In</Link></Typography>
        </div>
      )}

      {/* VIEW 2: DYNAMIC FORM */}
      {selectedRole && (
        <Paper elevation={6} sx={{ p: 5, borderRadius: 4, maxWidth: 500, width: '100%', position: 'relative' }}>
          <IconButton onClick={() => setSelectedRole(null)} sx={{ position: 'absolute', top: 10, left: 10 }}>
            <ArrowLeft />
          </IconButton>

          <Box textAlign="center" mb={4}>
            <Avatar sx={{ bgcolor: currentRoleDetails.avatarBg, width: 56, height: 56, mx: 'auto', mb: 2 }}>{currentRoleDetails.icon}</Avatar>
            <Typography variant="h5" fontWeight="bold">Sign up as {currentRoleDetails.label}</Typography>
            <Typography variant="body2" color="text.secondary">Please fill in your professional details</Typography>
          </Box>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* COMMON FIELDS */}
            <TextField fullWidth label="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <TextField fullWidth label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <TextField fullWidth label="Password" type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />

            {/* DOCTOR SPECIFIC FIELDS */}
            {selectedRole === 'doctor' && (
              <>
                <TextField fullWidth label="Hospital / Clinic Name" required color="secondary"
                  value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} />
                <TextField fullWidth label="Specialization (e.g., Cardiologist)" required color="secondary"
                  value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
                <TextField fullWidth label="Years of Experience" type="number" required color="secondary"
                  value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
              </>
            )}

            {/* DRIVER SPECIFIC FIELDS */}
            {selectedRole === 'driver' && (
              <>
                <TextField fullWidth label="Vehicle Number (Plate ID)" required color="error"
                  value={formData.vehicleNumber} onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})} />
                <TextField fullWidth label="Driving License Number" required color="error"
                  value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} />
              </>
            )}

            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 2, bgcolor: currentRoleDetails.avatarBg, fontWeight: 'bold' }}>
              Complete Registration
            </Button>
          </form>
        </Paper>
      )}
    </div>
  );
};

export default Signup;