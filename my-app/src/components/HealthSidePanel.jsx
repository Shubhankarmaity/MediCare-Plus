import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, CircularProgress, Paper, Divider,
    Chip, Alert, Button, Collapse, IconButton, Tooltip
} from '@mui/material';
import {
    Salad, Ban, CheckCircle, Dumbbell, ShieldCheck,
    Lightbulb, Target, Sparkles, RefreshCw, ChevronDown,
    ChevronUp, HeartPulse, AlertTriangle, Sun, Moon,
    CloudSun, Sunset, Clock, CalendarDays, Stethoscope
} from 'lucide-react';
import { API_URL } from '../config';

const HealthSidePanel = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dietOpen, setDietOpen] = useState(true);
    const [tipsOpen, setTipsOpen] = useState(true);
    const [planOpen, setPlanOpen] = useState(true);

    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) { setError('Please log in.'); setLoading(false); return; }
            const res = await fetch(`${API_URL}/api/health-summary`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Failed to load health data'); return; }
            setSummary(data);
        } catch {
            setError('Network error. Could not load health data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    const SectionHeader = ({ icon, color, title, open, onToggle }) => {
        const IconComponent = icon;
        return (
        <Box
            onClick={onToggle}
            sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', py: 1, px: 1.5,
                borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                transition: 'background 0.15s'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconComponent size={16} color={color} />
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.78rem' }}>
                    {title}
                </Typography>
            </Box>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Box>
    );
};

    if (loading) {
        return (
            <Box sx={{
                width: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 6
            }}>
                <CircularProgress size={32} sx={{ color: '#4f46e5' }} />
                <Typography variant="caption" color="text.secondary">Analyzing health...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 1 }}>
                <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                    action={<Button size="small" color="inherit" onClick={fetchSummary}>Retry</Button>}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!summary) return null;

    const { recommendations, dailyPlan, currentCondition } = summary;
    const statusColors = {
        danger: '#ef4444', warning: '#f59e0b', good: '#10b981', info: '#3b82f6'
    };
    const statusColor = statusColors[currentCondition?.statusColor] || '#3b82f6';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

            {/* ── DOCTOR REPORT SOURCE BADGE ─────────────────── */}
            {(summary.lastReportDoctor || summary.lastReportDate) && (
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75,
                    p: 1, borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                    border: '1px solid #bfdbfe'
                }}>
                    <Stethoscope size={13} color="#2563eb" style={{ flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ color: '#1d4ed8', fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
                            Dr. {summary.lastReportDoctor || 'Your Doctor'}
                        </Typography>
                        {summary.lastReportDate && (
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.6rem' }}>
                                {new Date(summary.lastReportDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Typography>
                        )}
                    </Box>
                    <Chip label="Verified" size="small" sx={{ ml: 'auto', height: 16, fontSize: '0.55rem', bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }} />
                </Box>
            )}


            {/* ── HEALTH STATUS BADGE ─────────────────────── */}
            <Paper elevation={0} sx={{
                p: 2, borderRadius: 4, mb: 1.5,
                border: `1px solid ${statusColor}33`,
                background: `linear-gradient(135deg, ${statusColor}15 0%, #ffffff 100%)`,
                boxShadow: `0 8px 24px -8px ${statusColor}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <div className="p-2 rounded-xl" style={{ backgroundColor: `${statusColor}20` }}>
                        <HeartPulse size={20} color={statusColor} strokeWidth={2.5} />
                    </div>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ display: 'block', lineHeight: 1, letterSpacing: 0.5, mb: 0.5 }}>
                            HEALTH STATUS
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="800" sx={{ color: statusColor, fontSize: '0.85rem' }}>
                            {currentCondition?.overallStatus || 'Checking...'}
                        </Typography>
                    </Box>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton size="small" onClick={fetchSummary} sx={{ p: 1, bgcolor: 'white', '&:hover': { bgcolor: `${statusColor}15` } }}>
                        <RefreshCw size={16} color={statusColor} />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* ── TODAY'S DAILY PLAN ──────────────────────── */}
            {dailyPlan && (
                <Paper elevation={0} sx={{
                    borderRadius: 4, mb: 1.5,
                    border: '1px solid #e0e7ff',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    boxShadow: '0 4px 20px rgba(79, 70, 229, 0.04)',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <div className="p-1.5 rounded-xl bg-indigo-50"><CalendarDays size={18} color="#4f46e5" strokeWidth={2.5}/></div>
                            <Typography variant="subtitle2" fontWeight="800" sx={{ fontSize: '0.85rem', color: '#1e293b' }}>
                                Today's Plan
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                icon={<Sparkles size={12} />}
                                label="AI"
                                size="small"
                                sx={{ height: 20, fontSize: '0.65rem', backgroundColor: '#e0e7ff', color: '#4f46e5', fontWeight: 800, '& .MuiChip-icon': { fontSize: 12 } }}
                            />
                            <IconButton size="small" onClick={() => setPlanOpen(o => !o)} sx={{ p: 0.5 }}>
                                {planOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </IconButton>
                        </Box>
                    </Box>
                    <Collapse in={planOpen}>
                        <Box sx={{ px: 2, pb: 2 }}>
                            {/* Focus */}
                            <Box sx={{
                                display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5, mt: 0.5,
                                p: 1.5, borderRadius: 3, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0'
                            }}>
                                <Target size={16} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                                <Typography variant="caption" sx={{ lineHeight: 1.5, color: '#14532d' }}>
                                    <strong className="tracking-wide">FOCUS:</strong> {dailyPlan.dailyFocus}
                                </Typography>
                            </Box>

                            {/* Tips */}
                            {dailyPlan.dailyTips?.slice(0, 2).map((tipObj, i) => (
                                <Box key={i} sx={{
                                    display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1,
                                    p: 1.5, borderRadius: 3,
                                    backgroundColor: i % 2 === 0 ? '#fffbeb' : '#fef3c7',
                                    border: '1px solid #fde68a'
                                }}>
                                    <Lightbulb size={16} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ lineHeight: 1.5, color: '#78350f', fontWeight: 500 }}>{tipObj.tip}</Typography>
                                </Box>
                            ))}

                            {/* Routine */}
                            <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />
                            <Typography variant="caption" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#334155', letterSpacing: 0.5 }}>
                                <Clock size={14} color="#4f46e5" strokeWidth={2.5}/> DAILY ROUTINE
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                {[
                                    { key: 'morning', label: 'Morning', icon: Sun, color: '#f59e0b' },
                                    { key: 'afternoon', label: 'Afternoon', icon: CloudSun, color: '#f97316' },
                                    { key: 'evening', label: 'Evening', icon: Sunset, color: '#8b5cf6' },
                                    { key: 'night', label: 'Night', icon: Moon, color: '#3b82f6' }
                                ].filter(s => dailyPlan.routine?.[s.key]?.length > 0).map(slot => {
                                    const SlotIcon = slot.icon;
                                    return (
                                        <Box key={slot.key} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1, borderRadius: 2, '&:hover': { bgcolor: '#f8fafc' } }}>
                                            <SlotIcon size={14} color={slot.color} style={{ marginTop: 3, flexShrink: 0 }} />
                                            <Typography variant="caption" sx={{ color: slot.color, fontWeight: 800, minWidth: 65, flexShrink: 0, textTransform: 'uppercase', fontSize: '0.65rem', mt: '2px' }}>
                                                {slot.label}
                                            </Typography>
                                            <Typography variant="caption" sx={{ lineHeight: 1.5, color: '#475569', fontWeight: 500 }}>
                                                {dailyPlan.routine[slot.key][0]}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Collapse>
                </Paper>
            )}

            {/* ── DIET RECOMMENDATIONS ─────────────────────── */}
            <Paper elevation={0} sx={{
                borderRadius: 4, mb: 1.5,
                border: '1px solid #bbf7d0',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                overflow: 'hidden'
            }}>
                <Box sx={{ px: 1, pt: 0.5 }}>
                    <SectionHeader
                        icon={Salad} color="#16a34a"
                        title="Diet Recommendations"
                        open={dietOpen}
                        onToggle={() => setDietOpen(o => !o)}
                    />
                </Box>
                <Collapse in={dietOpen}>
                    <Box sx={{ px: 2, pb: 2 }}>
                        {/* Eat */}
                        <Typography variant="caption" fontWeight="800" color="success.main"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, letterSpacing: 0.5 }}>
                            <CheckCircle size={14} strokeWidth={2.5}/> INCLUDE
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
                            {recommendations?.diet?.eat?.slice(0, 5).map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                    <Typography variant="caption" sx={{ lineHeight: 1.5, color: '#334155', fontWeight: 500 }}>{item}</Typography>
                                </Box>
                            ))}
                        </Box>
                        <Divider sx={{ my: 1.5, borderColor: '#dcfce7' }} />
                        {/* Avoid */}
                        <Typography variant="caption" fontWeight="800" color="error.main"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, letterSpacing: 0.5 }}>
                            <Ban size={14} strokeWidth={2.5}/> AVOID
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            {recommendations?.diet?.avoid?.slice(0, 4).map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                    <Typography variant="caption" sx={{ lineHeight: 1.5, color: '#334155', fontWeight: 500 }}>{item}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Collapse>
            </Paper>

            {/* ── LIFESTYLE TIPS ───────────────────────────── */}
            <Paper elevation={0} sx={{
                borderRadius: 4, mb: 1.5,
                border: '1px solid #ddd6fe',
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                overflow: 'hidden'
            }}>
                <Box sx={{ px: 1, pt: 0.5 }}>
                    <SectionHeader
                        icon={Dumbbell} color="#9333ea"
                        title="Wellness Tips"
                        open={tipsOpen}
                        onToggle={() => setTipsOpen(o => !o)}
                    />
                </Box>
                <Collapse in={tipsOpen}>
                    <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {recommendations?.lifestyle?.slice(0, 4).map((tip, i) => (
                            <Box key={i} sx={{
                                display: 'flex', alignItems: 'flex-start', gap: 1,
                                p: 1.5, borderRadius: 3,
                                backgroundColor: i % 2 === 0 ? '#f8fafc' : '#f0f9ff'
                            }}>
                                <ShieldCheck size={16} color="#a855f7" style={{ marginTop: 2, flexShrink: 0 }} />
                                <Typography variant="caption" sx={{ lineHeight: 1.5, color: '#475569', fontWeight: 500 }}>{tip}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Collapse>
            </Paper>

            {/* ── IMMEDIATE ACTIONS ────────────────────────── */}
            {recommendations?.immediate?.length > 0 && (
                <Paper elevation={0} sx={{
                    borderRadius: 4, mb: 1.5,
                    border: '1px solid #fde68a',
                    background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    p: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <div className="p-1.5 rounded-lg bg-orange-100"><AlertTriangle size={16} color="#d97706" /></div>
                        <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#92400e', fontSize: '0.85rem' }}>
                            Action Needed
                        </Typography>
                    </Box>
                    <div className="space-y-2">
                        {recommendations.immediate.slice(0, 2).map((action, i) => (
                            <Typography key={i} variant="caption" sx={{
                                display: 'flex', alignItems: 'flex-start', gap: 1, lineHeight: 1.5, color: '#78350f', fontWeight: 500
                            }}>
                                <span style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }}>›</span>
                                {action}
                            </Typography>
                        ))}
                    </div>
                </Paper>
            )}

            {/* ── AI DISCLAIMER ────────────────────────────── */}
            <Box sx={{ px: 1, py: 0.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Typography variant="caption" sx={{ fontSize: '1rem', lineHeight: 1 }}>🤖</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: '0.65rem', fontWeight: 500 }}>
                    AI-generated based on your vitals & reports. Not a substitute for medical advice.
                </Typography>
            </Box>
        </Box>
    );
};

export default HealthSidePanel;
