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
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-full">
                        <CreditCard className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <Typography variant="h5" fontWeight="bold">Payment History</Typography>
                        <Typography color="text.secondary">Track your consultation fees and transactions</Typography>
                    </div>
                </div>
                <Button
                    startIcon={<RefreshCw size={18} />}
                    variant="outlined"
                    onClick={handleSync}
                >
                    Sync with Appointments
                </Button>
            </div>

            {payments.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }} elevation={0}>
                    <CreditCard className="mx-auto text-gray-300 mb-2" size={48} />
                    <Typography color="text.secondary">No payment records found.</Typography>
                    <Button sx={{ mt: 2 }} onClick={handleSync}>Check for past appointments</Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                            <TableRow>
                                <TableCell><strong>Date</strong></TableCell>
                                <TableCell><strong>Doctor</strong></TableCell>
                                <TableCell><strong>Service</strong></TableCell>
                                <TableCell><strong>Transaction ID</strong></TableCell>
                                <TableCell align="right"><strong>Amount</strong></TableCell>
                                <TableCell align="center"><strong>Status</strong></TableCell>
                                <TableCell align="center"><strong>Invoice</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment._id} hover>
                                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">{payment.doctorId?.name || 'Unknown'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{payment.doctorId?.specialization}</Typography>
                                    </TableCell>
                                    <TableCell>Consultation</TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{payment.transactionId || 'N/A'}</span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="bold" color="primary">₹{payment.amount}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={payment.status.toUpperCase()}
                                            size="small"
                                            color="success"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button size="small" startIcon={<Download size={14} />}>PDF</Button>
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
