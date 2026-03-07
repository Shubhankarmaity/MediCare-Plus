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
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <Typography variant="h5" fontWeight="bold">AI Clinical Decision Support</Typography>
                        <Typography variant="body2" className="text-slate-300">
                            Advanced diagnostic triage and departmental recommendation system.
                        </Typography>
                    </div>
                </div>
                <div className="relative z-10 bg-slate-800/50 border border-slate-700 rounded-lg p-4 inline-flex items-start gap-3 mt-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <Typography variant="caption" className="text-slate-300 max-w-lg">
                        This tool utilizes an AI heuristic model to triange unverified symptoms. It does not replace professional medical diagnosis. In case of a severe emergency, please call your local emergency services immediately.
                    </Typography>
                </div>
                {/* Decorative background vectors */}
                <div className="absolute right-0 top-0 opacity-10 blur-xl pointer-events-none">
                    <Activity className="w-64 h-64 text-blue-400 -mt-10 -mr-10" />
                </div>
            </div>

            {/* Input Section */}
            <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <Typography variant="h6" fontWeight="bold" className="text-slate-800 flex items-center gap-2">
                            <Activity className="text-blue-600" size={20} /> Symptom Intake
                        </Typography>
                    </div>
                    <div className="p-6">
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            placeholder="Please describe your symptoms in detail. Include duration, severity, and any relevant medical history..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: '#f8fafc',
                                    transition: 'all 0.2s',
                                    '&:hover, &.Mui-focused': {
                                        backgroundColor: '#ffffff',
                                    }
                                }
                            }}
                        />
                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="contained"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !symptoms.trim()}
                                className="bg-blue-600 hover:bg-blue-700 py-2.5 px-6 rounded-xl font-bold capitalize disabled:bg-slate-300"
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
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <Typography variant="h6" fontWeight="bold" className="text-slate-800 mb-4 px-1">
                        Triage Report
                    </Typography>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Summary Cards */}
                        <div className="md:col-span-2 space-y-4">
                            <Card className={`border-2 shadow-none rounded-2xl ${getUrgencyBg(result.urgency)}`}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <Typography variant="overline" className="text-slate-500 font-bold block mb-1 tracking-wider">
                                                Likely Condition Focus
                                            </Typography>
                                            <Typography variant="h5" fontWeight="bold" className="text-slate-800 text-xl">
                                                {result.condition}
                                            </Typography>
                                        </div>
                                        <Chip
                                            label={`${result.urgency} Urgency`}
                                            color={getUrgencyColor(result.urgency)}
                                            icon={<AlertTriangle size={16} />}
                                            className="font-bold rounded-lg"
                                        />
                                    </div>
                                    <Divider className="my-4 opacity-50" />
                                    <Typography variant="body1" className="text-slate-700 leading-relaxed font-medium">
                                        {result.explanation}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Department Card */}
                        <div className="md:col-span-1">
                            <Card className="border border-slate-200 shadow-sm rounded-2xl h-full bg-white relative overflow-hidden">
                                <CardContent className="p-6 flex flex-col h-full border-t-4 border-blue-500">
                                    <Typography variant="overline" className="text-slate-500 font-bold block mb-3 tracking-wider">
                                        Recommended Routing
                                    </Typography>
                                    <div className="flex-grow flex flex-col items-center justify-center text-center space-y-3">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                            <Stethoscope size={32} />
                                        </div>
                                        <div>
                                            <Typography variant="h6" fontWeight="bold" className="text-slate-800">
                                                {result.department}
                                            </Typography>
                                            <Typography variant="body2" className="text-slate-500">
                                                Primary Department
                                            </Typography>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recommended Doctors Grid */}
                    <Typography variant="h6" fontWeight="bold" className="text-slate-800 px-1 mb-4 flex items-center gap-2">
                        <User className="text-blue-600" size={20} /> Recommended Specialists
                    </Typography>

                    {result.suggestedDoctors.length > 0 ? (
                        <Grid container spacing={3}>
                            {result.suggestedDoctors.map((doc, idx) => (
                                <Grid item xs={12} sm={6} md={4} key={idx}>
                                    <Card className="border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                                        <CardContent className="p-5">
                                            <Typography variant="h6" fontWeight="bold" className="text-slate-800 truncate" title={doc.name}>
                                                {doc.name}
                                            </Typography>
                                            <Typography variant="body2" className="text-blue-600 font-semibold mb-3">
                                                {doc.specialization}
                                            </Typography>
                                            <div className="text-sm text-slate-500 mb-4 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                    {doc.experience ? `${doc.experience} Years Exp.` : 'Experienced Specialist'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                    {doc.hospitalName || 'Local Hospital Branch'}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                className="border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold rounded-xl"
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
                        <Card className="border border-slate-200 rounded-2xl bg-slate-50 p-6 text-center">
                            <Typography variant="body1" className="text-slate-500">
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
