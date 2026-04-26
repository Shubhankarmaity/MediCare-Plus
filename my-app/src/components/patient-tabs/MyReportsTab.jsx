import React from 'react';
import { Card, CardContent, Typography, Accordion, AccordionSummary, AccordionDetails, Avatar, Chip, Button, Grid } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { FileText, Download, User, Activity, TestTube, Pill, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const MyReportsTab = ({ patientAppointments, downloadReport }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-clinical border border-white/40">
      <h3 className="font-bold text-xl mb-6 flex items-center gap-2 font-outfit text-primary-navy">
        <FileText className="text-primary-blue" /> My Medical Reports
      </h3>

      {(!patientAppointments || patientAppointments.length === 0 || patientAppointments.filter(apt => apt.doctorReport && Object.keys(apt.doctorReport).length > 0).length === 0) ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="bg-blue-50 p-4 rounded-full mb-3">
            <FileText size={48} className="text-primary-blue/50" />
          </div>
          <Typography className="text-gray-500 font-medium">No medical reports available yet.</Typography>
          <Typography variant="body2" className="mt-1 max-w-sm text-center">Reports will appear here once a doctor submits their findings after your consultation.</Typography>
        </div>
      ) : (
        <div className="space-y-4">
          {patientAppointments
            .filter(apt => {
              if (!apt.doctorReport || Object.keys(apt.doctorReport).length === 0) return false;
              return true;
            })
            .sort((a, b) => {
              try {
                const dateA = a.doctorReport?.reportDate ? new Date(a.doctorReport.reportDate) : new Date(0);
                const dateB = b.doctorReport?.reportDate ? new Date(b.doctorReport.reportDate) : new Date(0);
                return dateB - dateA;
              } catch (error) {
                return 0;
              }
            })
            .map((appointment, index) => {
              try {
                if (!appointment.doctorReport || Object.keys(appointment.doctorReport).length === 0) return null;

                const hasMeaningfulContent =
                  (appointment.doctorReport.diagnosis && appointment.doctorReport.diagnosis.trim() !== '') ||
                  (appointment.doctorReport.symptoms && appointment.doctorReport.symptoms.trim() !== '') ||
                  (appointment.doctorReport.prescription && appointment.doctorReport.prescription.trim() !== '') ||
                  (appointment.doctorReport.recommendations && appointment.doctorReport.recommendations.trim() !== '');

                if (!hasMeaningfulContent || !appointment._id || !appointment.doctorId || !appointment.patientId) {
                  return null;
                }

                return (
                  <Accordion key={appointment._id || `report-${index}`} sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }} className="border border-gray-200 hover:shadow-md transition-shadow before:hidden pb-1">
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        bgcolor: '#f8fafc',
                        '&:hover': { bgcolor: '#f1f5f9' },
                        borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <Avatar sx={{ bgcolor: 'teal' }} className="shadow-sm">
                          {(appointment.doctorId?.name || 'D').charAt(0)}
                        </Avatar>
                        <div className="flex-1">
                          <Typography variant="subtitle1" fontWeight="bold" className="font-outfit text-gray-900">
                            {appointment.doctorId?.name || 'Unknown Doctor'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" className="font-medium tracking-wide">
                            {appointment.doctorId?.specialization || 'General Physician'}
                            &nbsp;•&nbsp;
                            {appointment.doctorReport.reportDate ?
                              (() => {
                                try {
                                  return new Date(appointment.doctorReport.reportDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  });
                                } catch {
                                  return 'Invalid Date';
                                }
                              })() :
                              'Unknown Date'}
                          </Typography>
                        </div>
                        {appointment.doctorReport.severity && (
                          <Chip
                            label={appointment.doctorReport.severity}
                            size="small"
                            color={
                              appointment.doctorReport.severity === 'Critical' ? 'error' :
                                appointment.doctorReport.severity === 'High' ? 'warning' :
                                  appointment.doctorReport.severity === 'Low' ? 'info' : 'default'
                            }
                            sx={{ mr: 1, fontWeight: 'bold' }}
                          />
                        )}
                        {index === 0 && appointment.doctorReport.reportDate &&
                          (new Date() - new Date(appointment.doctorReport.reportDate)) < 7 * 24 * 60 * 60 * 1000 && (
                            <Chip label="New" size="small" color="success" className="font-bold" />
                        )}
                      </div>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 4 }} className="bg-gray-50/30">
                      <div id={`report-${appointment._id}`} className="space-y-6">
                        {/* Report Actions */}
                        <div className="flex justify-end">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => downloadReport(appointment)}
                            startIcon={<Download size={18} />}
                            className="bg-primary-blue hover:bg-blue-800 text-white font-medium px-4 shadow-sm"
                            sx={{ textTransform: 'none' }}
                          >
                            Download PDF
                          </Button>
                        </div>

                        {/* Report Header */}
                        <div className="bg-primary-navy p-6 rounded-xl border border-divider-gray shadow-sm relative overflow-hidden">
                          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm border border-white/10">
                                <FileText className="text-white" size={32} />
                              </div>
                              <div>
                                <Typography variant="h5" fontWeight="bold" className="flex items-center gap-2 text-white font-outfit">
                                  Medical Report
                                </Typography>
                                <Typography variant="body2" className="mt-1 text-blue-200">
                                  Comprehensive Patient Health Assessment
                                </Typography>
                              </div>
                            </div>
                            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                              <Typography variant="body2" className="text-white font-medium uppercase tracking-widest text-xs">
                                Date format
                              </Typography>
                              <Typography variant="body1" className="text-white font-semibold">
                                {appointment.doctorReport.reportDate ?
                                  new Date(appointment.doctorReport.reportDate).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  }) : 'Date Unknown'}
                              </Typography>
                            </div>
                          </div>
                          
                          <div className="absolute -right-10 -bottom-10 opacity-10">
                            <FileText size={150} />
                          </div>
                        </div>

                        {/* Patient Info */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e7eb' }}>
                          <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={3} className="flex items-center gap-2 font-outfit text-gray-800">
                              <User size={20} className="text-primary-blue" /> Patient Information
                            </Typography>
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary" className="uppercase tracking-wider text-xs font-semibold">Patient Name</Typography>
                                <Typography variant="body1" fontWeight="medium" className="text-gray-900 mt-0.5">{appointment.patientId?.name || 'Unknown'}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary" className="uppercase tracking-wider text-xs font-semibold">Doctor</Typography>
                                <Typography variant="body1" fontWeight="medium" className="text-gray-900 mt-0.5">{appointment.doctorId?.name || 'Unknown'}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary" className="uppercase tracking-wider text-xs font-semibold">Specialization</Typography>
                                <Typography variant="body1" fontWeight="medium" className="text-gray-900 mt-0.5">{appointment.doctorId?.specialization || 'General Physician'}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary" className="uppercase tracking-wider text-xs font-semibold">Hospital</Typography>
                                <Typography variant="body1" fontWeight="medium" className="text-gray-900 mt-0.5">{appointment.doctorId?.hospitalName || 'Not Specified'}</Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>

                        {/* Clinical Data Grids */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Diagnosis */}
                          {appointment.doctorReport.diagnosis && (
                            <Card elevation={0} sx={{ borderRadius: 3, borderLeft: '4px solid #3b82f6', borderTop: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }} className="col-span-1 border border-gray-100">
                              <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" mb={2} className="flex items-center gap-2 font-outfit text-gray-800">
                                  <Activity size={18} className="text-blue-500" /> Diagnosis
                                </Typography>
                                <Typography variant="body2" className="text-gray-700 leading-relaxed bg-blue-50/50 p-3 rounded-lg">{appointment.doctorReport.diagnosis}</Typography>
                              </CardContent>
                            </Card>
                          )}

                          {/* Symptoms */}
                          {appointment.doctorReport.symptoms && (
                            <Card elevation={0} sx={{ borderRadius: 3, borderLeft: '4px solid #f59e0b', borderTop: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }} className="col-span-1 border border-gray-100">
                              <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" mb={2} className="flex items-center gap-2 font-outfit text-gray-800">
                                  <TestTube size={18} className="text-amber-500" /> Reported Symptoms
                                </Typography>
                                <Typography variant="body2" className="text-gray-700 leading-relaxed bg-amber-50/50 p-3 rounded-lg">{appointment.doctorReport.symptoms}</Typography>
                              </CardContent>
                            </Card>
                          )}
                        </div>

                        {/* Prescription */}
                        {appointment.doctorReport.prescription && (
                          <Card elevation={0} sx={{ borderRadius: 3, borderLeft: '4px solid #10b981', borderTop: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }} className="border border-gray-100 bg-green-50/30">
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold" mb={2} className="flex items-center gap-2 font-outfit text-gray-800">
                                <Pill size={18} className="text-green-500" /> Prescription
                              </Typography>
                              <Typography variant="body2" component="pre" className="whitespace-pre-wrap font-mono text-gray-700 bg-white p-4 rounded-lg border border-green-100 text-sm leading-relaxed">
                                {appointment.doctorReport.prescription}
                              </Typography>
                            </CardContent>
                          </Card>
                        )}

                        {/* Recommendations */}
                        {appointment.doctorReport.recommendations && (
                          <Card elevation={0} sx={{ borderRadius: 3, borderLeft: '4px solid #8b5cf6', borderTop: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }} className="border border-gray-100 bg-purple-50/30">
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold" mb={2} className="flex items-center gap-2 font-outfit text-gray-800">
                                <CheckCircle size={18} className="text-purple-500" /> Recommendations
                              </Typography>
                              <Typography variant="body2" className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-purple-100">{appointment.doctorReport.recommendations}</Typography>
                            </CardContent>
                          </Card>
                        )}

                        {/* Severity */}
                        {appointment.doctorReport.severity && (
                          <div className={`mt-4 p-4 rounded-xl border ${
                                appointment.doctorReport.severity === 'Critical' ? 'bg-red-50 border-red-200' :
                                  appointment.doctorReport.severity === 'High' ? 'bg-orange-50 border-orange-200' :
                                    appointment.doctorReport.severity === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                                      'bg-green-50 border-green-200'
                              } flex items-center justify-between`}>
                            <Typography variant="subtitle2" fontWeight="bold" className="flex items-center gap-2">
                              <AlertTriangle size={18} className={
                                appointment.doctorReport.severity === 'Critical' ? 'text-red-500' :
                                  appointment.doctorReport.severity === 'High' ? 'text-orange-500' :
                                    appointment.doctorReport.severity === 'Medium' ? 'text-yellow-600' :
                                      'text-green-500'
                              } /> Condition Severity
                            </Typography>
                            <Chip
                              label={appointment.doctorReport.severity}
                              color={
                                appointment.doctorReport.severity === 'Critical' ? 'error' :
                                  appointment.doctorReport.severity === 'High' ? 'warning' :
                                    appointment.doctorReport.severity === 'Medium' ? 'warning' : 'success'
                              }
                              size="medium"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </div>
                        )}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                );
              } catch {
                return null;
              }
            })
            .filter(Boolean)
          }
        </div>
      )}
    </motion.div>
  );
};

export default MyReportsTab;
