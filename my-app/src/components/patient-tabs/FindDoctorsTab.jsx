import React from 'react';
import { Grid, Card, CardContent, CardActions, Typography, Chip, Avatar, Button } from '@mui/material';
import { MapPin, Stethoscope, Clock, IndianRupee, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const FindDoctorsTab = ({ doctors, patientAppointments, handleBookingClick }) => {
  return (
    <Grid container spacing={3}>
      {doctors.length === 0 && (
        <div className="col-span-3 p-12 text-center w-full bg-white/50 rounded-3xl border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Stethoscope size={48} className="text-gray-400" />
          </div>
          <Typography variant="h6" className="font-semibold text-gray-700 mb-2 font-outfit">No Doctors Available Yet</Typography>
          <Typography className="text-sm text-gray-500 max-w-md">There are no approved doctors at your registered hospital at this time. Please check back later or contact your hospital admin.</Typography>
        </div>
      )}
      
      {doctors.map((doc, index) => (
        <Grid item xs={12} sm={6} md={4} key={doc._id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ y: -5 }}
            className="h-full"
          >
            <Card elevation={0} className="h-full flex flex-col glass-panel hover:shadow-clinical border border-divider-gray transition-all">
              <CardContent className="flex-grow">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="shadow-sm border-2 border-white" sx={{ bgcolor: 'teal', width: 64, height: 64 }}>
                    <Typography variant="h5" className="font-bold">{doc.name[0]}</Typography>
                  </Avatar>
                  <div>
                    <Typography variant="h6" fontWeight="bold" className="font-outfit text-primary-navy leading-tight">{doc.name}</Typography>
                    <Chip label={doc.specialization} size="small" className="bg-primary-blue/10 text-primary-blue font-medium mt-1" />
                  </div>
                </div>
                
                <div className="text-gray-600 text-sm space-y-2 mt-2">
                  <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> {doc.hospitalName}</div>
                  <div className="flex items-center gap-2"><Clock size={16} className="text-gray-400" /> {doc.experience} Years Experience</div>
                  {doc.consultationFee && (
                    <div className="flex items-center gap-2"><IndianRupee size={16} className="text-gray-400" /> ₹{doc.consultationFee} Consultation</div>
                  )}
                  {doc.availableTime && (
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs inline-flex items-center gap-1 font-bold">
                        <Calendar size={12} /> {doc.availableDays} | {doc.availableTime}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                {(() => {
                  const activeApt = patientAppointments.find(apt =>
                    apt.doctorId?._id === doc._id &&
                    ['requested', 'pending', 'approved'].includes(apt.status)
                  );
                  const isDisabled = !!activeApt;
                  let label = 'Book Appointment';
                  let btnClass = 'bg-primary-blue hover:bg-blue-700 text-white shadow-sm';
                  
                  if (activeApt?.status === 'requested' || activeApt?.status === 'pending') {
                    label = '⏳ Awaiting Approval';
                    btnClass = 'bg-amber-500 hover:bg-amber-600 text-white';
                  } else if (activeApt?.status === 'approved') {
                    label = `✅ Confirmed — ${activeApt.assignedTimeSlot ? new Date(activeApt.date).toLocaleDateString() + ' ' + activeApt.assignedTimeSlot : 'Scheduled'}`;
                    btnClass = 'bg-emerald-600 hover:bg-emerald-700 text-white';
                  }
                  
                  return (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleBookingClick(doc)}
                      disabled={isDisabled}
                      className={`rounded-xl py-2.5 font-bold transition-all ${btnClass} ${isDisabled ? 'opacity-80' : ''}`}
                      sx={{ textTransform: 'none' }}
                    >
                      {label}
                    </Button>
                  );
                })()}
              </CardActions>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

export default FindDoctorsTab;
