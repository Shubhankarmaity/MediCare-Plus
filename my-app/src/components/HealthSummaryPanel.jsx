import React, { useState, useEffect, useCallback } from 'react';
import {
    Grid, Card, CardContent, Typography, Chip, CircularProgress,
    Alert, Divider, Paper, Box, Button, Tooltip, LinearProgress
} from '@mui/material';
import {
    Heart, Activity, Thermometer, Droplets, Weight, AlertTriangle,
    CheckCircle, Dumbbell, TestTube, Pill,
    RefreshCw, ShieldCheck, TrendingUp, Clock, Stethoscope, Salad,
    Ban, ChevronRight, CalendarClock, Sun, CloudSun, Sunset, Moon,
    Lightbulb, CalendarDays, Target, Sparkles
} from 'lucide-react';
import { API_URL } from '../config';

const STATUS_CONFIG = {
    danger: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Critical', icon: AlertTriangle },
    warning: { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Needs Attention', icon: AlertTriangle },
    good: { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', label: 'Healthy', icon: CheckCircle },
    info: { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', label: 'Info', icon: Activity }
};

const SEVERITY_COLORS = {
    danger: { bg: '#fef2f2', text: '#dc2626', chip: 'error' },
    caution: { bg: '#fffbeb', text: '#d97706', chip: 'warning' },
    info: { bg: '#eff6ff', text: '#2563eb', chip: 'info' }
};

const VITAL_ICONS = {
    bloodPressure: Heart,
    heartRate: Activity,
    bloodSugar: Droplets,
    temperature: Thermometer,
    weight: Weight
};

const VITAL_LABELS = {
    bloodPressure: 'Blood Pressure',
    heartRate: 'Heart Rate',
    bloodSugar: 'Blood Sugar',
    temperature: 'Temperature',
    weight: 'Weight / BMI'
};

const HealthSummaryPanel = () => {
    // ────────────────────────────────────────────────────────────
    // ALL HOOKS DECLARED AT TOP (before any conditional returns)
    // ────────────────────────────────────────────────────────────
    
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedPlanItems, setCompletedPlanItems] = useState({});
    const [savingProgress, setSavingProgress] = useState(false);

    const planDateKey = summary?.dailyPlan?.dateKey || null;

    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/health-summary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch health summary');
            const data = await res.json();
            setSummary(data);
        } catch (err) {
            console.error('Health summary error:', err);
            setError('Could not load your health summary. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveProgress = useCallback(async (next) => {
        if (!planDateKey) return;

        try {
            setSavingProgress(true);
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/health-summary/progress`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    dateKey: planDateKey,
                    completedItems: next
                })
            });
        } catch (e) {
            console.error('Failed to save health plan progress:', e);
        } finally {
            setSavingProgress(false);
        }
    }, [planDateKey]);

    const togglePlanItem = useCallback((id) => {
        setCompletedPlanItems((prev) => {
            const next = { ...prev, [id]: !prev[id] };
            saveProgress(next);
            return next;
        });
    }, [saveProgress]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    useEffect(() => {
        if (!summary?.dailyPlan) {
            setCompletedPlanItems({});
            return;
        }
        setCompletedPlanItems(summary.dailyPlan.completedItems || {});
    }, [summary]);

    // ────────────────────────────────────────────────────────────
    // CONDITIONAL LOGIC (after all hooks)
    // ────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
                <CircularProgress size={48} sx={{ color: '#3b82f6' }} />
                <Typography variant="body1" color="text.secondary">
                    Analyzing your health data...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ borderRadius: 3 }}
                action={<Button color="inherit" size="small" onClick={fetchSummary}>Retry</Button>}>
                {error}
            </Alert>
        );
    }

    if (!summary) return null;

    // ────────────────────────────────────────────────────────────
    // COMPONENT LOGIC (after hooks and conditional early returns)
    // ────────────────────────────────────────────────────────────

    const { currentCondition, vitalsAnalysis, recommendations, doctorNotes, activePrescriptions, dailyPlan } = summary;
    const statusCfg = STATUS_CONFIG[currentCondition.statusColor] || STATUS_CONFIG.info;
    const StatusIcon = statusCfg.icon;

    const prioritized = dailyPlan?.prioritized || {};
    const mustDoNow = prioritized.mustDoNow || [];
    const shouldDoToday = prioritized.shouldDoToday || [];
    const optionalTasks = prioritized.optional || [];
    const allActionItems = [...mustDoNow, ...shouldDoToday, ...optionalTasks];
    const completedCount = allActionItems.filter(item => completedPlanItems[item.id]).length;
    const progressPct = allActionItems.length > 0 ? Math.round((completedCount / allActionItems.length) * 100) : 0;

    // Filter out null vital entries
    const vitalEntries = Object.entries(vitalsAnalysis).filter(([, v]) => v !== null);

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={3}>

                {/* ─── OVERALL HEALTH STATUS CARD ───────────────────────── */}
                <Grid size={{ xs: 12 }}>
                    <Card elevation={3} sx={{
                        borderRadius: 3,
                        border: `2px solid ${statusCfg.border}`,
                        background: `linear-gradient(135deg, ${statusCfg.bg} 0%, white 100%)`
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 3, backgroundColor: statusCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <StatusIcon size={36} color={statusCfg.color} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                                            Your Health Status
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: statusCfg.color }} fontWeight="600">
                                            {currentCondition.overallStatus}
                                        </Typography>
                                        {summary.lastVitalsDate && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                <Clock size={12} /> Last reading: {new Date(summary.lastVitalsDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                <Tooltip title="Refresh analysis">
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshCw size={16} />}
                                        onClick={fetchSummary}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Refresh
                                    </Button>
                                </Tooltip>
                            </Box>

                            {/* Conditions detected */}
                            {currentCondition.conditions.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2.5 }}>
                                    {currentCondition.conditions.map((cond, i) => (
                                        <Chip
                                            key={i}
                                            label={cond.name}
                                            color={SEVERITY_COLORS[cond.severity]?.chip || 'default'}
                                            variant="outlined"
                                            size="small"
                                            icon={<AlertTriangle size={14} />}
                                        />
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* ─── VITALS ANALYSIS SECTION HEADER ──────────────────── */}

                {/* ─── TODAY'S HEALTH PLAN ─────────────────────────────── */}
                {dailyPlan && (
                    <>
                        <Grid size={{ xs: 12 }}>
                            <Card elevation={3} sx={{
                                borderRadius: 3,
                                border: '2px solid #c7d2fe',
                                background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ffffff 100%)'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ p: 1, borderRadius: 2, backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CalendarDays size={28} color="#4f46e5" />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold">
                                                    Today's Health Plan
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {dailyPlan.dayName}, {dailyPlan.date}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            icon={<Sparkles size={14} />}
                                            label="AI Daily Recommendation"
                                            size="small"
                                            sx={{ backgroundColor: '#e0e7ff', color: '#4f46e5', fontWeight: 600 }}
                                        />
                                    </Box>

                                    {/* Daily focus message */}
                                    <Paper elevation={0} sx={{
                                        p: 2, borderRadius: 2, mb: 2.5,
                                        backgroundColor: '#f0fdf4',
                                        border: '1px solid #bbf7d0',
                                        display: 'flex', alignItems: 'flex-start', gap: 1.5
                                    }}>
                                        <Target size={20} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold" color="#15803d" sx={{ mb: 0.25 }}>
                                                Today's Focus
                                            </Typography>
                                            <Typography variant="body2">{dailyPlan.dailyFocus}</Typography>
                                        </Box>
                                    </Paper>

                                    {/* Priority Actions + Progress */}
                                    {allActionItems.length > 0 && (
                                        <Paper elevation={0} sx={{
                                            p: 2, borderRadius: 2, mb: 2.5,
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #cbd5e1'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Target size={16} color="#334155" /> Priority Actions
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {savingProgress && <Typography variant="caption" color="text.secondary">Saving...</Typography>}
                                                    <Chip
                                                        size="small"
                                                        label={`${completedCount}/${allActionItems.length} done`}
                                                        sx={{ fontWeight: 700, backgroundColor: '#eef2ff', color: '#4338ca' }}
                                                    />
                                                </Box>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={progressPct}
                                                sx={{ height: 8, borderRadius: 10, mb: 1.5, backgroundColor: '#e2e8f0', '& .MuiLinearProgress-bar': { backgroundColor: '#4f46e5' } }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                                {progressPct}% complete for today
                                            </Typography>

                                            {[{ key: 'must', title: 'Must Do Now', items: mustDoNow, bg: '#fef2f2', border: '#fecaca' },
                                            { key: 'should', title: 'Should Do Today', items: shouldDoToday, bg: '#fffbeb', border: '#fde68a' },
                                            { key: 'optional', title: 'Optional', items: optionalTasks, bg: '#f8fafc', border: '#e2e8f0' }].map((section) => (
                                                section.items.length > 0 && (
                                                    <Box key={section.key} sx={{ mb: 1.5 }}>
                                                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                                                            {section.title}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                                            {section.items.map((item) => {
                                                                const isDone = !!completedPlanItems[item.id];
                                                                return (
                                                                    <Paper key={item.id} elevation={0} sx={{
                                                                        p: 1.2,
                                                                        borderRadius: 1.5,
                                                                        border: `1px solid ${section.border}`,
                                                                        backgroundColor: section.bg,
                                                                        opacity: isDone ? 0.7 : 1
                                                                    }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                                            <Button
                                                                                onClick={() => togglePlanItem(item.id)}
                                                                                size="small"
                                                                                variant={isDone ? 'contained' : 'outlined'}
                                                                                sx={{ minWidth: 34, px: 0.8, borderRadius: 1.5, mt: 0.2, textTransform: 'none' }}
                                                                            >
                                                                                {isDone ? 'Done' : 'Mark'}
                                                                            </Button>
                                                                            <Box sx={{ flex: 1 }}>
                                                                                <Typography variant="body2" sx={{ textDecoration: isDone ? 'line-through' : 'none' }}>
                                                                                    {item.task}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {item.reason}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    </Paper>
                                                                );
                                                            })}
                                                        </Box>
                                                    </Box>
                                                )
                                            ))}
                                        </Paper>
                                    )}

                                    {/* Daily Tips */}
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                        <Lightbulb size={18} color="#eab308" /> Today's Tips for You
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                                        {dailyPlan.dailyTips.map((tipObj, i) => (
                                            <Paper key={i} elevation={0} sx={{
                                                p: 1.5, borderRadius: 2,
                                                backgroundColor: i % 2 === 0 ? '#fffbeb' : '#fef3c7',
                                                display: 'flex', alignItems: 'flex-start', gap: 1.5,
                                                border: '1px solid #fde68a'
                                            }}>
                                                <Lightbulb size={16} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                                                <Box>
                                                    <Typography variant="body2">{tipObj.tip}</Typography>
                                                    {tipObj.reason && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                                            Why: {tipObj.reason}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>

                                    {/* Daily Routine Schedule */}
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                                        <Clock size={18} color="#4f46e5" /> Your Daily Routine
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {[
                                            { key: 'morning', label: 'Morning', icon: Sun, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                                            { key: 'afternoon', label: 'Afternoon', icon: CloudSun, color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
                                            { key: 'evening', label: 'Evening', icon: Sunset, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
                                            { key: 'night', label: 'Night', icon: Moon, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' }
                                        ].map((slot) => {
                                            const SlotIcon = slot.icon;
                                            return (
                                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={slot.key}>
                                                <Paper elevation={0} sx={{
                                                    p: 2, borderRadius: 2, height: '100%',
                                                    backgroundColor: slot.bg,
                                                    border: `1px solid ${slot.border}`
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                        <SlotIcon size={20} color={slot.color} />
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: slot.color }}>
                                                            {slot.label}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                                        {dailyPlan.routine[slot.key].map((task, i) => (
                                                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                                                                <Typography sx={{ color: slot.color, flexShrink: 0, mt: '1px', fontSize: '0.75rem' }}>●</Typography>
                                                                <Typography variant="caption" sx={{ lineHeight: 1.5 }}>{task}</Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ); })}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </>
                )}

                <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp size={22} color="#3b82f6" /> Vitals Analysis
                    </Typography>
                </Grid>

                {/* ─── VITALS ANALYSIS CARDS ────────────────────────────── */}
                {vitalEntries.map(([key, analysis]) => {
                    const Icon = VITAL_ICONS[key] || Activity;
                    const isNormal = !analysis.isAbnormal;
                    const cardColor = isNormal ? '#10b981' : (analysis.status === 'crisis' || analysis.status === 'highFever' || analysis.status === 'diabetic' ? '#ef4444' : '#f59e0b');

                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                            <Card elevation={2} sx={{
                                borderRadius: 3,
                                borderLeft: `4px solid ${cardColor}`,
                                height: '100%',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-2px)' }
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Icon size={20} color={cardColor} />
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {VITAL_LABELS[key]}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={analysis.label}
                                            size="small"
                                            sx={{
                                                fontSize: '0.65rem',
                                                height: 22,
                                                backgroundColor: isNormal ? '#f0fdf4' : (cardColor === '#ef4444' ? '#fef2f2' : '#fffbeb'),
                                                color: cardColor,
                                                fontWeight: 600
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                                        {analysis.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Target: {analysis.target}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}

                {/* ─── IMMEDIATE ACTIONS ───────────────────────────────── */}
                {recommendations.immediate.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                        <Card elevation={2} sx={{ borderRadius: 3, border: '1px solid #fde68a', background: '#fffbeb' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <AlertTriangle size={20} color="#d97706" /> What You Should Do Now
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {recommendations.immediate.map((action, i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5, borderRadius: 2, backgroundColor: '#ffffff' }}>
                                            <ChevronRight size={16} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                                            <Typography variant="body2">{action}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* ─── DIET PLAN ──────────────────────────────────────── */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Salad size={20} color="#16a34a" /> Diet Recommendations
                            </Typography>

                            {/* Foods to Eat */}
                            <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                <CheckCircle size={16} /> Foods to Include
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                                {recommendations.diet.eat.map((item, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.5 }}>
                                        <Typography sx={{ color: '#22c55e', flexShrink: 0, mt: '2px', fontSize: '0.85rem' }}>✓</Typography>
                                        <Typography variant="body2">{item}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Foods to Avoid */}
                            <Typography variant="subtitle2" fontWeight="bold" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                <Ban size={16} /> Foods to Avoid
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {recommendations.diet.avoid.map((item, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.5 }}>
                                        <Typography sx={{ color: '#ef4444', flexShrink: 0, mt: '2px', fontSize: '0.85rem' }}>✗</Typography>
                                        <Typography variant="body2">{item}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ─── LIFESTYLE TIPS ─────────────────────────────────── */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Dumbbell size={20} color="#9333ea" /> Lifestyle & Wellness Tips
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {recommendations.lifestyle.map((tip, i) => (
                                    <Paper key={i} elevation={0} sx={{
                                        p: 1.5, borderRadius: 2,
                                        backgroundColor: i % 2 === 0 ? '#f8fafc' : '#f0f9ff',
                                        display: 'flex', alignItems: 'flex-start', gap: 1
                                    }}>
                                        <ShieldCheck size={16} color="#a855f7" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Typography variant="body2">{tip}</Typography>
                                    </Paper>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ─── ACTIVE PRESCRIPTIONS / MEDICINES ───────────────── */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Pill size={20} color="#3b82f6" /> Active Medicines
                            </Typography>
                            {(!activePrescriptions || activePrescriptions.length === 0) ? (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    No active prescriptions found. Visit a doctor to get treatment.
                                </Alert>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {activePrescriptions.map((rx, i) => (
                                        <Paper key={i} elevation={0} sx={{
                                            p: 2, borderRadius: 2,
                                            border: '1px solid #e2e8f0',
                                            backgroundColor: '#f8fafc'
                                        }}>
                                            <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                                {rx.medicine}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                <Chip label={`Dosage: ${rx.dosage}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                <Chip label={`Duration: ${rx.duration}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                Prescribed by Dr. {rx.doctor} on {new Date(rx.date).toLocaleDateString()}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* ─── RECOMMENDED TESTS ──────────────────────────────── */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <TestTube size={20} color="#0d9488" /> Recommended Tests
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {recommendations.tests.map((test, i) => (
                                    <Box key={i} sx={{
                                        display: 'flex', alignItems: 'center', gap: 1,
                                        p: 1.5, borderRadius: 2, backgroundColor: '#f0fdfa'
                                    }}>
                                        <TestTube size={14} color="#0d9488" style={{ flexShrink: 0 }} />
                                        <Typography variant="body2">{test}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ─── DOCTOR'S LAST NOTES ────────────────────────────── */}
                <Grid size={{ xs: 12 }}>
                    <Card elevation={2} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Stethoscope size={20} color="#4f46e5" /> Doctor's Last Report
                            </Typography>
                            {!doctorNotes ? (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    No doctor reports available yet. Book an appointment to get examined.
                                </Alert>
                            ) : (
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#f0f9ff', height: '100%' }}>
                                            <Typography variant="caption" color="text.secondary">Diagnosis</Typography>
                                            <Typography variant="body1" fontWeight="bold">{doctorNotes.lastDiagnosis}</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#f0fdf4', height: '100%' }}>
                                            <Typography variant="caption" color="text.secondary">Prescription</Typography>
                                            <Typography variant="body1" fontWeight="bold">{doctorNotes.lastPrescription || 'None'}</Typography>
                                            {doctorNotes.dosage && (
                                                <Typography variant="caption" sx={{ display: 'block' }}>Dosage: {doctorNotes.dosage}</Typography>
                                            )}
                                        </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#fffbeb', height: '100%' }}>
                                            <Typography variant="caption" color="text.secondary">Severity</Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {doctorNotes.severity || 'Not specified'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                                                by Dr. {doctorNotes.doctorName}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#fdf2f8', height: '100%' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CalendarClock size={12} /> Follow-up Date
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {doctorNotes.followUpDate
                                                    ? new Date(doctorNotes.followUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                                    : 'Not scheduled'}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    {doctorNotes.recommendations && (
                                        <Grid size={{ xs: 12 }}>
                                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8fafc' }}>
                                                <Typography variant="caption" color="text.secondary">Doctor's Recommendations</Typography>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>{doctorNotes.recommendations}</Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                    {doctorNotes.testsRecommended && (
                                        <Grid size={{ xs: 12 }}>
                                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#f0f9ff' }}>
                                                <Typography variant="caption" color="text.secondary">Tests Recommended by Doctor</Typography>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>{doctorNotes.testsRecommended}</Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* ─── DISCLAIMER ─────────────────────────────────────── */}
                <Grid size={{ xs: 12 }}>
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        <Typography variant="caption">
                            <strong>Disclaimer:</strong> This health summary is generated based on your self-reported vitals and doctor reports.
                            It is for informational purposes only and does not replace professional medical advice.
                            Always consult your doctor before making changes to your medications or treatment plan.
                        </Typography>
                    </Alert>
                </Grid>
            </Grid>
        </Box>
    );
};

export default HealthSummaryPanel;
