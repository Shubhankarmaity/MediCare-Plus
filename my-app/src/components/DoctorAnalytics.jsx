import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const DoctorAnalytics = ({ appointments }) => {
    const stats = useMemo(() => {
        if (!appointments || appointments.length === 0) return { daily: [], status: [], severity: [], monthly: [] };

        // 1. Daily Appointments (Last 7 Days) — split by active vs completed
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString();
        }).reverse();

        const dailyCounts = last7Days.map(date => {
            const dayAppts = appointments.filter(appt => new Date(appt.date).toLocaleDateString() === date);
            return {
                date,
                active: dayAppts.filter(a => a.status === 'approved').length,
                completed: dayAppts.filter(a => a.status === 'completed').length,
                total: dayAppts.length
            };
        });

        // 2. Status Distribution (correct for doctor view)
        const statusData = [
            { name: 'Active', value: appointments.filter(a => a.status === 'approved').length, color: '#10b981' },
            { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: '#3b82f6' },
        ].filter(item => item.value > 0);

        // 3. Severity Distribution (from completed reports)
        const completedWithReport = appointments.filter(a => a.status === 'completed' && a.doctorReport?.severity);
        const severityCounts = {};
        completedWithReport.forEach(a => {
            const sev = a.doctorReport.severity;
            severityCounts[sev] = (severityCounts[sev] || 0) + 1;
        });
        const severityColors = { Low: '#10b981', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };
        const severityData = Object.entries(severityCounts).map(([name, value]) => ({
            name, value, color: severityColors[name] || '#6b7280'
        }));

        // 4. Monthly Trend (last 6 months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString('en-US', { month: 'short' });
            const monthAppts = appointments.filter(a => {
                const ad = new Date(a.date);
                return `${ad.getFullYear()}-${String(ad.getMonth() + 1).padStart(2, '0')}` === monthKey;
            });
            monthlyData.push({
                month: label,
                total: monthAppts.length,
                completed: monthAppts.filter(a => a.status === 'completed').length
            });
        }

        return { daily: dailyCounts, status: statusData, severity: severityData, monthly: monthlyData };
    }, [appointments]);

    if (!appointments || appointments.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">No appointment data available yet.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Analytics will appear once you have appointments.</Typography>
            </Box>
        );
    }

    // Summary numbers
    const totalCompleted = appointments.filter(a => a.status === 'completed').length;
    const totalActive = appointments.filter(a => a.status === 'approved').length;
    const emergencyCount = appointments.filter(a => a.isEmergency).length;
    const avgPerDay = appointments.length > 0
        ? (appointments.length / Math.max(1, new Set(appointments.map(a => new Date(a.date).toDateString())).size)).toFixed(1)
        : '0';

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                Appointment Analytics
            </Typography>

            {/* Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary">{appointments.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Appointments</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981' }}>{totalCompleted}</Typography>
                    <Typography variant="body2" color="text.secondary">Completed</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#f59e0b' }}>{avgPerDay}</Typography>
                    <Typography variant="body2" color="text.secondary">Avg / Day</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#ef4444' }}>{emergencyCount}</Typography>
                    <Typography variant="body2" color="text.secondary">Emergency Cases</Typography>
                </Paper>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Appointments Chart — stacked active + completed */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="600" color="text.secondary">
                        Last 7 Days Activity
                    </Typography>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.daily}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(val) => val.split('/')[0] + '/' + val.split('/')[1]} />
                                <YAxis allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Bar dataKey="active" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Active" />
                                <Bar dataKey="completed" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Completed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Paper>

                {/* Status Distribution */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="600" color="text.secondary">
                        Current Status Distribution
                    </Typography>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.status} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                                    {stats.status.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Paper>

                {/* Monthly Trend */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="600" color="text.secondary">
                        Monthly Trend (6 Months)
                    </Typography>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.monthly}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#dbeafe" name="Total" />
                                <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#d1fae5" name="Completed" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Paper>

                {/* Severity Distribution */}
                {stats.severity.length > 0 && (
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="600" color="text.secondary">
                            Case Severity Breakdown
                        </Typography>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.severity} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {stats.severity.map((entry, index) => (
                                            <Cell key={`sev-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Paper>
                )}
            </div>
        </Box>
    );
};

export default DoctorAnalytics;
