import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Grid, TextField, Button, Box,
    CircularProgress, Alert, MenuItem, Avatar, Divider
} from '@mui/material';
import { User, Save, Phone, MapPin, AlertCircle, FileText, Heart } from 'lucide-react';
import { API_URL } from '../config';

const PatientSettings = () => {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        age: '',
        gender: '',
        bloodGroup: '',
        address: '',
        emergencyContact: '',
        medicalHistory: '',
        allergies: ''
    });
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.user) {
                setFormData({
                    name: data.user.name || '',
                    phone: data.user.phone || '',
                    age: data.user.age || '',
                    gender: data.user.gender || '',
                    bloodGroup: data.user.bloodGroup || '',
                    address: data.user.address || '',
                    emergencyContact: data.user.emergencyContact || '',
                    medicalHistory: data.user.medicalHistory || '',
                    allergies: data.user.allergies || ''
                });
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setNotification({ open: false, message: '', type: 'success' });

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setNotification({ open: true, message: 'Profile updated successfully!', type: 'success' });
                // Update local storage user name if changed
                const user = JSON.parse(localStorage.getItem('user'));
                if (user && formData.name) {
                    user.name = formData.name;
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } else {
                setNotification({ open: true, message: data.message || 'Update failed.', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setNotification({ open: true, message: 'Error updating profile.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><CircularProgress /></div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                    <User className="text-blue-600" size={32} />
                </div>
                <div>
                    <Typography variant="h5" fontWeight="bold">Profile Settings</Typography>
                    <Typography color="text.secondary">Manage your personal information and medical history</Typography>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                    {/* Personal Information */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3, height: '100%' }}>
                            <Typography variant="h6" fontWeight="bold" mb={3} className="flex items-center gap-2">
                                <User size={20} className="text-gray-500" /> Personal Details
                            </Typography>

                            <Box className="space-y-4">
                                <TextField
                                    fullWidth label="Full Name" name="name"
                                    value={formData.name} onChange={handleChange} required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <TextField
                                        fullWidth label="Age" name="age" type="number"
                                        value={formData.age} onChange={handleChange}
                                    />
                                    <TextField
                                        fullWidth select label="Gender" name="gender"
                                        value={formData.gender} onChange={handleChange}
                                    >
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </TextField>
                                </div>
                                <TextField
                                    fullWidth label="Phone Number" name="phone"
                                    value={formData.phone} onChange={handleChange}
                                    InputProps={{ startAdornment: <Phone size={18} className="text-gray-400 mr-2" /> }}
                                />
                                <TextField
                                    fullWidth label="Address" name="address" multiline rows={2}
                                    value={formData.address} onChange={handleChange}
                                    InputProps={{ startAdornment: <MapPin size={18} className="text-gray-400 mr-2 mt-1" /> }}
                                />
                                <TextField
                                    fullWidth select label="Blood Group" name="bloodGroup"
                                    value={formData.bloodGroup} onChange={handleChange}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Medical Information */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3, height: '100%' }}>
                            <Typography variant="h6" fontWeight="bold" mb={3} className="flex items-center gap-2">
                                <Heart size={20} className="text-red-500" /> Medical Profile
                            </Typography>

                            <Box className="space-y-4">
                                <TextField
                                    fullWidth label="Emergency Contact (Name & Phone)" name="emergencyContact"
                                    value={formData.emergencyContact} onChange={handleChange}
                                    helperText="In case of emergency, who should we call?"
                                />

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">Existing Conditions</Typography>
                                <TextField
                                    fullWidth label="Medical History" name="medicalHistory" multiline rows={3}
                                    value={formData.medicalHistory} onChange={handleChange}
                                    placeholder="e.g., Diabetes, Hypertension, Asthma..."
                                    InputProps={{ startAdornment: <FileText size={18} className="text-gray-400 mr-2 mt-1" /> }}
                                />

                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mt: 2 }}>Allergies</Typography>
                                <TextField
                                    fullWidth label="Allergies" name="allergies" multiline rows={2}
                                    value={formData.allergies} onChange={handleChange}
                                    placeholder="e.g., Penicillin, Peanuts, Dust..."
                                    InputProps={{ startAdornment: <AlertCircle size={18} className="text-orange-500 mr-2 mt-1" /> }}
                                />

                                <Alert severity="info" sx={{ mt: 2 }}>
                                    This information helps doctors provide better care during appointments.
                                </Alert>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Button
                            variant="contained" size="large" type="submit"
                            disabled={submitting}
                            startIcon={<Save />}
                            sx={{ px: 5, py: 1.5, borderRadius: 2 }}
                        >
                            {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
                        </Button>

                        {notification.open && (
                            <Alert
                                severity={notification.type}
                                sx={{ mt: 3 }}
                                onClose={() => setNotification({ ...notification, open: false })}
                            >
                                {notification.message}
                            </Alert>
                        )}
                    </Grid>
                </Grid>
            </form>
        </div>
    );
};

export default PatientSettings;
