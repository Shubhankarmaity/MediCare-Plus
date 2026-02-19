import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Grid, TextField, Button, Box,
    CircularProgress, Alert, Card, CardContent
} from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Heart, Activity, Thermometer, Weight, Plus } from 'lucide-react';
import { API_URL } from '../config';

const HealthVitals = () => {
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        systolic: '', diastolic: '', heartRate: '',
        bloodSugar: '', weight: '', temperature: '', notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchVitals();
    }, []);

    const fetchVitals = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/vitals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                // Reverse for chart (oldest to newest)
                setVitals(processDataForChart(data));
            }
        } catch (err) {
            console.error("Error fetching vitals:", err);
        } finally {
            setLoading(false);
        }
    };

    const processDataForChart = (data) => {
        // Sort by date ascending for chart
        return [...data].sort((a, b) => new Date(a.date) - new Date(b.date)).map(v => ({
            ...v,
            displayDate: new Date(v.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/vitals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const newVital = await res.json();
                setFormData({ systolic: '', diastolic: '', heartRate: '', bloodSugar: '', weight: '', temperature: '', notes: '' });
                setNotification({ open: true, message: 'Vitals logged successfully!', severity: 'success' });
                fetchVitals(); // Refresh list
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            setNotification({ open: true, message: 'Error saving vitals.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Grid container spacing={4}>
            {/* Input Form */}
            <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                        <Plus className="text-blue-600" /> Log New Reading
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Systolic (BP)" name="systolic" type="number" value={formData.systolic} onChange={handleChange} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Diastolic (BP)" name="diastolic" type="number" value={formData.diastolic} onChange={handleChange} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Heart Rate" name="heartRate" type="number" value={formData.heartRate} onChange={handleChange} size="small"
                                    InputProps={{ endAdornment: <Heart size={14} className="text-red-500" /> }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Sugar (mg/dL)" name="bloodSugar" type="number" value={formData.bloodSugar} onChange={handleChange} size="small"
                                    InputProps={{ endAdornment: <Activity size={14} className="text-orange-500" /> }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} size="small"
                                    InputProps={{ endAdornment: <Weight size={14} className="text-blue-500" /> }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Temp (°C)" name="temperature" type="number" value={formData.temperature} onChange={handleChange} size="small"
                                    InputProps={{ endAdornment: <Thermometer size={14} className="text-red-500" /> }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Notes" name="notes" multiline rows={2} value={formData.notes} onChange={handleChange} size="small" />
                            </Grid>

                            <Grid item xs={12}>
                                <Button fullWidth variant="contained" type="submit" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Log Vitals'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>

                    {notification.open && (
                        <Alert severity={notification.severity} sx={{ mt: 2 }} onClose={() => setNotification({ ...notification, open: false })}>
                            {notification.message}
                        </Alert>
                    )}
                </Paper>
            </Grid>

            {/* Charts */}
            <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                    {/* BP & Heart Rate Chart */}
                    <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Blood Pressure & Heart Rate</Typography>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={vitals}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="displayDate" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" />
                                        <Line type="monotone" dataKey="diastolic" stroke="#f97316" name="Diastolic" />
                                        <Line type="monotone" dataKey="heartRate" stroke="#3b82f6" name="Heart Rate" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Paper>
                    </Grid>

                    {/* Weight & Sugar Chart */}
                    <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>Weight & Blood Sugar</Typography>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={vitals}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="displayDate" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#10b981" name="Weight (kg)" />
                                        <Line yAxisId="right" type="monotone" dataKey="bloodSugar" stroke="#8b5cf6" name="Sugar (mg/dL)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default HealthVitals;
