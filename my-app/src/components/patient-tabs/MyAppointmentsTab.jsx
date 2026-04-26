import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Paper, Button, Chip } from '@mui/material';
import { Calendar, Clock, CheckCircle, Video, MessageCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MyAppointmentsTab = ({ patientAppointments, setNotify, setChatPartner, setActiveChat, cancelAppointment }) => {
  const upcomingApts = patientAppointments.filter(apt => ['requested', 'pending', 'approved'].includes(apt.status));
  const pastApts = patientAppointments.filter(apt => ['completed', 'cancelled', 'rejected'].includes(apt.status));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight="bold" className="font-outfit text-primary-navy" gutterBottom>
          My Appointments
        </Typography>
      </Grid>

      {/* UPCOMING APPOINTMENTS */}
      <Grid item xs={12} md={6}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="h-full">
          <Card elevation={0} className="glass-panel border border-divider-gray h-full">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar className="text-primary-blue" size={24} /> 
                <span className="font-outfit text-primary-navy">Upcoming</span>
              </Typography>

              {upcomingApts.length === 0 ? (
                <div className="flex flex-col flex-1 items-center justify-center p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mt-4">
                  <Calendar size={40} className="text-gray-300 mb-3" />
                  <Typography color="text.secondary">No upcoming appointments.</Typography>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingApts.map((apt, index) => (
                    <motion.div key={apt._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <Card elevation={0} sx={{
                        borderRadius: 3,
                        border: apt.status === 'approved' ? '2px solid #10b981' : '1px solid #fbbf24',
                        bgcolor: apt.status === 'approved' ? '#f0fdf4' : '#fffbeb',
                        overflow: 'hidden'
                      }} className="transition-all hover:shadow-md">
                        {/* Status Banner */}
                        {apt.status === 'approved' && (
                          <Box sx={{ bgcolor: '#10b981', color: 'white', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle size={16} />
                            <Typography variant="body2" fontWeight="bold" className="tracking-wide">Appointment Confirmed by Admin</Typography>
                          </Box>
                        )}
                        {(apt.status === 'requested' || apt.status === 'pending') && (
                          <Box sx={{ bgcolor: '#f59e0b', color: 'white', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Clock size={16} />
                            <Typography variant="body2" fontWeight="bold" className="tracking-wide">Waiting for Admin Approval</Typography>
                          </Box>
                        )}

                        <CardContent sx={{ p: 3 }}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <Typography variant="subtitle1" fontWeight="bold" className="text-gray-900 text-lg">Dr. {apt.doctorId?.name}</Typography>
                              <Typography variant="caption" className="text-gray-500 uppercase tracking-widest font-semibold">{apt.doctorId?.specialization}</Typography>
                            </div>
                          </div>

                          {/* Confirmed Date/Time — Big & Prominent */}
                          {apt.status === 'approved' && apt.assignedTimeSlot ? (
                            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#dcfce7', borderRadius: 2, border: '1px solid #86efac' }}>
                              <Typography variant="caption" color="#065f46" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>YOUR APPOINTMENT</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Calendar size={18} className="text-green-700" />
                                  <Typography variant="h6" fontWeight="bold" color="#065f46">
                                    {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Clock size={18} className="text-green-700" />
                                  <Typography variant="h6" fontWeight="bold" color="#065f46">
                                    {apt.assignedTimeSlot}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          ) : (
                            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#fef3c7', borderRadius: 2, border: '1px solid #fde68a' }}>
                              <Typography variant="body2" color="#92400e" className="mb-1">
                                <b>Your Preference:</b> {apt.preferredDate ? new Date(apt.preferredDate).toLocaleDateString() : new Date(apt.date).toLocaleDateString()} — {apt.preferredTimeSlot || 'Any time'}
                              </Typography>
                              <Typography variant="caption" color="#92400e">Admin will confirm the final date & time.</Typography>
                            </Paper>
                          )}

                          <div className="flex gap-2">
                            {apt.status === 'approved' && (
                              <Button
                                variant="contained"
                                size="small"
                                className="bg-primary-blue hover:bg-blue-700 text-white font-medium shadow-none py-2"
                                startIcon={<Video size={16} />}
                                onClick={() => {
                                  setNotify({ open: true, msg: 'Please wait, the doctor will initiate the call at the scheduled time.', type: 'info' });
                                }}
                                sx={{ flex: 1 }}
                              >
                                Join Call
                              </Button>
                            )}

                            <Button
                              variant="outlined"
                              size="small"
                              className="border-primary-blue text-primary-blue hover:bg-blue-50 font-medium py-2"
                              startIcon={<MessageCircle size={16} />}
                              onClick={() => {
                                setChatPartner(apt.doctorId);
                                setActiveChat(true);
                              }}
                              sx={{ flex: 1 }}
                            >
                              Chat
                            </Button>

                            {(apt.status === 'pending' || apt.status === 'requested') && (
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => cancelAppointment(apt._id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      {/* PAST APPOINTMENTS */}
      <Grid item xs={12} md={6}>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="h-full">
          <Card elevation={0} className="glass-panel border border-divider-gray h-full">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle className="text-gray-400" size={24} /> 
                <span className="font-outfit text-primary-navy">History</span>
              </Typography>

              {pastApts.length === 0 ? (
                <div className="flex flex-col flex-1 items-center justify-center p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mt-4">
                  <CheckCircle size={40} className="text-gray-300 mb-3" />
                  <Typography color="text.secondary">No past appointments.</Typography>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastApts.map((apt, index) => (
                    <motion.div key={apt._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <Card elevation={0} sx={{
                        borderRadius: 3,
                        border: apt.status === 'completed' ? '1px solid #93c5fd' : '1px solid #fecaca',
                        bgcolor: apt.status === 'completed' ? '#eff6ff' : '#fef2f2'
                      }} className="transition-all hover:shadow-sm">
                        <CardContent sx={{ p: 2.5 }}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <Typography variant="subtitle1" fontWeight="bold" className="text-gray-900">Dr. {apt.doctorId?.name}</Typography>
                              <Typography variant="caption" className="text-gray-500 uppercase tracking-widest">{apt.doctorId?.specialization}</Typography>
                            </div>
                            <Chip
                              label={apt.status === 'completed' ? 'CHECKUP DONE' : apt.status.toUpperCase()}
                              color={apt.status === 'completed' ? 'primary' : 'error'}
                              size="small"
                              icon={apt.status === 'completed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              sx={{ fontSize: '0.7rem', height: 26, fontWeight: 'bold' }}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium mb-2 bg-white/50 p-2 rounded-lg">
                            <Calendar size={16} className="text-gray-400" /> {new Date(apt.date).toLocaleDateString()}
                            {apt.assignedTimeSlot && <span className="ml-2">at {apt.assignedTimeSlot}</span>}
                          </div>
                          {apt.status === 'completed' && apt.doctorReport && (
                            <Typography variant="caption" className="block text-blue-700 bg-blue-100/50 px-3 py-1.5 rounded-md font-medium mt-2">
                              📋 Doctor's report available — check My Reports tab
                            </Typography>
                          )}
                          {apt.status === 'rejected' && apt.rejectionReason && (
                            <Typography variant="caption" className="block text-red-600 font-medium mt-2">
                              Reason: {apt.rejectionReason}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    </Grid>
  );
};

export default MyAppointmentsTab;
