import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Grid, TextField, Button, Box,
    CircularProgress, Alert, MenuItem, Avatar, Divider, Card, CardContent
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
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl border border-blue-200 z-10">
                    <User className="text-blue-600" size={32} strokeWidth={2.5} />
                </div>
                <div className="z-10">
                    <Typography variant="h5" fontWeight="800" color="#0f172a" sx={{ letterSpacing: -0.5 }}>Profile Settings</Typography>
                    <Typography color="#64748b" fontWeight="500">Manage your personal information and medical history</Typography>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                    {/* Personal Information */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={0} sx={{ 
                            p: 2, 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 4, 
                            height: '100%',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
                        }}>
                            <Typography variant="h6" fontWeight="800" mb={3} sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5, px: 1 }}>
                                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500"><User size={18} strokeWidth={2.5} /></div> Personal Details
                            </Typography>

                            <Box className="space-y-4 px-1">
                                <TextField
                                    fullWidth label="Full Name" name="name"
                                    value={formData.name} onChange={handleChange} required
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <TextField
                                        fullWidth label="Age" name="age" type="number"
                                        value={formData.age} onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    />
                                    <TextField
                                        fullWidth select label="Gender" name="gender"
                                        value={formData.gender} onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    >
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </TextField>
                                </div>
                                <TextField
                                    fullWidth label="Phone Number" name="phone"
                                    value={formData.phone} onChange={handleChange}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    InputProps={{ startAdornment: <Phone size={18} className="text-slate-400 mr-2" /> }}
                                />
                                <TextField
                                    fullWidth label="Address" name="address" multiline rows={2}
                                    value={formData.address} onChange={handleChange}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    InputProps={{ startAdornment: <MapPin size={18} className="text-slate-400 mr-2 mt-1" /> }}
                                />
                            </Box>
                        </Card>
                    </Grid>

                    {/* Medical Information */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={0} sx={{ 
                            p: 2, 
                            border: '1px solid #fee2e2', 
                            borderRadius: 4, 
                            height: '100%',
                            boxShadow: '0 4px 20px rgba(239,68,68,0.02)',
                            bgcolor: '#fef2f2'
                        }}>
                            <Typography variant="h6" fontWeight="800" mb={3} sx={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: 1.5, px: 1 }}>
                                <div className="p-1.5 bg-red-100 rounded-lg text-red-600"><Heart size={18} strokeWidth={2.5} /></div> Medical Profile
                            </Typography>

                            <Box className="space-y-4 px-1">
                                <TextField
                                    fullWidth label="Emergency Contact (Name & Phone)" name="emergencyContact"
                                    value={formData.emergencyContact} onChange={handleChange}
                                    helperText="In case of emergency, who should we call?"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
                                />

                                <div className="grid grid-cols-1 gap-4 mt-2">
                                     <TextField
                                        fullWidth select label="Blood Group" name="bloodGroup"
                                        value={formData.bloodGroup} onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
                                    >
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                            <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                                        ))}
                                    </TextField>
                                </div>

                                <Divider sx={{ my: 3, borderColor: '#fca5a5', opacity: 0.5 }} />

                                <Typography variant="subtitle2" fontWeight="800" color="#7f1d1d">Existing Conditions</Typography>
                                <TextField
                                    fullWidth label="Medical History" name="medicalHistory" multiline rows={2}
                                    value={formData.medicalHistory} onChange={handleChange}
                                    placeholder="e.g., Diabetes, Hypertension, Asthma..."
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
                                    InputProps={{ startAdornment: <FileText size={18} className="text-red-400 mr-2 mt-1" /> }}
                                />

                                <Typography variant="subtitle2" fontWeight="800" color="#7f1d1d" sx={{ mt: 2 }}>Allergies</Typography>
                                <TextField
                                    fullWidth label="Allergies" name="allergies" multiline rows={2}
                                    value={formData.allergies} onChange={handleChange}
                                    placeholder="e.g., Penicillin, Peanuts, Dust..."
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }}
                                    InputProps={{ startAdornment: <AlertCircle size={18} className="text-orange-500 mr-2 mt-1" /> }}
                                />
                            </Box>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Button
                            variant="contained" size="large" type="submit"
                            disabled={submitting}
                            startIcon={<Save />}
                            sx={{ 
                                px: 5, py: 1.8, 
                                borderRadius: 3, 
                                fontWeight: 'bold', 
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
                                '&:hover': {
                                    boxShadow: '0 12px 20px rgba(59, 130, 246, 0.3)',
                                    transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.2s'
                            }}
                        >
                            {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
                        </Button>

                        {notification.open && (
                            <Alert
                                severity={notification.type}
                                sx={{ mt: 3, borderRadius: 3, fontWeight: '500' }}
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
