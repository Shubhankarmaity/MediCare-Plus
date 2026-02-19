import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Grid, Paper, Typography, Box,
    CircularProgress, Snackbar, Alert, InputAdornment
} from '@mui/material';
import { User, Phone, MapPin, Building, Clock, DollarSign, Award, FileText } from 'lucide-react';
import { API_URL } from '../config';

const DoctorSettings = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        experience: '',
        hospitalName: '',
        address: '',
        consultationFee: '',
        availableDays: '',
        availableTime: '',
        doctorPhone: ''
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Fetch current profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user'));

                // We can use the existing /auth/user endpoint or just use local storage if we trust it, 
                // but it's better to fetch fresh data. 
                // Since we don't have a specific GET /doctor/profile, we'll try to use the stored user object 
                // and potentiall refresh it on update. For now, populating from localStorage + any extra calls if needed.
                // Actually, let's just use what we have in localStorage as a base, or if there's a specific endpoint.
                // The doctor list endpoint returns full details, so we could technically query that, but it's inefficient.
                // Let's assume the user object in localStorage has most fields, but if not, we might need a fetch.
                // For this version, we will pre-fill with what we have.

                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    specialization: user.specialization || '',
                    qualification: user.qualification || '',
                    experience: user.experience || '',
                    hospitalName: user.hospitalName || '',
                    address: user.address || '',
                    consultationFee: user.consultationFee || '',
                    availableDays: user.availableDays || '',
                    availableTime: user.availableTime || '',
                    doctorPhone: user.doctorPhone || ''
                });
                setFetching(false);
            } catch (err) {
                console.error("Error loading profile:", err);
                setFetching(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/doctors/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to update profile');

            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...currentUser, ...data.doctor };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setNotification({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        } catch (err) {
            setNotification({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Box p={4} display="flex" justify="center"><CircularProgress /></Box>;

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <Box mb={4} display="flex" alignItems="center" gap={2}>
                <div className="bg-blue-100 p-3 rounded-full">
                    <User className="text-blue-600" size={28} />
                </div>
                <div>
                    <Typography variant="h5" fontWeight="bold">Profile Settings</Typography>
                    <Typography variant="body2" color="text.secondary">Manage your public profile and consultation details</Typography>
                </div>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Personal Info */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <User size={18} /> Personal Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Email" name="email" value={formData.email} disabled helperText="Email cannot be changed" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={16} /></InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Office/Clinic Phone" name="doctorPhone" value={formData.doctorPhone} onChange={handleChange}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={16} /></InputAdornment> }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField fullWidth label="Clinic Address" name="address" value={formData.address} onChange={handleChange} multiline rows={2}
                            InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={16} /></InputAdornment> }}
                        />
                    </Grid>

                    {/* Professional Info */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Building size={18} /> Professional Details
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Award size={16} /></InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Qualification (e.g., MBBS, MD)" name="qualification" value={formData.qualification} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Experience (e.g., 10 years)" name="experience" value={formData.experience} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Hospital/Clinic Name" name="hospitalName" value={formData.hospitalName} onChange={handleChange} />
                    </Grid>

                    {/* Availability & Fees */}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Clock size={18} /> Ease & Availability
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Consultation Fee" name="consultationFee" type="number" value={formData.consultationFee} onChange={handleChange}
                            InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={16} /></InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Available Days (e.g., Mon-Fri)" name="availableDays" value={formData.availableDays} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Available Time (e.g., 9 AM - 5 PM)" name="availableTime" value={formData.availableTime} onChange={handleChange} />
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{ px: 5, py: 1.5, borderRadius: 2 }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Grid>
                </Grid>
            </form>

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default DoctorSettings;
