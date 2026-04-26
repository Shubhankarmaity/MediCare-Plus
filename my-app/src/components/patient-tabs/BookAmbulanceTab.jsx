import React from 'react';
import { Grid, Card, CardContent, CardActions, Typography, Avatar, Button } from '@mui/material';
import { Ambulance, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const BookAmbulanceTab = ({ drivers, handleAmbulanceClick, patientLocation }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
          <Card elevation={0} className="glass-panel border border-divider-gray h-full">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" className="font-outfit text-primary-navy" mb={3}>
                Available Ambulance Drivers
              </Typography>
              {drivers.length === 0 ? (
                <div className="bg-gray-50 border border-dashed rounded-xl p-6 text-center text-gray-500">
                  <Ambulance size={32} className="mx-auto mb-2 text-gray-400" />
                  No ambulance drivers are online. In case of emergency, explicitly dial 108 or 112.
                </div>
              ) : (
                <div className="space-y-4">
                  {drivers.map((driver, index) => (
                    <motion.div key={driver._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <Card elevation={0} className="border border-red-100 hover:shadow-clinical transition-shadow">
                        <CardContent>
                          <div className="flex items-center gap-4 mb-3">
                            <Avatar sx={{ bgcolor: '#ef4444', width: 56, height: 56 }} className="shadow-sm">
                              <Ambulance />
                            </Avatar>
                            <div>
                              <Typography variant="h6" fontWeight="bold" className="font-outfit">{driver.name}</Typography>
                              <Typography variant="caption" className="text-gray-500 font-medium">Vehicle: {driver.vehicleNumber}</Typography>
                            </div>
                          </div>
                          <div className="flex items-center justify-between bg-red-50 p-2 rounded-lg border border-red-100">
                            <span className="text-red-700 font-bold text-sm uppercase tracking-wider flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                              Live Location
                            </span>
                            <span className="text-xs text-red-600 font-medium">Nearby</span>
                          </div>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button 
                            fullWidth 
                            variant="contained" 
                            color="error" 
                            onClick={() => handleAmbulanceClick(driver)}
                            className="bg-red-600 hover:bg-red-700 font-bold rounded-lg shadow-sm"
                          >
                            Call Now (SOS)
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      <Grid item xs={12} md={6}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
          <Card elevation={0} className="glass-panel border border-divider-gray h-full">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3} className="flex items-center gap-2 font-outfit text-primary-navy">
                <MapPin size={20} className="text-primary-blue" /> Your Location
              </Typography>

              <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                <div className="flex justify-center mb-6 mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-25" style={{ animationDuration: '2s' }}></div>
                    <div className="bg-primary-blue p-5 rounded-full relative z-10 shadow-lg border-4 border-white">
                      <MapPin className="text-white" size={32} />
                    </div>
                  </div>
                </div>
                <Typography variant="h6" fontWeight="bold" className="text-gray-800" gutterBottom>
                  GPS Tracking Active
                </Typography>
                <Typography className="text-body-gray" paragraph>
                  Your location is accurately being transmitted to our servers. Map View is currently hidden to save data.
                </Typography>
                
                {patientLocation && (
                  <div className="inline-block bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm mt-2">
                    <Typography className="font-mono text-sm text-primary-navy font-semibold">
                      Lat: {patientLocation.lat.toFixed(6)} | Lng: {patientLocation.lng.toFixed(6)}
                    </Typography>
                  </div>
                )}
              </div>

              <Typography variant="body2" className="text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4 leading-relaxed font-medium text-center">
                Your current location is shown above. When you request an ambulance,
                this exact location is dispatched immediately.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    </Grid>
  );
};

export default BookAmbulanceTab;
