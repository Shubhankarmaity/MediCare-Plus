import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Button, CircularProgress
} from '@mui/material';
import { CreditCard, RefreshCw, Download } from 'lucide-react';
import { API_URL } from '../config';

const PatientPaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            // First try to seed if empty (optional auto-seed)
            // But let's just fetch first.
            const res = await fetch(`${API_URL}/api/payments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setPayments(data);
        } catch (err) {
            console.error("Error fetching payments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/payments/seed`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchPayments();
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><CircularProgress /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="flex items-center gap-4 z-10">
                    <div className="bg-gradient-to-br from-violet-100 to-purple-100 p-4 rounded-2xl border border-purple-200">
                        <CreditCard className="text-violet-600" size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <Typography variant="h5" fontWeight="800" color="#0f172a" sx={{ letterSpacing: -0.5 }}>Payment History</Typography>
                        <Typography color="#64748b" fontWeight="500">Track your consultation fees and transactions</Typography>
                    </div>
                </div>
                <Button
                    startIcon={<RefreshCw size={18} />}
                    variant="outlined"
                    onClick={handleSync}
                    sx={{ 
                        borderRadius: 3, 
                        py: 1, 
                        px: 3, 
                        fontWeight: 'bold', 
                        textTransform: 'none',
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2, bgcolor: '#f8fafc' },
                        zIndex: 10
                    }}
                >
                    Sync Records
                </Button>
            </div>

            {payments.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 4 }} elevation={0}>
                    <div className="mx-auto bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                        <CreditCard className="text-slate-300" size={40} />
                    </div>
                    <Typography variant="h6" color="#475569" fontWeight="700">No Payment Records</Typography>
                    <Typography color="#94a3b8" fontWeight="500" mt={1} mb={3}>You don't have any payment history recorded yet.</Typography>
                    <Button variant="contained" onClick={handleSync} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}>Check for past appointments</Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Doctor</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Service</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Transaction ID</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Amount</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', py: 2 }}>Invoice</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ color: '#334155', fontWeight: 500 }}>
                                        {new Date(payment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="800" color="#0f172a">Dr. {payment.doctorId?.name || 'Unknown'}</Typography>
                                        <Typography variant="caption" color="#64748b" fontWeight="600">{payment.doctorId?.specialization}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: '#334155', fontWeight: 500 }}>Consultation</TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold">{payment.transactionId || 'N/A'}</span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="800" color="#4338ca">₹{payment.amount}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={payment.status.toUpperCase()}
                                            size="small"
                                            sx={{ 
                                                fontWeight: '800', 
                                                bgcolor: payment.status === 'completed' || payment.status === 'paid' ? '#dcfce7' : '#fef9c3',
                                                color: payment.status === 'completed' || payment.status === 'paid' ? '#166534' : '#854d0e',
                                                borderRadius: 2
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button size="small" startIcon={<Download size={14} />} sx={{ fontWeight: 'bold', borderRadius: 2, textTransform: 'none' }}>PDF</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default PatientPaymentHistory;
