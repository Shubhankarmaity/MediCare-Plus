import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const DoctorAnalytics = ({ appointments }) => {
    // Process data for charts
    const stats = useMemo(() => {
        if (!appointments || appointments.length === 0) return { daily: [], status: [] };

        // 1. Daily Appointments (Last 7 Days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString();
        }).reverse();

        const dailyCounts = last7Days.map(date => {
            const count = appointments.filter(appt =>
                new Date(appt.date).toLocaleDateString() === date
            ).length;
            return { date, count };
        });

        // 2. Status Distribution
        const statusCounts = {
            approved: appointments.filter(a => a.status === 'approved').length,
            pending: appointments.filter(a => a.status === 'pending').length,
            cancelled: appointments.filter(a => a.status === 'cancelled' || a.status === 'rejected').length,
        };

        const statusData = [
            { name: 'Approved', value: statusCounts.approved, color: '#10b981' }, // Green
            { name: 'Pending', value: statusCounts.pending, color: '#f59e0b' },  // Orange
            { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' }, // Red
        ].filter(item => item.value > 0);

        return { daily: dailyCounts, status: statusData };
    }, [appointments]);

    if (!appointments || appointments.length === 0) {
        return null; // Don't show if no data
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                Appointment Analytics
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Appointments Chart */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="600" color="text.secondary">
                        Appointments (Last 7 Days)
                    </Typography>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.daily}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(val) => val.split('/')[0] + '/' + val.split('/')[1]}
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Appointments" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Paper>

                {/* Status Distribution Chart */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="600" color="text.secondary">
                        Appointment Status
                    </Typography>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.status}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
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
            </div>
        </Box>
    );
};

export default DoctorAnalytics;
