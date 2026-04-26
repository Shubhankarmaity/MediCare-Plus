import React from 'react';
import { Grid, Card, Typography } from '@mui/material';
import { Calendar, Pill, MessageCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const OverviewTab = ({ user, patientHospital, patientAppointments, conversations }) => {
  return (
    <Grid container spacing={3} mb={4}>
      {/* Welcome Banner */}
      <Grid item xs={12}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-primary-navy rounded-2xl p-8 text-white relative overflow-hidden soft-shadow"
        >
          <div className="relative z-10">
            <Typography variant="h4" fontWeight="bold" gutterBottom className="font-outfit">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </Typography>
            <Typography variant="body1" className="opacity-90 max-w-2xl font-inter">
              Track your health, manage appointments, and connect with top doctors all in one place.
            </Typography>
            {patientHospital && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30">
                <MapPin size={16} className="text-white" />
                <span className="text-white text-sm font-semibold">{patientHospital.name}</span>
                {patientHospital.city && (
                  <span className="text-white/80 text-sm">• {patientHospital.city}</span>
                )}
                <span className="text-white/70 text-xs bg-white/30 rounded-full px-2 py-0.5 backdrop-blur-sm">Your Hospital</span>
              </div>
            )}
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
        </motion.div>
      </Grid>

      {/* Quick Stats */}
      <Grid item xs={12} md={4}>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card elevation={0} className="glass-panel p-2 h-full cursor-pointer hover:shadow-clinical transition-all">
            <div className="flex items-center gap-4 p-4">
              <div className="bg-blue-50 p-4 rounded-2xl text-primary-blue shadow-inner"><Calendar size={28} /></div>
              <div>
                <Typography color="text.secondary" variant="caption" fontWeight="bold" className="tracking-widest">UPCOMING</Typography>
                <Typography variant="h5" fontWeight="bold" className="font-outfit text-primary-navy">
                  {patientAppointments.filter(apt => ['scheduled', 'rescheduled', 'approved', 'requested'].includes(apt.status)).length} <span className="text-lg text-gray-500 font-medium">Apts</span>
                </Typography>
              </div>
            </div>
          </Card>
        </motion.div>
      </Grid>

      <Grid item xs={12} md={4}>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card elevation={0} className="glass-panel p-2 h-full cursor-pointer hover:shadow-clinical transition-all">
            <div className="flex items-center gap-4 p-4">
              <div className="bg-green-50 p-4 rounded-2xl text-success-green shadow-inner"><Pill size={28} /></div>
              <div>
                <Typography color="text.secondary" variant="caption" fontWeight="bold" className="tracking-widest">PRESCRIPTIONS</Typography>
                <Typography variant="h5" fontWeight="bold" className="font-outfit text-primary-navy">
                  {patientAppointments.filter(apt => apt.doctorReport?.prescription).length} <span className="text-lg text-gray-500 font-medium">Records</span>
                </Typography>
              </div>
            </div>
          </Card>
        </motion.div>
      </Grid>

      <Grid item xs={12} md={4}>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card elevation={0} className="glass-panel p-2 h-full cursor-pointer hover:shadow-clinical transition-all">
            <div className="flex items-center gap-4 p-4">
              <div className="bg-purple-50 p-4 rounded-2xl text-purple-600 shadow-inner"><MessageCircle size={28} /></div>
              <div>
                <Typography color="text.secondary" variant="caption" fontWeight="bold" className="tracking-widest">MESSAGES</Typography>
                <Typography variant="h5" fontWeight="bold" className="font-outfit text-primary-navy">
                  {conversations.length} <span className="text-lg text-gray-500 font-medium">Chats</span>
                </Typography>
              </div>
            </div>
          </Card>
        </motion.div>
      </Grid>
    </Grid>
  );
};

export default OverviewTab;
