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

    const fetchVitals = React.useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchVitals();
    }, [fetchVitals]);

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
                await res.json();
                setFormData({ systolic: '', diastolic: '', heartRate: '', bloodSugar: '', weight: '', temperature: '', notes: '' });
                setNotification({ open: true, message: 'Vitals logged successfully!', severity: 'success' });
                fetchVitals(); // Refresh list
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            console.error(err);
            setNotification({ open: true, message: 'Error saving vitals.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Grid container spacing={4}>
            {/* Input Form */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" fontWeight="800" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5, color: '#0f172a' }}>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Plus size={20} className="text-blue-500" strokeWidth={2.5} /></div> Log New Reading
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Systolic (BP)" name="systolic" type="number" value={formData.systolic} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Diastolic (BP)" name="diastolic" type="number" value={formData.diastolic} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Heart Rate" name="heartRate" type="number" value={formData.heartRate} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        InputProps={{ endAdornment: <Heart size={18} className="text-red-400" /> }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Sugar (mg)" name="bloodSugar" type="number" value={formData.bloodSugar} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        InputProps={{ endAdornment: <Activity size={18} className="text-orange-400" /> }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        InputProps={{ endAdornment: <Weight size={18} className="text-blue-400" /> }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6 }}>
                                    <TextField fullWidth label="Temp (°C)" name="temperature" type="number" value={formData.temperature} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        InputProps={{ endAdornment: <Thermometer size={18} className="text-red-400" /> }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField fullWidth label="Notes (Optional)" name="notes" multiline rows={2} value={formData.notes} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Button fullWidth variant="contained" type="submit" disabled={submitting} sx={{ borderRadius: 3, py: 1.5, mt: 1, fontWeight: 'bold', fontSize: '1rem', textTransform: 'none', boxShadow: 'none', '&:hover': { boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' } }}>
                                        {submitting ? 'Saving...' : 'Log Vitals'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>

                        {notification.open && (
                            <Alert severity={notification.severity} sx={{ mt: 3, borderRadius: 2 }} onClose={() => setNotification({ ...notification, open: false })}>
                                {notification.message}
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Charts */}
            <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={4}>
                    {/* BP & Heart Rate Chart */}
                    <Grid size={{ xs: 12 }}>
                        <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <CardContent sx={{ p: 4, pb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                                    <Activity className="text-blue-500" size={18} strokeWidth={2.5} /> Blood Pressure & Heart Rate Progress
                                </Typography>
                                <div style={{ width: '100%', minWidth: 0 }}>
                                    <ResponsiveContainer width="99%" height={280}>
                                        <LineChart data={vitals} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                                            <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Systolic" />
                                            <Line type="monotone" dataKey="diastolic" stroke="#f97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Diastolic" />
                                            <Line type="monotone" dataKey="heartRate" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Heart Rate" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Weight & Sugar Chart */}
                    <Grid size={{ xs: 12 }}>
                        <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <CardContent sx={{ p: 4, pb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                                    <Weight className="text-emerald-500" size={18} strokeWidth={2.5} /> Weight & Blood Sugar Tracking
                                </Typography>
                                <div style={{ width: '100%', minWidth: 0 }}>
                                    <ResponsiveContainer width="99%" height={280}>
                                        <LineChart data={vitals} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }} />
                                            <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Weight (kg)" />
                                            <Line yAxisId="right" type="monotone" dataKey="bloodSugar" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Sugar (mg/dL)" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default HealthVitals;
