import React from 'react';
import { Card, CardContent, Typography, Button, Grid, Chip } from '@mui/material';
import { Pill, Calendar, User, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const PrescriptionManager = ({ appointments }) => {
    // Filter appointments that have a prescription
    const prescriptions = appointments
        .filter(apt => apt.doctorReport && apt.doctorReport.prescription && apt.doctorReport.prescription.trim() !== '')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const downloadPrescription = (apt) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235); // Blue
        doc.text("MediCare Plus", 105, 20, null, null, "center");

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Official Prescription", 105, 30, null, null, "center");

        // Footer line
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Doctor Details
        doc.setFontSize(12);
        doc.text(`Doctor: ${apt.doctorId?.name || 'Unknown'}`, 20, 50);
        doc.text(`Specialization: ${apt.doctorId?.specialization || 'General'}`, 20, 58);
        doc.text(`Hospital: ${apt.doctorId?.hospitalName || 'MediCare Plus Hospital'}`, 20, 66);

        // Date
        doc.text(`Date: ${new Date(apt.date).toLocaleDateString()}`, 140, 50);

        // Patient Details
        doc.text(`Patient: ${apt.patientId?.name || 'Valued Patient'}`, 20, 85);

        // Prescription Box
        doc.setFillColor(240, 248, 255);
        doc.rect(20, 95, 170, 10, 'F');
        doc.setFont("helvetica", "bold");
        doc.text("Rx / Medicines", 25, 101);

        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(apt.doctorReport.prescription, 160);
        doc.text(splitText, 25, 115);

        // Notes/Instructions (if any)
        if (apt.doctorReport.recommendations) {
            doc.setFillColor(255, 245, 235); // Light orange
            const yPos = 115 + (splitText.length * 7) + 10;
            doc.rect(20, yPos, 170, 10, 'F');
            doc.setFont("helvetica", "bold");
            doc.text("Instructions / Recommendations", 25, yPos + 6);

            doc.setFont("helvetica", "normal");
            const splitRec = doc.splitTextToSize(apt.doctorReport.recommendations, 160);
            doc.text(splitRec, 25, yPos + 20);
        }

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("This is a digitally generated prescription.", 105, 280, null, null, "center");

        doc.save(`Prescription_${new Date(apt.date).toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                    <Pill className="text-blue-600" size={24} />
                </div>
                <div>
                    <Typography variant="h5" fontWeight="bold">My Prescriptions</Typography>
                    <Typography color="text.secondary">Access and download your digital prescriptions</Typography>
                </div>
            </div>

            {prescriptions.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }} elevation={0}>
                    <Pill className="mx-auto text-gray-300 mb-2" size={48} />
                    <Typography color="text.secondary">No prescriptions found in your records.</Typography>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {prescriptions.map((apt) => (
                        <Grid item xs={12} md={6} lg={4} key={apt._id}>
                            <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, '&:hover': { boxShadow: 4, borderColor: '#3b82f6' }, transition: 'all 0.2s' }}>
                                <CardContent className="space-y-4">

                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <FileText size={20} className="text-green-600" />
                                            </div>
                                            <div>
                                                <Typography variant="subtitle1" fontWeight="bold">{apt.doctorId?.name}</Typography>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Calendar size={12} /> {new Date(apt.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[80px]">
                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>
                                            PRESCRIBED MEDICINES:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                            {apt.doctorReport.prescription.length > 100
                                                ? `${apt.doctorReport.prescription.substring(0, 100)}...`
                                                : apt.doctorReport.prescription}
                                        </Typography>
                                    </div>

                                    {/* Actions */}
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<Download size={16} />}
                                        onClick={() => downloadPrescription(apt)}
                                        sx={{ textTransform: 'none', borderRadius: 2 }}
                                    >
                                        Download Prescription PDF
                                    </Button>

                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default PrescriptionManager;
