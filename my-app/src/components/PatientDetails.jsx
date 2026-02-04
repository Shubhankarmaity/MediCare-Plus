import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, CircularProgress, Chip, Avatar,
  Grid, Paper
} from '@mui/material';
import { User, Clock, Phone, MapPin } from 'lucide-react';
import { API_URL } from '../config';

const PatientDetails = ({ open, onClose, patientId }) => {
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accessRequestStatus, setAccessRequestStatus] = useState(null);
  const [requestPending, setRequestPending] = useState(false);

  const fetchPatientDetails = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    try {
      // First check if we're a doctor or admin to determine the correct approach
      if (user.role === 'doctor') {
        // For doctors, check access request status first
        const accessRes = await fetch(`${API_URL}/api/access-requests/request-status/${patientId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (accessRes.ok) {
          const accessResult = await accessRes.json();
          if (accessResult.status === 'approved') {
            // We have access, fetch patient details using doctor endpoint
            const res = await fetch(`${API_URL}/api/doctors/patient/${patientId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await res.json();
            if (res.ok) {
              setPatientDetails(result.patient);
            } else if (res.status === 403) {
              setAccessRequestStatus(result.message);
            }
          } else if (accessResult.status === 'pending') {
            setAccessRequestStatus("Access request is pending patient approval.");
            setRequestPending(true);
          } else {
            setAccessRequestStatus("Access to this patient's profile requires their explicit approval.");
            setRequestPending(false);
          }
        }
      } else if (user.role === 'admin') {
        // For admins, check access request status first
        const accessRes = await fetch(`${API_URL}/api/access-requests/request-status/${patientId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (accessRes.ok) {
          const accessResult = await accessRes.json();
          if (accessResult.status === 'approved') {
            // We have access, fetch patient details
            const res = await fetch(`${API_URL}/api/admin/user/${patientId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await res.json();
            if (res.ok) {
              setPatientDetails(result.user);
            } else if (res.status === 403) {
              setAccessRequestStatus(result.message);
              if (result.requestPending) {
                setRequestPending(true);
              }
            }
          } else if (accessResult.status === 'pending') {
            setAccessRequestStatus("Access request is pending patient approval.");
            setRequestPending(true);
          } else {
            setAccessRequestStatus("Access to this patient's profile requires their explicit approval.");
            setRequestPending(false);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching patient details", err);
      setAccessRequestStatus("Error fetching patient details");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const requestAccessToPatient = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/access-requests/request-access/${patientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await res.json();
      if (res.ok) {
        setAccessRequestStatus(result.message);
        setRequestPending(true);
      } else {
        console.error("Error requesting access:", result.message);
      }
    } catch (err) {
      console.error("Error requesting access", err);
    }
  };

  useEffect(() => {
    if (open && patientId) {
      fetchPatientDetails();
    }
  }, [open, patientId, fetchPatientDetails]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Patient Details</Typography>
          <Button onClick={onClose} color="secondary">Close</Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : accessRequestStatus ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" variant="h6" gutterBottom>
              Access Restricted
            </Typography>
            <Typography color="text.secondary" paragraph>
              {accessRequestStatus}
            </Typography>
            {!requestPending && (
              <Typography color="text.secondary" paragraph>
                Click "Request Access" to send a request to the patient for profile access.
              </Typography>
            )}
            {requestPending && (
              <Typography color="primary" paragraph>
                Your access request is pending patient approval.
              </Typography>
            )}
          </Box>
        ) : patientDetails ? (
          <Box sx={{ pb: 2 }}>
            {/* Basic Information */}
            <Paper sx={{ p: 3, bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #e5e7eb', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={2.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 4, height: 20, bgcolor: '#3b82f6', borderRadius: 1 }} />
                Patient Medical Information
              </Typography>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Full Name</Typography>
                    <Typography variant="body1" fontWeight="600">{patientDetails.name}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Email Address</Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ wordBreak: 'break-all' }}>{patientDetails.email}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Member Since</Typography>
                    <Typography variant="body1" fontWeight="600">
                      {new Date(patientDetails.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Grid>
                {patientDetails.phone && (
                  <Grid size={{ xs: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Phone</Typography>
                      <Typography variant="body1" fontWeight="600">{patientDetails.phone}</Typography>
                    </Box>
                  </Grid>
                )}
                {patientDetails.age && (
                  <Grid size={{ xs: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Age</Typography>
                      <Typography variant="body1" fontWeight="600">{patientDetails.age}</Typography>
                    </Box>
                  </Grid>
                )}
                {patientDetails.gender && (
                  <Grid size={{ xs: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Gender</Typography>
                      <Typography variant="body1" fontWeight="600">{patientDetails.gender}</Typography>
                    </Box>
                  </Grid>
                )}
                {patientDetails.bloodGroup && (
                  <Grid size={{ xs: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Blood Group</Typography>
                      <Chip label={patientDetails.bloodGroup} size="small" color="primary" variant="outlined" />
                    </Box>
                  </Grid>
                )}
                {patientDetails.medicalHistory && (
                  <Grid size={{ xs: 12 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Medical History</Typography>
                      <Typography variant="body1" fontWeight="600">{patientDetails.medicalHistory}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>          </Box>
        ) : (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No data available
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <Button onClick={onClose}>
          Close
        </Button>
        {accessRequestStatus && !requestPending && (
          <Button
            onClick={requestAccessToPatient}
            variant="contained"
            color="primary"
          >
            Request Access
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PatientDetails;