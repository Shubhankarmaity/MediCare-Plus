import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, CircularProgress, Chip, TextField, Grid, Divider } from '@mui/material';
import { Activity, Brain, AlertTriangle, ShieldCheck, Stethoscope, ChevronRight, User } from 'lucide-react';

const AIDecisionSupport = ({ doctors, onBookAppointment }) => {
    const [symptoms, setSymptoms] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    // Mock AI Analysis Function (Matches User Request: "layout only")
    const handleAnalyze = () => {
        if (!symptoms.trim()) return;

        setIsAnalyzing(true);
        setResult(null);

        // Simulate network/AI processing delay
        setTimeout(() => {
            // Mock dynamic response logic based on simple keywords for realism
            const lowerSymptoms = symptoms.toLowerCase();
            let mockAnalysis = {
                condition: 'General Vital Instability',
                department: 'General Medicine',
                urgency: 'Medium',
                explanation: 'Based on the symptoms provided, an initial assessment indicates a need for comprehensive checks. The reported symptoms require evaluation by a general physician to rule out underlying acute conditions.',
            };

            if (lowerSymptoms.includes('chest') || lowerSymptoms.includes('heart') || lowerSymptoms.includes('breath')) {
                mockAnalysis = {
                    condition: 'Suspected Cardiac Event / Angina',
                    department: 'Cardiology',
                    urgency: 'High',
                    explanation: 'The presence of chest discomfort or related symptoms strongly suggests a potential cardiac event. Immediate evaluation by a cardiologist is highly recommended to assess cardiovascular health.',
                };
            } else if (lowerSymptoms.includes('head') || lowerSymptoms.includes('migraine') || lowerSymptoms.includes('dizzy')) {
                mockAnalysis = {
                    condition: 'Acute Neurological Symptoms',
                    department: 'Neurology',
                    urgency: 'Medium',
                    explanation: 'The reported head-related symptoms indicate a neurological context. A neurological consult is advised to diagnose potential migraines, vertigo, or other central nervous system irregularities.',
                };
            } else if (lowerSymptoms.includes('child') || lowerSymptoms.includes('baby') || lowerSymptoms.includes('fever')) {
                mockAnalysis = {
                    condition: 'Pediatric Febrile Illness',
                    department: 'Pediatrics',
                    urgency: 'Low',
                    explanation: 'The symptoms align with common pediatric illnesses. While generally low risk, prolonged symptoms in children warrant observation and diagnosis by a specialized pediatrician.',
                };
            }

            // Filter available doctors to the recommended department
            const recommendedDoctors = doctors.filter(doc => doc.specialization === mockAnalysis.department);

            // If none match, just return top 2
            mockAnalysis.suggestedDoctors = recommendedDoctors.length > 0 ? recommendedDoctors.slice(0, 3) : doctors.slice(0, 3);

            setResult(mockAnalysis);
            setIsAnalyzing(false);
        }, 2000);
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'High': return 'error';
            case 'Medium': return 'warning';
            case 'Low': return 'success';
            default: return 'primary';
        }
    };

    const getUrgencyBg = (urgency) => {
        switch (urgency) {
            case 'High': return 'bg-red-50 border-red-200';
            case 'Medium': return 'bg-yellow-50 border-yellow-200';
            case 'Low': return 'bg-green-50 border-green-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl p-8 text-white shadow-[0_10px_40px_-10px_rgba(15,23,42,0.5)] relative overflow-hidden border border-slate-700/50">
                <div className="relative z-10 flex items-center gap-4 mb-5">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                        <Brain className="w-8 h-8 text-blue-400" strokeWidth={2.5}/>
                    </div>
                    <div>
                        <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>AI Clinical Triage</Typography>
                        <Typography variant="body1" className="text-slate-300 font-medium mt-1">
                            Advanced diagnostic analysis and specialist routing.
                        </Typography>
                    </div>
                </div>
                <div className="relative z-10 bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 inline-flex items-start gap-3 mt-2 backdrop-blur-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <Typography variant="caption" className="text-slate-300 max-w-lg font-medium leading-relaxed">
                        This tool utilizes an AI heuristic model to triage unverified symptoms. It does not replace professional medical diagnosis. In case of a severe emergency, please call your local emergency services immediately.
                    </Typography>
                </div>
                {/* Decorative background vectors */}
                <div className="absolute right-0 top-0 opacity-20 blur-[60px] pointer-events-none w-80 h-80 bg-blue-500 rounded-full translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 right-1/4 opacity-10 blur-[40px] pointer-events-none w-64 h-64 bg-emerald-400 rounded-full translate-y-1/2"></div>
            </div>

            {/* Input Section */}
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <CardContent className="p-0">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><Activity size={20} strokeWidth={2.5}/></div> Symptom Intake
                        </Typography>
                    </div>
                    <div className="p-6">
                        <TextField
                            fullWidth
                            multiline
                            rows={5}
                            variant="outlined"
                            placeholder="Please describe your symptoms in detail. Include duration, severity, and any relevant medical history..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: '#f8fafc',
                                    transition: 'all 0.2s',
                                    fontSize: '1rem',
                                    lineHeight: 1.6,
                                    '& fieldset': { borderColor: '#e2e8f0' },
                                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: 2 },
                                    '&.Mui-focused': { backgroundColor: '#ffffff' }
                                }
                            }}
                        />
                        <div className="mt-6 flex justify-end">
                            <Button
                                variant="contained"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !symptoms.trim()}
                                sx={{ 
                                    bgcolor: '#2563eb', 
                                    py: 1.5, px: 4, 
                                    borderRadius: 3, 
                                    fontWeight: 'bold', 
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    boxShadow: '0 8px 16px rgba(37,99,235,0.2)',
                                    '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 12px 20px rgba(37,99,235,0.3)', transform: 'translateY(-1px)' },
                                    '&:disabled': { bgcolor: '#cbd5e1' },
                                    transition: 'all 0.2s'
                                }}
                                startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <Brain size={20} />}
                            >
                                {isAnalyzing ? 'Analyzing Clinical Data...' : 'Run Triage Analysis'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 mt-8">
                    <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', mb: 4, px: 1 }}>
                        Triage Report
                    </Typography>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Summary Card */}
                        <div className="md:col-span-2 space-y-4">
                            <Card elevation={0} className={`border-2 shadow-sm rounded-3xl ${getUrgencyBg(result.urgency)} h-full`}>
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800, display: 'block', mb: 1, letterSpacing: 1.5 }}>
                                                LIKELY CONDITION FOCUS
                                            </Typography>
                                            <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
                                                {result.condition}
                                            </Typography>
                                        </div>
                                        <Chip
                                            label={`${result.urgency} Urgency`}
                                            color={getUrgencyColor(result.urgency)}
                                            icon={<AlertTriangle size={16} />}
                                            sx={{ fontWeight: 800, borderRadius: 2, px: 1, py: 2.5 }}
                                        />
                                    </div>
                                    <Divider sx={{ my: 4, opacity: 0.6, borderColor: 'rgba(0,0,0,0.1)' }} />
                                    <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.8, fontWeight: 500, fontSize: '1.05rem' }}>
                                        {result.explanation}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Department Card */}
                        <div className="md:col-span-1">
                            <Card elevation={0} sx={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', borderRadius: 4, height: '100%', position: 'relative', overflow: 'hidden' }}>
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
                                <CardContent className="p-8 flex flex-col h-full bg-gradient-to-b from-white to-slate-50/50">
                                    <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800, display: 'block', mb: 4, letterSpacing: 1.5, textAlign: 'center' }}>
                                        RECOMMENDED ROUTING
                                    </Typography>
                                    <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100 mb-2">
                                            <Stethoscope size={40} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a' }}>
                                                {result.department}
                                            </Typography>
                                            <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, mt: 0.5 }}>
                                                Primary Department
                                            </Typography>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recommended Doctors Grid */}
                    <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', px: 1, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><User size={20} strokeWidth={2.5} /></div> Recommended Specialists
                    </Typography>

                    {result.suggestedDoctors.length > 0 ? (
                        <Grid container spacing={4}>
                            {result.suggestedDoctors.map((doc, idx) => (
                                <Grid item xs={12} sm={6} md={4} key={idx}>
                                    <Card elevation={0} sx={{ 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: 4, 
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': { borderColor: '#bfdbfe', boxShadow: '0 12px 24px rgba(59,130,246,0.1)', transform: 'translateY(-4px)' }
                                    }}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl border border-slate-200">
                                                    {doc.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Typography variant="h6" fontWeight="800" sx={{ color: '#0f172a', lineHeight: 1.2 }} noWrap title={doc.name}>
                                                        Dr. {doc.name}
                                                    </Typography>
                                                    <Typography variant="subtitle2" sx={{ color: '#2563eb', fontWeight: 700, mt: 0.5 }}>
                                                        {doc.specialization}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-500 mb-6 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    {doc.experience ? `${doc.experience} Years Experience` : 'Experienced Specialist'}
                                                </div>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    {doc.hospitalName || 'Local Hospital Branch'}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                sx={{ 
                                                    borderWidth: 2, 
                                                    borderColor: '#bfdbfe', 
                                                    color: '#2563eb', 
                                                    fontWeight: 'bold', 
                                                    borderRadius: 3, 
                                                    py: 1, textTransform: 'none',
                                                    '&:hover': { borderWidth: 2, borderColor: '#3b82f6', bgcolor: '#eff6ff' } 
                                                }}
                                                endIcon={<ChevronRight size={16} />}
                                                onClick={() => onBookAppointment(doc)}
                                            >
                                                Book Consultation
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Card elevation={0} sx={{ border: '2px dashed #cbd5e1', borderRadius: 4, bgcolor: '#f8fafc', p: 8, textAlign: 'center' }}>
                            <Typography variant="h6" color="#475569" fontWeight="700">No Specialists Found</Typography>
                            <Typography color="#94a3b8" fontWeight="500" mt={1}>
                                No specific specialists are available in the {result.department} department right now. Please check general availability.
                            </Typography>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIDecisionSupport;
