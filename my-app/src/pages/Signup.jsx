import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Grid, Paper, Typography, TextField, Button,
  Card, CardContent, Avatar, CardActionArea, Box, IconButton,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { User, Stethoscope, Ambulance, Shield, ArrowLeft } from 'lucide-react';

import CssBaseline from '@mui/material/CssBaseline';

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
    // Common fields
    name: '', email: '', password: '',

    // Patient fields
    phone: '', age: '', gender: '', bloodGroup: '', address: '',
    emergencyContact: '', medicalHistory: '',

    // Doctor fields
    specialization: '', experience: '', qualification: '',
    consultationFee: '', availableDays: '', availableTime: '',
    doctorPhone: '', licenseNumber: '',

    // Driver fields
    vehicleNumber: '', driverLicenseNumber: '', vehicleType: '', driverPhone: '',


    // Admin field
    hospitalId: '',
    department: '' // Added for patients/doctors
  });

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  // Fetch hospitals for admin selection
  // Fetch hospitals for admin and doctor selection
  const [hospitals, setHospitals] = useState([]);
  React.useEffect(() => {
    // Determine if we need to fetch hospitals
    const needsHospitalList = ['admin', 'doctor', 'patient'].includes(selectedRole);

    if (needsHospitalList) {
      fetch('http://localhost:5000/api/hospitals')
        .then(res => res.json())
        .then(data => setHospitals(data))
        .catch(err => console.error("Error fetching hospitals:", err));
    }
  }, [selectedRole]);

  // Derive departments based on selected hospital
  const availableDepartments = React.useMemo(() => {
    if (!formData.hospitalId) return [];
    const hospital = hospitals.find(h => h._id === formData.hospitalId);
    return hospital ? hospital.facilities : [];
  }, [formData.hospitalId, hospitals]);

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
        const data = await response.json();
        if (data.requiresApproval) {
          alert(data.message); // Doctor pending approval message
        } else {
          alert("Registration Successful! Please Login.");
        }
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
      <CssBaseline />

      {/* VIEW 1: SELECTION CARDS */}
      {!selectedRole && (
        <div className="max-w-5xl w-full text-center">
          <Typography variant="h3" fontWeight="bold" mb={1} color="#1e293b">Join MediCare Plus</Typography>
          <Typography variant="h6" color="text.secondary" mb={6}>Select your profile type to register</Typography>

          <Grid container spacing={3} justifyContent="center">
            {roleCards.map((role) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={role.id}>
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
        <Paper elevation={6} sx={{ p: 5, borderRadius: 4, maxWidth: 600, width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
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
            <TextField fullWidth label="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField fullWidth label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <TextField fullWidth label="Password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

            {/* PATIENT SPECIFIC FIELDS */}
            {selectedRole === 'patient' && (
              <>
                <TextField fullWidth label="Phone Number" required
                  value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

                <TextField fullWidth label="Age" type="number" required
                  value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />

                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} label="Gender">
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Blood Group</InputLabel>
                  <Select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} label="Blood Group">
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A-">A-</MenuItem>
                    <MenuItem value="B+">B+</MenuItem>
                    <MenuItem value="B-">B-</MenuItem>
                    <MenuItem value="AB+">AB+</MenuItem>
                    <MenuItem value="AB-">AB-</MenuItem>
                    <MenuItem value="O+">O+</MenuItem>
                    <MenuItem value="O-">O-</MenuItem>
                  </Select>
                </FormControl>

                <TextField fullWidth label="Address" required multiline rows={2}
                  value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />

                <TextField fullWidth label="Emergency Contact Number" required
                  value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />

                <TextField fullWidth label="Medical History (Allergies, Conditions, etc.)" multiline rows={3}
                  value={formData.medicalHistory} onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="E.g., Diabetes, Hypertension, Allergic to Penicillin" />

                <FormControl fullWidth required sx={{ mt: 2 }}>
                  <InputLabel>Select Hospital to Admit</InputLabel>
                  <Select
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value, department: '' })}
                    label="Select Hospital to Admit"
                  >
                    {hospitals.map((hospital) => (
                      <MenuItem key={hospital._id} value={hospital._id}>
                        {hospital.name} ({hospital.city})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required sx={{ mt: 2 }} disabled={!formData.hospitalId}>
                  <InputLabel>Select Department</InputLabel>
                  <Select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    label="Select Department"
                  >
                    {availableDepartments.map((dept, index) => (
                      <MenuItem key={index} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* DOCTOR SPECIFIC FIELDS */}
            {selectedRole === 'doctor' && (
              <>
                <TextField fullWidth label="Medical License Number" required color="secondary"
                  value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} />

                <TextField fullWidth label="Qualification (e.g., MBBS, MD)" required color="secondary"
                  value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} />

                <TextField fullWidth label="Specialization (e.g., Cardiologist)" required color="secondary"
                  value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />

                <FormControl fullWidth required>
                  <InputLabel>Hospital / Clinic Name</InputLabel>
                  <Select
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                    label="Hospital / Clinic Name"
                  >
                    {hospitals.map((hospital) => (
                      <MenuItem key={hospital._id} value={hospital._id}>
                        {hospital.name} ({hospital.city})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField fullWidth label="Years of Experience" type="number" required color="secondary"
                  value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />

                <TextField fullWidth label="Consultation Fee (₹)" type="number" required color="secondary"
                  value={formData.consultationFee} onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })} />

                <TextField fullWidth label="Available Days (e.g., Mon-Fri)" required color="secondary"
                  value={formData.availableDays} onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })} />

                <TextField fullWidth label="Available Time (e.g., 9AM-5PM)" required color="secondary"
                  value={formData.availableTime} onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })} />

                <TextField fullWidth label="Contact Phone" required color="secondary"
                  value={formData.doctorPhone} onChange={(e) => setFormData({ ...formData, doctorPhone: e.target.value })} />
              </>
            )}

            {/* DRIVER SPECIFIC FIELDS */}
            {selectedRole === 'driver' && (
              <>
                <TextField fullWidth label="Driving License Number" required color="error"
                  value={formData.driverLicenseNumber} onChange={(e) => setFormData({ ...formData, driverLicenseNumber: e.target.value })} />

                <TextField fullWidth label="Vehicle Number (Plate ID)" required color="error"
                  value={formData.vehicleNumber} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} />

                <TextField fullWidth label="Vehicle Type (e.g., Basic Ambulance, ICU Ambulance)" required color="error"
                  value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} />

                <TextField fullWidth label="Contact Phone" required color="error"
                  value={formData.driverPhone} onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })} />
              </>
            )}

            {/* ADMIN SPECIFIC FIELDS */}
            {selectedRole === 'admin' && (
              <FormControl fullWidth required>
                <InputLabel>Select Hospital to Manage</InputLabel>
                <Select
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                  label="Select Hospital to Manage"
                >
                  {hospitals.map((hospital) => (
                    <MenuItem key={hospital._id} value={hospital._id}>
                      {hospital.name} ({hospital.city}) {hospital.adminId ? '(Admin Assigned)' : '(Available)'}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Note: You can only register for hospitals that do not already have an administrator.
                </Typography>
              </FormControl>
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