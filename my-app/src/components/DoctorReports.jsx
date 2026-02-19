import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Box, Divider, CircularProgress,
  MenuItem
} from '@mui/material';
import { Calendar, FileText, Pill, UserCheck, Activity, TestTube, Download } from 'lucide-react'; // Added Download icon
import jsPDF from 'jspdf';

const DoctorReports = ({ open, onClose, appointment, onSubmit }) => {
  // ... (getInitialFormData and state remain same)
  const getInitialFormData = (appt) => {
    if (appt && appt.doctorReport) {
      return {
        diagnosis: appt.doctorReport.diagnosis || '',
        symptoms: appt.doctorReport.symptoms || '',
        prescription: appt.doctorReport.prescription || '',
        dosage: appt.doctorReport.dosage || '',
        duration: appt.doctorReport.duration || '',
        recommendations: appt.doctorReport.recommendations || '',
        testsRecommended: appt.doctorReport.testsRecommended || '',
        followUpDate: appt.doctorReport.followUpDate ?
          new Date(appt.doctorReport.followUpDate).toISOString().split('T')[0] : '',
        severity: appt.doctorReport.severity || 'Medium',
        nextVisitInstructions: appt.doctorReport.nextVisitInstructions || ''
      };
    }
    return {
      diagnosis: '',
      symptoms: '',
      prescription: '',
      dosage: '',
      duration: '',
      recommendations: '',
      testsRecommended: '',
      followUpDate: '',
      severity: 'Medium',
      nextVisitInstructions: ''
    };
  };

  const [reportData, setReportData] = useState(getInitialFormData(appointment));
  const [submitting, setSubmitting] = useState(false);

  // Update form when appointment changes
  React.useEffect(() => {
    setReportData(getInitialFormData(appointment));
  }, [appointment]);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(appointment._id, reportData);
    setSubmitting(false);
    onClose();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(20, 184, 166); // Teal color
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("MediCare+", 20, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Official Medical Prescription", 20, 30);

    // Doctor Info (Right Side Header)
    doc.setFontSize(10);
    doc.text(`Dr. ${JSON.parse(localStorage.getItem('user')).name}`, pageWidth - 20, 20, { align: 'right' });
    doc.text("General Physician", pageWidth - 20, 25, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 30, { align: 'right' });

    let yPos = 50;

    // Patient Details Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Details", 20, yPos);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

    yPos += 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const patientName = appointment.patientId?.name || appointment.patientName || "Unknown";
    const apptDate = new Date(appointment.date).toLocaleDateString();

    doc.text(`Name: ${patientName}`, 20, yPos);
    doc.text(`Appointment Date: ${apptDate}`, 120, yPos);
    yPos += 10;
    doc.text(`Diagnosis: ${reportData.diagnosis || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Symptoms: ${reportData.symptoms || 'N/A'}`, 20, yPos);

    // Prescription Section
    yPos += 20;
    doc.setFillColor(240, 249, 255);
    doc.rect(15, yPos - 5, pageWidth - 30, 30, 'F'); // Background box

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235); // Blue
    doc.text("Rx / Prescription", 20, yPos + 5);

    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Medicines:", 20, yPos);
    doc.setFont("helvetica", "normal");

    // Handle multi-line medicines if needed
    const meds = doc.splitTextToSize(reportData.prescription || 'None', pageWidth - 50);
    doc.text(meds, 50, yPos);
    yPos += (meds.length * 7);

    doc.setFont("helvetica", "bold");
    doc.text("Dosage:", 20, yPos);
    doc.setFont("helvetica", "normal");
    const dosage = doc.splitTextToSize(reportData.dosage || 'As directed', pageWidth - 50);
    doc.text(dosage, 50, yPos);
    yPos += (dosage.length * 7);

    doc.setFont("helvetica", "bold");
    doc.text("Duration:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(reportData.duration || '-', 50, yPos);

    // Additional Info
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Instructions & Remarks", 20, yPos);
    doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);

    yPos += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    if (reportData.testsRecommended) {
      doc.text(`• Recommended Tests: ${reportData.testsRecommended}`, 20, yPos);
      yPos += 10;
    }

    if (reportData.recommendations) {
      const recs = doc.splitTextToSize(`• Advice: ${reportData.recommendations}`, pageWidth - 40);
      doc.text(recs, 20, yPos);
      yPos += (recs.length * 7);
    }

    if (reportData.followUpDate) {
      doc.text(`• Follow-up Date: ${new Date(reportData.followUpDate).toLocaleDateString()}`, 20, yPos);
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a digitally generated prescription.", pageWidth / 2, pageWidth - 10, { align: 'center' });

    doc.save(`Prescription_${patientName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#14b8a6', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <FileText size={24} />
        {appointment && appointment.doctorReport ? 'View/Edit Patient Medical Report' : 'Comprehensive Patient Medical Reports'}
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        {appointment && (
          <Box>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-teal-100 p-3 rounded-full">
                <UserCheck className="text-teal-600" size={24} />
              </div>
              <div>
                <Typography variant="h6" fontWeight="bold">{appointment.patientId?.name || appointment.patientName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Appointment: {new Date(appointment.date).toLocaleDateString()}
                </Typography>
              </div>
            </div>

            <Divider sx={{ my: 2 }} />

            <div className="space-y-4">
              <TextField
                fullWidth
                label="Primary Diagnosis"
                multiline
                rows={2}
                variant="outlined"
                value={reportData.diagnosis}
                onChange={(e) => setReportData({ ...reportData, diagnosis: e.target.value })}
                placeholder="Enter the primary diagnosis..."
                required
              />

              <TextField
                fullWidth
                label="Symptoms Observed"
                multiline
                rows={2}
                variant="outlined"
                value={reportData.symptoms}
                onChange={(e) => setReportData({ ...reportData, symptoms: e.target.value })}
                placeholder="List all observed symptoms..."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Severity Level"
                  select
                  variant="outlined"
                  value={reportData.severity}
                  onChange={(e) => setReportData({ ...reportData, severity: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </TextField>

                <TextField
                  label="Follow-up Date (Optional)"
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={reportData.followUpDate}
                  onChange={(e) => setReportData({ ...reportData, followUpDate: e.target.value })}
                />
              </div>

              <Box sx={{ p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #3b82f6' }}>
                <Typography variant="subtitle1" color="primary" className="flex items-center gap-2 mb-2">
                  <Pill size={20} /> Medication Prescription
                </Typography>

                <TextField
                  fullWidth
                  label="Medications Prescribed"
                  multiline
                  rows={3}
                  variant="outlined"
                  value={reportData.prescription}
                  onChange={(e) => setReportData({ ...reportData, prescription: e.target.value })}
                  placeholder="List all prescribed medications..."
                  className="mb-3"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    label="Dosage Instructions"
                    multiline
                    rows={2}
                    variant="outlined"
                    value={reportData.dosage}
                    onChange={(e) => setReportData({ ...reportData, dosage: e.target.value })}
                    placeholder="e.g., Take 1 tablet twice daily after meals"
                  />

                  <TextField
                    label="Treatment Duration"
                    variant="outlined"
                    value={reportData.duration}
                    onChange={(e) => setReportData({ ...reportData, duration: e.target.value })}
                    placeholder="e.g., 7 days, 2 weeks"
                  />
                </div>
              </Box>

              <TextField
                fullWidth
                label="Medical Tests Recommended"
                multiline
                rows={2}
                variant="outlined"
                value={reportData.testsRecommended}
                onChange={(e) => setReportData({ ...reportData, testsRecommended: e.target.value })}
                placeholder="List any diagnostic tests or lab work recommended..."
                InputProps={{
                  startAdornment: <TestTube size={20} className="mr-2 text-blue-500" />
                }}
              />

              <TextField
                fullWidth
                label="General Recommendations"
                multiline
                rows={3}
                variant="outlined"
                value={reportData.recommendations}
                onChange={(e) => setReportData({ ...reportData, recommendations: e.target.value })}
                placeholder="Dietary advice, lifestyle changes, activity restrictions..."
              />

              <TextField
                fullWidth
                label="Next Visit Instructions"
                multiline
                rows={2}
                variant="outlined"
                value={reportData.nextVisitInstructions}
                onChange={(e) => setReportData({ ...reportData, nextVisitInstructions: e.target.value })}
                placeholder="Special instructions for the next visit..."
              />
            </div>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #3b82f6' }}>
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                <Typography variant="body2" color="primary" fontWeight="500">
                  This comprehensive report will be visible to the patient in their dashboard
                </Typography>
              </div>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        {/* Only show PDF download if a report already exists or if we are viewing the filled form */}
        <Button
          onClick={generatePDF}
          variant="outlined"
          color="secondary"
          disabled={!reportData.diagnosis}
          startIcon={<Download size={20} />}
          sx={{ mr: 1 }}
        >
          Download PDF
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={submitting || !reportData.diagnosis.trim()}
          startIcon={submitting ? <CircularProgress size={20} /> : <FileText size={20} />}
        >
          {submitting ? 'Saving...' : (appointment && appointment.doctorReport ? 'Update Report' : 'Submit Medical Report')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorReports;