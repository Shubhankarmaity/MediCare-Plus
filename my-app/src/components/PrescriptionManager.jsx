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
            <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-4 rounded-2xl border border-blue-200">
                    <Pill className="text-indigo-600" size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <Typography variant="h5" fontWeight="800" color="#0f172a" sx={{ letterSpacing: -0.5 }}>My Prescriptions</Typography>
                    <Typography color="#64748b" fontWeight="500">Access and download your digital prescriptions</Typography>
                </div>
            </div>

            {prescriptions.length === 0 ? (
                <Card sx={{ p: 8, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 4 }} elevation={0}>
                    <div className="mx-auto bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                        <Pill className="text-slate-300" size={40} />
                    </div>
                    <Typography variant="h6" color="#475569" fontWeight="700">No Prescriptions Found</Typography>
                    <Typography color="#94a3b8" fontWeight="500" mt={1}>You don't have any prescriptions in your medical records yet.</Typography>
                </Card>
            ) : (
                <Grid container spacing={4}>
                    {prescriptions.map((apt) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={apt._id}>
                            <Card elevation={0} sx={{ 
                                border: '1px solid #e2e8f0', 
                                borderRadius: 4, 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': { 
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px -8px rgba(59, 130, 246, 0.15)', 
                                    borderColor: '#bfdbfe' 
                                } 
                            }}>
                                <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>

                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                                                <FileText size={24} className="text-emerald-600" strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <Typography variant="subtitle1" fontWeight="800" color="#0f172a" sx={{ lineHeight: 1.2 }}>Dr. {apt.doctorId?.name}</Typography>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mt-1">
                                                    <Calendar size={14} className="text-slate-400" /> {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1 mb-5">
                                        <Typography variant="caption" fontWeight="800" color="#64748b" sx={{ letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                                            PRESCRIBED MEDICINES
                                        </Typography>
                                        <Typography variant="body2" color="#334155" fontWeight="600" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                            {apt.doctorReport.prescription.length > 120
                                                ? `${apt.doctorReport.prescription.substring(0, 120)}...`
                                                : apt.doctorReport.prescription}
                                        </Typography>
                                    </div>

                                    {/* Actions */}
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<Download size={18} />}
                                        onClick={() => downloadPrescription(apt)}
                                        sx={{ 
                                            textTransform: 'none', 
                                            borderRadius: 2.5, 
                                            py: 1.2,
                                            fontWeight: 'bold',
                                            borderWidth: 2,
                                            '&:hover': { borderWidth: 2 }
                                        }}
                                    >
                                        Download PDF
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
