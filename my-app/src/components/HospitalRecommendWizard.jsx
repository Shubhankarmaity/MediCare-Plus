import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronRight, ChevronLeft, Loader2, MapPin, DollarSign,
    Building2, Star, CheckCircle, AlertTriangle, HeartPulse,
    Stethoscope, Siren, FlaskConical, Pill, Ambulance,
    BadgeCheck, Activity, Wallet, Navigation, Search
} from 'lucide-react';
import api from '../services/api';

const SPECIALIZATIONS = [
    'General Medicine', 'Cardiology', 'Orthopedics', 'Neurology', 'Oncology',
    'Pediatrics', 'Gynecology & Maternity', 'Dermatology', 'Urology / Kidney Care',
    'Gastroenterology', 'Pulmonology', 'Endocrinology', 'Psychiatry',
    'Ophthalmology', 'ENT', 'General Surgery', 'Emergency Care',
];

const INSURANCE_COMPANIES = ['HDFC ERGO', 'Niva Bupa'];

const FACILITY_OPTIONS = [
    { key: 'icu', label: 'ICU', icon: Activity, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    { key: 'emergency', label: 'Emergency', icon: Siren, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { key: 'ot', label: 'Operation Theater', icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { key: 'lab', label: 'Diagnostic Lab', icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { key: 'pharmacy', label: 'Pharmacy', icon: Pill, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    { key: 'ambulance', label: 'Ambulance', icon: Ambulance, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { key: 'nabh', label: 'NABH Accredited', icon: BadgeCheck, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
];

const STEPS = ['Medical Needs', 'Financial', 'Facilities', 'Location'];

// ─── Score colour ─────────────────────────────────────────────────
function scoreColor(s) {
    if (s >= 85) return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', bar: 'bg-emerald-500', border: 'border-emerald-200' };
    if (s >= 70) return { text: 'text-sky-500', bg: 'bg-sky-500/10', ring: 'ring-sky-500/20', bar: 'bg-sky-500', border: 'border-sky-200' };
    if (s >= 50) return { text: 'text-amber-500', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20', bar: 'bg-amber-500', border: 'border-amber-200' };
    return { text: 'text-rose-500', bg: 'bg-rose-500/10', ring: 'ring-rose-500/20', bar: 'bg-rose-500', border: 'border-rose-200' };
}

const HospitalRecommendWizard = ({ onSelect, onClose }) => {
    const [step, setStep] = useState(0);        // 0-3 = steps, 4 = results
    const [loading, setLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        condition: '',
        specialization: '',
        urgency: 'routine',
        budget: 5000,
        hasMediclaim: false,
        insuranceCompany: '',
        facilities: [],
        patientLat: null,
        patientLng: null,
        city: '',
    });

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const toggleFacility = (key) => {
        setForm(f => ({
            ...f,
            facilities: f.facilities.includes(key)
                ? f.facilities.filter(x => x !== key)
                : [...f.facilities, key]
        }));
    };

    const getGPS = () => {
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                set('patientLat', pos.coords.latitude);
                set('patientLng', pos.coords.longitude);
                set('city', '');  // GPS takes priority
                setGpsLoading(false);
            },
            () => {
                setError('Could not get your location. Please enter your city manually.');
                setGpsLoading(false);
            },
            { timeout: 8000 }
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/hospitals/ai-recommend', form);
            setResults(res.data.hospitals || []);
            setTotal(res.data.total || 0);
            setStep(4);
        } catch (e) {
            setError('Could not load recommendations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (hosp) => {
        setSelected(hosp.hospitalId);
        onSelect({ _id: hosp.hospitalId, name: hosp.hospitalName, ...hosp });
    };

    // ─── Step validation ─────────────────────────────────────────
    const canNext = () => {
        if (step === 0) return form.condition.trim().length > 0 || form.specialization;
        if (step === 3) return form.patientLat || form.city.trim().length > 0;
        return true;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* ── Header ── */}
                <div className="bg-gradient-to-br from-indigo-700 via-sky-700 to-indigo-900 px-8 py-7 flex items-center justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
                            <HeartPulse className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-extrabold text-xl tracking-tight">AI Hospital Navigator</h2>
                            <p className="text-sky-100/80 text-xs font-medium uppercase tracking-wider">
                                {step < 4
                                    ? `Personalized Healthcare Matching`
                                    : `${total} Hospitals Analyzed · Top Recommendations`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="relative z-10 text-white/70 hover:text-white hover:bg-white/10 p-2.5 rounded-2xl transition-all border border-transparent hover:border-white/10 backdrop-blur-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Modern Step Indicator (steps 0-3) ── */}
                {step < 4 && (
                    <div className="px-8 pt-8 pb-2 shrink-0">
                        <div className="flex items-center justify-between relative">
                            {/* Connector Line */}
                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-0" />
                            <div
                                className="absolute top-5 left-0 h-0.5 bg-sky-500 transition-all duration-700 -z-0"
                                style={{ width: `${(step / 3) * 100}%` }}
                            />

                            {STEPS.map((s, i) => {
                                const isCompleted = i < step;
                                const isActive = i === step;
                                return (
                                    <div key={i} className="flex flex-col items-center gap-2.5 relative z-10 group">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 ${isCompleted ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-200' :
                                            isActive ? 'bg-white border-sky-500 text-sky-600 shadow-xl shadow-sky-100 ring-4 ring-sky-50' :
                                                'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'
                                            }`}>
                                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : i + 1}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-sky-600' : 'text-slate-400'
                                            }`}>
                                            {s.split(' ')[0]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                            </motion.div>
                        )}

                        {/* ════ STEP 0: MEDICAL ════ */}
                        {step === 0 && (
                            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">What are your medical needs?</h3>
                                    <p className="text-sm text-slate-500">Describe your health concern — the AI will match the right specialists.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Describe your condition <span className="text-rose-500">*</span></label>
                                    <div className="relative group">
                                        <div className="absolute top-4 left-4 p-1.5 bg-slate-50 rounded-lg group-focus-within:bg-sky-50 transition-colors">
                                            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-sky-600" />
                                        </div>
                                        <textarea
                                            className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm resize-none focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300 placeholder:text-slate-400 font-medium"
                                            rows={3}
                                            placeholder="e.g. 'I have chest pain and high blood pressure' or 'Need knee surgery consultation'"
                                            value={form.condition}
                                            onChange={e => set('condition', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Preferred Specialization</label>
                                    <select
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all bg-white"
                                        value={form.specialization}
                                        onChange={e => set('specialization', e.target.value)}>
                                        <option value="">Auto-detect from my condition</option>
                                        {SPECIALIZATIONS.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Urgency Level</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { val: 'routine', label: 'Routine', color: 'emerald', icon: '🟢' },
                                            { val: 'semi-urgent', label: 'Urgent', color: 'amber', icon: '🟡' },
                                            { val: 'emergency', label: 'Emergency', color: 'rose', icon: '🔴' },
                                        ].map(u => {
                                            const isActive = form.urgency === u.val;
                                            return (
                                                <button key={u.val} type="button"
                                                    onClick={() => set('urgency', u.val)}
                                                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 relative overflow-hidden ${isActive
                                                        ? `border-${u.color}-500 bg-${u.color}-50/50 shadow-lg shadow-${u.color}-100`
                                                        : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white'
                                                        }`}>
                                                    <div className="text-xl mb-1">{u.icon}</div>
                                                    <div className={`text-sm font-black ${isActive ? `text-${u.color}-700` : 'text-slate-600'}`}>{u.label}</div>
                                                    {isActive && <motion.div layoutId="urgency-glow" className={`absolute -inset-1 bg-${u.color}-500/10 blur-xl -z-10`} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ════ STEP 1: FINANCIAL ════ */}
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Financial Preferences</h3>
                                    <p className="text-sm text-slate-500">Help us find hospitals that fit your budget.</p>
                                </div>

                                <div className="space-y-5 bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-sky-600/10 p-2 rounded-lg"><Wallet className="w-4 h-4 text-sky-600" /></div>
                                            <label className="text-sm font-extrabold text-slate-800">Monthly Budget</label>
                                        </div>
                                        <div className="bg-white border border-slate-100 shadow-sm rounded-xl px-4 py-2 ring-4 ring-slate-100/50">
                                            <span className="text-sky-600 font-black text-lg">₹{form.budget.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <input type="range" min={500} max={100000} step={500}
                                            className="w-full accent-sky-600 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                                            value={form.budget}
                                            onChange={e => set('budget', +e.target.value)} />
                                        <div className="flex justify-between text-[10px] font-black text-slate-400 mt-3 px-1">
                                            <span>₹500 (BASIC)</span>
                                            <span className="text-sky-400">₹50K</span>
                                            <span>₹100K+ (PREMIUM)</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[2000, 5000, 15000, 30000].map(v => (
                                            <button key={v} type="button" onClick={() => set('budget', v)}
                                                className={`py-2.5 rounded-xl border-2 text-xs font-black transition-all ${form.budget === v ? 'border-sky-500 bg-white text-sky-600 shadow-lg shadow-sky-100' : 'border-slate-100 bg-white text-slate-500 hover:border-sky-200'}`}>
                                                ₹{(v / 1000)}K
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Insurance & Mediclaim</label>
                                    <div className="flex gap-4">
                                        {[
                                            { v: true, label: 'Yes, Covered', icon: ShieldCheck, color: 'emerald' },
                                            { v: false, label: 'Not Covered', icon: XCircle, color: 'rose' }
                                        ].map(opt => (
                                            <button key={String(opt.v)} type="button"
                                                onClick={() => { set('hasMediclaim', opt.v); if (!opt.v) set('insuranceCompany', ''); }}
                                                className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 ${form.hasMediclaim === opt.v ? `border-${opt.color}-500 bg-${opt.color}-50/50 shadow-lg shadow-${opt.color}-100` : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-white'}`}>
                                                <opt.icon className={`w-8 h-8 ${form.hasMediclaim === opt.v ? `text-${opt.color}-600` : 'text-slate-300'}`} />
                                                <span className={`text-sm font-black ${form.hasMediclaim === opt.v ? `text-${opt.color}-700` : ''}`}>{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {form.hasMediclaim && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 pt-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Network</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {INSURANCE_COMPANIES.map(ic => (
                                                    <button key={ic} type="button"
                                                        onClick={() => set('insuranceCompany', ic)}
                                                        className={`p-5 rounded-3xl border-2 text-center transition-all duration-300 ${form.insuranceCompany === ic ? 'border-sky-500 bg-white text-sky-600 shadow-xl shadow-sky-100 ring-4 ring-sky-50' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white'}`}>
                                                        <div className="font-black text-sm">{ic}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Cashless Partner</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ════ STEP 2: FACILITIES ════ */}
                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Required Facilities</h3>
                                    <p className="text-sm text-slate-500">Select the facilities that matter most to you. Hospitals with more matches score higher.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {FACILITY_OPTIONS.map(fac => {
                                        const isOn = form.facilities.includes(fac.key);
                                        return (
                                            <button key={fac.key} type="button" onClick={() => toggleFacility(fac.key)}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${isOn ? `${fac.bg} border-current ${fac.color}` : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                                <div className={`p-2 rounded-xl ${isOn ? 'bg-white/60' : 'bg-slate-100'}`}>
                                                    <fac.icon className={`w-5 h-5 ${isOn ? fac.color : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <div className={`text-sm font-semibold ${isOn ? fac.color : 'text-slate-700'}`}>{fac.label}</div>
                                                    {isOn && <div className="text-xs mt-0.5 opacity-70">Required</div>}
                                                </div>
                                                {isOn && <CheckCircle className={`w-4 h-4 ml-auto ${fac.color}`} />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {form.facilities.length === 0 && (
                                    <p className="text-center text-sm text-slate-400 pt-2">
                                        No preferences? That's fine — the AI will still rank hospitals by all other factors.
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {/* ════ STEP 3: LOCATION ════ */}
                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Your Location</h3>
                                    <p className="text-sm text-slate-500">We'll prioritise hospitals near you. Distance counts for 25% of the match score.</p>
                                </div>

                                <motion.button type="button" onClick={getGPS} disabled={gpsLoading}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className={`w-full group relative flex items-center justify-center gap-4 py-5 rounded-3xl border-2 transition-all font-black text-sm overflow-hidden ${form.patientLat ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xl shadow-emerald-100' : 'border-sky-500/20 bg-sky-50/50 text-sky-700 hover:bg-sky-600 hover:text-white hover:border-sky-600 hover:shadow-2xl hover:shadow-sky-200'}`}>
                                    {gpsLoading ? (
                                        <><Loader2 className="w-6 h-6 animate-spin" /> Detecting location…</>
                                    ) : form.patientLat ? (
                                        <><BadgeCheck className="w-6 h-6 animate-pulse" /> Precision Found ✓ ({form.patientLat.toFixed(2)}, {form.patientLng.toFixed(2)})</>
                                    ) : (
                                        <>
                                            <Navigation className="w-6 h-6 group-hover:animate-bounce" />
                                            <span>Precise GPS Location Detection</span>
                                            <span className="absolute right-6 opacity-20"><ArrowLeft className="w-4 h-4 rotate-180" /></span>
                                        </>
                                    )}
                                </motion.button>

                                <div className="flex items-center gap-3 text-slate-400 text-sm">
                                    <div className="flex-1 h-px bg-slate-200" />OR<div className="flex-1 h-px bg-slate-200" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Enter your city / area</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                            placeholder="e.g. Kolkata, Mumbai, Delhi…"
                                            value={form.city}
                                            onChange={e => { set('city', e.target.value); set('patientLat', null); set('patientLng', null); }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-700">
                                    <strong>💡 How distance scoring works:</strong>
                                    <div className="mt-2 space-y-1 text-xs text-sky-600">
                                        <div>≤ 5 km → 25 pts (max) &nbsp;|&nbsp; ≤ 15 km → 20 pts</div>
                                        <div>≤ 30 km → 15 pts &nbsp;|&nbsp; ≤ 50 km → 8 pts &nbsp;|&nbsp; &gt;50 km → 2 pts</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ════ RESULTS ════ */}
                        {step === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                {results.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-600 font-semibold">No hospitals matched your criteria.</p>
                                        <p className="text-sm text-slate-400 mt-1">Try relaxing your filters or changing your city.</p>
                                        <button onClick={() => setStep(0)}
                                            className="mt-4 px-5 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-all">
                                            Adjust Filters
                                        </button>
                                    </div>
                                ) : results.map((hosp, idx) => {
                                    const isSelected = selected === hosp.hospitalId;
                                    const rankGradient = [
                                        'from-amber-400 to-orange-500 text-white',
                                        'from-slate-300 to-slate-400 text-white',
                                        'from-orange-400 to-amber-700 text-white',
                                        'from-slate-100 to-slate-200 text-slate-400',
                                        'from-slate-100 to-slate-200 text-slate-400'
                                    ][idx] || 'from-slate-50 to-slate-100 text-slate-400';

                                    return (
                                        <motion.div key={hosp.hospitalId}
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => handleSelect(hosp)}
                                            className={`group relative rounded-3xl border-2 p-6 cursor-pointer transition-all duration-300 ${isSelected
                                                ? 'border-sky-500 bg-sky-50/50 shadow-xl shadow-sky-100/50'
                                                : 'border-slate-100 bg-white hover:border-sky-200 hover:shadow-2xl hover:shadow-slate-200/50'}`}>

                                            {/* Top Section: Info + Score */}
                                            <div className="flex items-start justify-between gap-4 mb-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold bg-gradient-to-br ${rankGradient}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <h4 className="font-extrabold text-slate-900 text-lg leading-tight group-hover:text-sky-600 transition-colors">
                                                            {hosp.hospitalName}
                                                        </h4>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400 ml-10">
                                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{hosp.city}</span>
                                                        {hosp.distanceKm !== null && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">
                                                                <Navigation className="w-3 h-3" /> {hosp.distanceKm} km
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Premium Score Badge */}
                                                <div className={`shrink-0 text-center p-3 rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-sm shadow-sm ring-4 ring-white`}>
                                                    <div className={`text-2xl font-black ${colors.text}`}>{hosp.matchScore}%</div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Match</div>
                                                </div>
                                            </div>

                                            {/* Animated Progress Bar */}
                                            <div className="relative h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${hosp.matchScore}%` }}
                                                    transition={{ delay: idx * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                                                    className={`absolute inset-y-0 left-0 rounded-full shadow-[0_0_12px_rgba(14,165,233,0.3)] ${colors.bar}`} />
                                            </div>

                                            {/* Score Breakdown Pills */}
                                            <div className="grid grid-cols-5 gap-2 mb-6">
                                                {[
                                                    { label: 'Spec', val: hosp.breakdown?.specialty, max: 30, icon: Stethoscope },
                                                    { label: 'Dist', val: hosp.breakdown?.distance, max: 25, icon: MapPin },
                                                    { label: 'Cost', val: hosp.breakdown?.budget, max: 20, icon: Wallet },
                                                    { label: 'Fac', val: hosp.breakdown?.facilities, max: 15, icon: Building2 },
                                                    { label: 'Star', val: hosp.breakdown?.rating, max: 10, icon: Star },
                                                ].map(b => (
                                                    <div key={b.label} className="bg-slate-50/80 rounded-2xl p-2.5 text-center border border-slate-100 group-hover:bg-white transition-colors">
                                                        <b.icon className="w-3.5 h-3.5 mx-auto mb-1 text-slate-400" />
                                                        <div className="text-xs font-black text-slate-800">{b.val ?? '–'}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{b.label}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Specialty & Facility Badges */}
                                            <div className="flex flex-wrap gap-2 mb-6 ml-1">
                                                {hosp.specialties && (
                                                    <span className="bg-sky-50 text-sky-600 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg border border-sky-100">{hosp.specialties}</span>
                                                )}
                                                {hosp.naabhAccredited && (
                                                    <span className="bg-amber-50 text-amber-600 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg border border-amber-100 flex items-center gap-1.5">
                                                        <BadgeCheck className="w-3.5 h-3.5" /> NABH
                                                    </span>
                                                )}
                                                {hosp.cashlessAvailable && (
                                                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg border border-emerald-100">Cashless</span>
                                                )}
                                            </div>

                                            {/* Cost & Quality Card */}
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm group-hover:border-sky-100 transition-colors">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fee Predictor</div>
                                                    <div className="text-lg font-black text-slate-900">
                                                        {hosp.consultationFee ? `₹${hosp.consultationFee}` : 'Variable'}
                                                    </div>
                                                </div>
                                                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm group-hover:border-sky-100 transition-colors">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Patient Trust</div>
                                                    <div className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                                                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                                        {hosp.rating}
                                                        <span className="text-xs text-slate-400 font-bold ml-1">({hosp.totalReviews || 0})</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI Reasoning Block */}
                                            <div className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden group-hover:shadow-lg transition-all">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl font-bold" />
                                                <div className="flex items-start gap-3 relative z-10">
                                                    <div className="bg-sky-500/20 p-2 rounded-xl border border-sky-500/30">
                                                        <Activity className="w-4 h-4 text-sky-400" />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                                                        "{hosp.reason}"
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Select Action */}
                                            <motion.div
                                                className={`mt-6 py-4 rounded-2xl text-center font-extrabold text-sm transition-all border-2 ${isSelected
                                                    ? 'bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-200'
                                                    : 'border-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600'
                                                    }`}
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {isSelected ? 'Hospital Selected ✓' : 'Select This Match'}
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Footer ── */}
                <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50 backdrop-blur-sm">
                    {step === 4 ? (
                        <>
                            <button onClick={() => { setStep(0); setResults([]); setSelected(null); }}
                                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-all">
                                <ChevronLeft className="w-4 h-4" /> Redo Search
                            </button>
                            <button onClick={onClose} disabled={!selected}
                                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
                                Confirm Selection <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
                                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-all">
                                <ChevronLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
                            </button>

                            {step < 3 ? (
                                <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button onClick={handleSubmit} disabled={loading || !canNext()}
                                    className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-200">
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><HeartPulse className="w-4 h-4" /> Find Best Hospitals</>}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default HospitalRecommendWizard;
