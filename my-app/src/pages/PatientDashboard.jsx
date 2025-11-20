import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Grid, Card, CardContent, Typography, Button, CardActions, Chip, Avatar, 
  Snackbar, Alert, Tabs, Tab, Box 
} from '@mui/material';
import { MapPin, Stethoscope, Clock, Ambulance } from 'lucide-react';

const PatientDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notify, setNotify] = useState({ open: false, msg: '', type: 'success' });

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Doctors
      const docRes = await fetch('http://localhost:5000/api/doctors', { headers });
      const docData = await docRes.json();
      setDoctors(docData);

      // Fetch Drivers
      const driverRes = await fetch('http://localhost:5000/api/ambulance/drivers', { headers });
      const driverData = await driverRes.json();
      setDrivers(driverData);
    };
    fetchData();
  }, []);

  // 1. Doctor Booking Logic
  const bookDoctor = async (id, name) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    const res = await fetch('http://localhost:5000/api/appointments/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ doctorId: id, patientName: user.name, date: new Date().toISOString() })
    });

    if (res.ok) setNotify({ open: true, msg: `Appointment booked with ${name}`, type: 'success' });
    else setNotify({ open: true, msg: 'Booking Failed', type: 'error' });
  };

  // 2. Ambulance Booking Logic
  const bookAmbulance = async (id, name) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    const res = await fetch('http://localhost:5000/api/ambulance/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ driverId: id, patientName: user.name })
    });

    if (res.ok) setNotify({ open: true, msg: `Ambulance ${name} dispatched to your location!`, type: 'warning' });
    else setNotify({ open: true, msg: 'Request Failed', type: 'error' });
  };

  return (
    <DashboardLayout title="Medical Services" userRole="patient">
      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="Find Doctors" icon={<Stethoscope size={18} />} iconPosition="start" />
          <Tab label="Book Ambulance" icon={<Ambulance size={18} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* TAB 1: DOCTORS */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {doctors.length === 0 && <Typography p={3}>No doctors available.</Typography>}
          {doctors.map(doc => (
            <Grid item xs={12} md={6} lg={4} key={doc._id}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar sx={{ bgcolor: 'teal', width: 56, height: 56 }}>{doc.name[0]}</Avatar>
                    <div>
                      <Typography variant="h6" fontWeight="bold">{doc.name}</Typography>
                      <Chip label={doc.specialization} size="small" color="primary" variant="outlined" />
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm space-y-1">
                    <div className="flex items-center gap-2"><MapPin size={16} /> {doc.hospitalName}</div>
                    <div className="flex items-center gap-2"><Clock size={16} /> {doc.experience} Years Exp.</div>
                  </div>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button fullWidth variant="contained" onClick={() => bookDoctor(doc._id, doc.name)}>Book Appointment</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* TAB 2: AMBULANCE DRIVERS */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {drivers.length === 0 && <Typography p={3}>No ambulance drivers online.</Typography>}
          {drivers.map(driver => (
            <Grid item xs={12} md={6} lg={4} key={driver._id}>
              <Card elevation={3} sx={{ borderRadius: 3, borderLeft: '6px solid #ef4444' }}>
                <CardContent>
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar sx={{ bgcolor: '#ef4444', width: 56, height: 56 }}><Ambulance /></Avatar>
                    <div>
                      <Typography variant="h6" fontWeight="bold">{driver.name}</Typography>
                      <Typography variant="caption" className="text-gray-500">Vehicle: {driver.vehicleNumber}</Typography>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-red-50 p-2 rounded">
                    <span className="text-red-700 font-bold text-sm">● Live Location</span>
                    <span className="text-xs text-gray-500">2.4 km away</span>
                  </div>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button fullWidth variant="contained" color="error" onClick={() => bookAmbulance(driver._id, driver.name)}>
                    Call Now (SOS)
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={notify.open} autoHideDuration={3000} onClose={() => setNotify({ ...notify, open: false })}>
        <Alert severity={notify.type} variant="filled">{notify.msg}</Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default PatientDashboard;