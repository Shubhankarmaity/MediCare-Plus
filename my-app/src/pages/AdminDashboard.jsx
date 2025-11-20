import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Grid, Paper, Typography, Table, TableBody, TableCell, 
  TableHead, TableRow, Chip, Avatar, CircularProgress 
} from '@mui/material';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/admin/dashboard-data', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) setData(result);
      } catch (err) {
        console.error("Error fetching admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center mt-20"><CircularProgress /></div>;

  return (
    <DashboardLayout title="System Overview" userRole="admin">
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#3b82f6', color: 'white', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Registered Doctors</Typography>
            <Typography variant="h3" fontWeight="bold">{data?.stats.doctorCount || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#10b981', color: 'white', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Patients</Typography>
            <Typography variant="h3" fontWeight="bold">{data?.stats.patientCount || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#f43f5e', color: 'white', borderRadius: 3 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Ambulance Drivers</Typography>
            <Typography variant="h3" fontWeight="bold">{data?.stats.driverCount || 0}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed User Database */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Master User Database</Typography>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Details (Specific)</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.users.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar sx={{ bgcolor: user.role === 'doctor' ? 'teal' : 'orange' }}>{user.name[0]}</Avatar>
                    <div>
                      <Typography variant="subtitle2" fontWeight="bold">{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.role.toUpperCase()} 
                    size="small" 
                    color={user.role === 'doctor' ? 'primary' : user.role === 'driver' ? 'error' : 'default'} 
                  />
                </TableCell>
                <TableCell>
                  {/* LOGIC TO SHOW SPECIFIC DATA BASED ON ROLE */}
                  {user.role === 'doctor' && (
                    <div className="text-sm">
                      <span className="font-bold text-gray-600">🏥 {user.hospitalName}</span><br/>
                      <span className="text-gray-500">{user.specialization}</span>
                    </div>
                  )}
                  {user.role === 'driver' && (
                    <div className="text-sm">
                      <span className="font-bold text-gray-600">🚑 {user.vehicleNumber}</span><br/>
                      <span className="text-gray-500">Lic: {user.licenseNumber}</span>
                    </div>
                  )}
                  {user.role === 'patient' && <span className="text-gray-400 italic">Standard Access</span>}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </DashboardLayout>
  );
};

export default AdminDashboard;