import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Stethoscope, Ambulance, Shield, ArrowLeft,
  Mail, Lock, Phone, Calendar, MapPin,
  AlertCircle, ChevronRight, Building, Clock,
  CheckCircle, XCircle, Star, BadgeCheck, Banknote,
  HeartPulse, Loader2, ShieldCheck, Award, ThumbsUp
} from 'lucide-react';
import authService from '../services/authService';
import hospitalService from '../services/hospitalService';
import api from '../services/api';
import hospitalImg from '../assets/images/hospital4.avif';
import HospitalRecommendWizard from '../components/HospitalRecommendWizard';

const roleCards = [
  { id: 'patient', label: 'Patient', icon: User, description: 'Find doctors & book appointments.', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, description: 'Register your clinic availability.', color: 'bg-teal-50 text-teal-600 border-teal-200' },
  { id: 'driver', label: 'Driver', icon: Ambulance, description: 'Join emergency response network.', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { id: 'admin', label: 'Admin', icon: Shield, description: 'Manage hospital resources.', color: 'bg-violet-50 text-violet-600 border-violet-200' }
];

const INSURANCE_COMPANIES = [
  {
    id: 'HDFC ERGO',
    label: 'HDFC ERGO',
    description: '5 network hospitals across West Bengal',
    color: 'from-blue-600 to-blue-800',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'Niva Bupa',
    label: 'Niva Bupa',
    description: '5 network hospitals across West Bengal',
    color: 'from-purple-600 to-purple-800',
    badgeColor: 'bg-purple-100 text-purple-700',
  }
];

const InputField = ({ label, type = "text", value, onChange, required = true, icon: Icon, placeholder }) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
        </div>
      )}
      <input
        type={type}
        required={required}
        className={`block w-full ${Icon ? 'pl-10' : 'pl-4'} pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 sm:text-sm`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, required = true, disabled = false, placeholder = "Select..." }) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>
    <div className="relative">
      <select
        required={required}
        disabled={disabled}
        className="block w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 sm:text-sm appearance-none disabled:bg-slate-100 disabled:text-slate-400"
        value={value}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronRight className="h-5 w-5 text-slate-400 rotate-90" />
      </div>
    </div>
  </div>
);

// --- Hospital Recommendation Card ---
const HospitalRecommendCard = ({ hospital, rank, onSelect, isSelected }) => {
  const rankColor = rank === 1 ? 'from-amber-400 to-orange-500' : rank === 2 ? 'from-slate-400 to-slate-500' : 'from-orange-700 to-amber-700';
  const rankLabel = rank === 1 ? '🥇 Best Match' : rank === 2 ? '🥈 2nd Match' : '🥉 3rd Match';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${isSelected
        ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100'
        : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'
        }`}
    >
      {/* Rank Badge */}
      <div className={`absolute -top-3 left-4 bg-gradient-to-r ${rankColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
        {rankLabel}
      </div>

      {/* Match Score */}
      <div className="absolute top-3 right-4 flex items-center gap-1.5">
        <div className="text-right">
          <div className="text-lg font-black text-sky-600">{hospital.matchScore}%</div>
          <div className="text-xs text-slate-400">match</div>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hospital.matchScore >= 70 ? 'bg-green-100' : hospital.matchScore >= 50 ? 'bg-yellow-100' : 'bg-slate-100'}`}>
          <HeartPulse className={`w-5 h-5 ${hospital.matchScore >= 70 ? 'text-green-600' : hospital.matchScore >= 50 ? 'text-yellow-600' : 'text-slate-500'}`} />
        </div>
      </div>

      <div className="mt-3 pr-20">
        <h4 className="font-bold text-slate-900 text-sm leading-tight">{hospital.hospitalName}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{hospital.city}</p>
      </div>

      {/* Specialty + badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {hospital.specialties && (
          <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-medium">{hospital.specialties}</span>
        )}
        {hospital.cashlessAvailable && (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Banknote className="w-3 h-3" /> Cashless
          </span>
        )}
        {hospital.coveragePct && (
          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {hospital.coveragePct}% Coverage
          </span>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mt-2">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="text-xs font-semibold text-slate-700">{hospital.rating}</span>
      </div>

      {/* AI Reason */}
      <p className="mt-2 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
        🤖 {hospital.reason}
      </p>

      {/* Select indicator */}
      {isSelected && (
        <div className="mt-2 flex items-center gap-1 text-sky-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">Selected</span>
        </div>
      )}
    </motion.div>
  );
};

// --- Insurance Hospital Card ---
const InsuranceHospitalCard = ({ hospital, onSelect, isSelected }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    onClick={onSelect}
    className={`cursor-pointer rounded-xl border-2 p-3.5 transition-all duration-200 ${isSelected ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-300'
      }`}
  >
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <h5 className="font-semibold text-slate-900 text-sm truncate">{hospital.name}</h5>
        <p className="text-xs text-slate-500">{hospital.city} · {hospital.pincode}</p>
      </div>
      <div className="flex items-center gap-1 ml-2 shrink-0">
        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
        <span className="text-xs font-bold text-slate-700">{hospital.rating}</span>
      </div>
    </div>

    <div className="flex flex-wrap gap-1 mt-2">
      {hospital.specialties && <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full">{hospital.specialties}</span>}
      {hospital.cashlessAvailable && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Cashless</span>}
      {hospital.naabhAccredited && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">NABH</span>}
      {hospital.hasICU && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">ICU</span>}
    </div>

    <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-slate-500">
      <span>🛏 {hospital.totalBeds || hospital.Beds || 'N/A'} Beds</span>
      <span>💰 ₹{hospital.consultationFee || 'N/A'} consult</span>
      {hospital.coveragePct && <span>📊 {hospital.coveragePct}% covered</span>}
      {hospital.tpa && <span>🏢 {hospital.tpa}</span>}
    </div>

    {isSelected && (
      <div className="mt-2 flex items-center gap-1 text-sky-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-xs font-semibold">Selected</span>
      </div>
    )}
  </motion.div>
);

const Signup = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Mediclaim state
  const [hasMediclaim, setHasMediclaim] = useState(null);       // null | true | false
  const [mediclaimProvider, setMediclaimProvider] = useState('');
  const [insuranceHospitals, setInsuranceHospitals] = useState([]);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedHospitalName, setSelectedHospitalName] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    phone: '', age: '', gender: '', bloodGroup: '', address: '',
    emergencyContact: '', medicalHistory: '', allergies: '',
    specialization: '', experience: '', qualification: '',
    consultationFee: '', availableDays: '', availableTime: '',
    doctorPhone: '', licenseNumber: '',
    vehicleNumber: '', driverLicenseNumber: '', vehicleType: '', driverPhone: '',
    hospitalId: '', department: ''
  });

  useEffect(() => {
    if (['admin', 'doctor', 'patient'].includes(selectedRole)) {
      hospitalService.getAll()
        .then(data => setHospitals(data))
        .catch(err => console.error("Error fetching hospitals:", err));
    }
  }, [selectedRole]);

  const availableDepartments = useMemo(() => {
    if (!formData.hospitalId) return [];
    const hospital = [...hospitals, ...insuranceHospitals].find(h => h._id === formData.hospitalId);
    return hospital?.facilities || [];
  }, [formData.hospitalId, hospitals, insuranceHospitals]);

  // Fetch insurance hospitals when provider is selected
  const fetchInsuranceHospitals = useCallback(async (company) => {
    setInsuranceLoading(true);
    setInsuranceHospitals([]);
    setFormData(prev => ({ ...prev, hospitalId: '' }));
    try {
      const res = await api.get(`/api/hospitals/by-insurance?company=${encodeURIComponent(company)}`);
      setInsuranceHospitals(res.data);
    } catch (err) {
      console.error('Failed to fetch insurance hospitals:', err);
    } finally {
      setInsuranceLoading(false);
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const finalData = {
      ...formData,
      role: selectedRole,
      hasMediclaim: hasMediclaim || false,
      mediclaimProvider: mediclaimProvider || ''
    };
    try {
      const data = await authService.register(finalData);
      if (data.requiresVerification) {
        setRegisteredEmail(data.email);
        setStep(3);
      } else if (data.requiresApproval) {
        alert(data.message);
        navigate('/login');
      } else {
        alert("Registration Successful! Please Login.");
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.verifyEmail({ email: registeredEmail, otp });
      alert('Email verified successfully! Please Login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediclaimToggle = (val) => {
    setHasMediclaim(val);
    setMediclaimProvider('');
    setInsuranceHospitals([]);
    setFormData(prev => ({ ...prev, hospitalId: '' }));
  };

  const handleProviderSelect = (company) => {
    setMediclaimProvider(company);
    fetchInsuranceHospitals(company);
  };

  const currentRoleDetails = roleCards.find(r => r.id === selectedRole);
  const displayedHospitals = hasMediclaim ? insuranceHospitals : hospitals;

  return (
    <>
      <div className="min-h-screen flex w-full bg-slate-50">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900"
        >
          <Link to="/" className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
            <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-all backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="absolute inset-0 bg-gradient-to-br from-sky-600/90 to-indigo-900/90 z-10" />
          <img src={hospitalImg} alt="Hospital" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
          <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
            <div className="flex items-center gap-2 mt-12">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">MediCare Plus</span>
            </div>
            <div className="space-y-6 max-w-lg">
              <h1 className="text-5xl font-bold leading-tight">
                Join Our <br />
                <span className="text-sky-300">Healthcare Network.</span>
              </h1>
              <p className="text-lg text-slate-200 leading-relaxed">
                Whether you are a patient, doctor, or administrator, we provide the tools you need for better health management.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300 font-medium">
              <span>© 2026 MediCare Plus</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <Link to="/privacy" className="hover:text-white transition cursor-pointer">Privacy Policy</Link>
            </div>
          </div>
        </motion.div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 h-screen overflow-y-auto bg-white relative">
          <div className="w-full max-w-xl mx-auto p-8 lg:p-12 min-h-full flex flex-col justify-center">

            {/* Mobile Home Button */}
            <div className="lg:hidden w-full mb-6">
              <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>
            </div>

            <AnimatePresence mode="wait">
              {!selectedRole ? (
                // VIEW 1: ROLE SELECTION
                <motion.div key="role-selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  <div className="text-center lg:text-left space-y-2">
                    <div className="inline-flex lg:hidden items-center gap-2 mb-6">
                      <div className="bg-sky-600 p-2 rounded-lg"><Stethoscope className="w-6 h-6 text-white" /></div>
                      <span className="text-xl font-bold text-slate-900">MediCare Plus</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h2>
                    <p className="text-slate-600">Select your profile type to get started.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {roleCards.map((role) => (
                      <motion.button
                        key={role.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setSelectedRole(role.id); setStep(2); }}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group hover:shadow-lg ${role.color} hover:border-current bg-white border-slate-100 hover:bg-opacity-5`}
                      >
                        <div className={`p-3 rounded-xl inline-block mb-4 ${role.color} bg-opacity-20`}>
                          <role.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{role.label}</h3>
                        <p className="text-sm text-slate-500 leading-snug">{role.description}</p>
                      </motion.button>
                    ))}
                  </div>
                  <div className="text-center pt-4">
                    <p className="text-slate-600 text-sm">
                      Already have an account?{' '}
                      <Link to="/login" className="font-bold text-sky-600 hover:text-sky-500 transition-colors">Sign in</Link>
                    </p>
                  </div>
                </motion.div>

              ) : step === 3 ? (
                // VIEW 3: OTP
                <motion.div key="otp-verification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }} className="space-y-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 text-sky-600 mb-4">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Verify Email</h2>
                  <p className="text-slate-600">
                    We sent a 6-digit OTP to <strong>{registeredEmail}</strong>.<br />Please enter it below.
                  </p>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 justify-center">
                      <AlertCircle className="w-4 h-4" />{error}
                    </div>
                  )}
                  <form onSubmit={handleVerifyOtp} className="space-y-6 max-w-sm mx-auto">
                    <input
                      type="text" required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-center tracking-widest text-2xl font-bold"
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                    <button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Account'}
                    </button>
                  </form>
                </motion.div>

              ) : (
                // VIEW 2: REGISTRATION FORM
                <motion.div key="registration-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => { setSelectedRole(null); setStep(1); }} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Sign up as {currentRoleDetails?.label}</h2>
                      <p className="text-sm text-slate-500">Please fill in your details</p>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />{error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 gap-5">
                      <InputField label="Full Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} icon={User} placeholder="John Doe" />
                      <InputField label="Email Address" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} type="email" icon={Mail} placeholder="john@example.com" />
                      <InputField label="Password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} type="password" icon={Lock} placeholder="••••••••" />
                    </div>

                    <div className="space-y-5 pt-2">

                      {/* ======================== PATIENT FIELDS ======================== */}
                      {selectedRole === 'patient' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <InputField label="Age" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} type="number" placeholder="25" />
                            <SelectField label="Gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} options={[
                              { label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }, { label: 'Other', value: 'Other' }
                            ]} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <InputField label="Phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} icon={Phone} placeholder="+91 9876..." />
                            <SelectField label="Blood Group" value={formData.bloodGroup} onChange={(e) => handleInputChange('bloodGroup', e.target.value)} options={[
                              { label: 'A+', value: 'A+' }, { label: 'B+', value: 'B+' }, { label: 'O+', value: 'O+' }, { label: 'AB+', value: 'AB+' },
                              { label: 'A-', value: 'A-' }, { label: 'B-', value: 'B-' }, { label: 'O-', value: 'O-' }, { label: 'AB-', value: 'AB-' }
                            ]} />
                          </div>
                          <InputField label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} icon={MapPin} placeholder="123 Main St" />
                          <InputField label="Emergency Contact" value={formData.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e.target.value)} icon={Phone} placeholder="Guardian Name & Phone" />

                          <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Medical History</label>
                            <textarea
                              className="block w-full px-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all sm:text-sm"
                              rows="3"
                              placeholder="e.g. Diabetes, Hypertension, Heart condition, Kidney issues..."
                              value={formData.medicalHistory}
                              onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                            />
                            <p className="text-xs text-slate-400 ml-1">💡 Describe your conditions for AI-powered hospital matching</p>
                          </div>

                          {/* ======= MEDICLAIM SECTION ======= */}
                          <div className="border-t border-slate-100 pt-5">
                            <div className="flex items-center gap-2 mb-4">
                              <ShieldCheck className="w-5 h-5 text-sky-600" />
                              <p className="text-sm font-bold text-slate-900">Health Insurance (Mediclaim)</p>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Do you have a health insurance / mediclaim policy?</p>

                            {/* YES / NO Toggle */}
                            <div className="grid grid-cols-2 gap-3">
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleMediclaimToggle(true)}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${hasMediclaim === true
                                  ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-green-400'
                                  }`}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Yes, I have Mediclaim
                              </motion.button>
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleMediclaimToggle(false)}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${hasMediclaim === false
                                  ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-rose-400'
                                  }`}
                              >
                                <XCircle className="w-4 h-4" />
                                No Mediclaim
                              </motion.button>
                            </div>

                            {/* === IF HAS MEDICLAIM: Choose Provider === */}
                            <AnimatePresence>
                              {hasMediclaim === true && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-5 space-y-4 overflow-hidden"
                                >
                                  <p className="text-xs font-semibold text-slate-700">Select your insurance provider:</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    {INSURANCE_COMPANIES.map(ins => (
                                      <motion.button
                                        key={ins.id}
                                        type="button"
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleProviderSelect(ins.id)}
                                        className={`relative rounded-xl p-4 text-left border-2 transition-all ${mediclaimProvider === ins.id
                                          ? 'border-sky-500 shadow-md'
                                          : 'border-slate-200 hover:border-sky-300'
                                          }`}
                                      >
                                        <div className={`inline-block bg-gradient-to-r ${ins.color} text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2`}>
                                          {ins.label}
                                        </div>
                                        <p className="text-xs text-slate-500 leading-tight">{ins.description}</p>
                                        {mediclaimProvider === ins.id && (
                                          <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-sky-600" />
                                        )}
                                      </motion.button>
                                    ))}
                                  </div>

                                  {/* Insurance Hospitals Loading */}
                                  {insuranceLoading && (
                                    <div className="flex items-center gap-2 text-sky-600 py-4">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span className="text-sm">Fetching network hospitals...</span>
                                    </div>
                                  )}

                                  {/* Insurance Hospital Cards */}
                                  {!insuranceLoading && insuranceHospitals.length > 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">

                                      {/* AI RECOMMENDATION CTA (WIZARD) */}
                                      {formData.medicalHistory && (
                                        <motion.button
                                          type="button"
                                          onClick={() => setShowWizard(true)}
                                          whileHover={{ scale: 1.01 }}
                                          whileTap={{ scale: 0.98 }}
                                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-sky-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all"
                                        >
                                          <HeartPulse className="w-4 h-4" />
                                          🤖 Use AI to Find Best Network Hospital
                                        </motion.button>
                                      )}



                                      {/* ALL INSURANCE HOSPITALS */}
                                      <div className="grid grid-cols-1 gap-2">
                                        {insuranceHospitals.map(h => (
                                          <InsuranceHospitalCard
                                            key={h._id}
                                            hospital={h}
                                            isSelected={formData.hospitalId === h._id}
                                            onSelect={() => handleInputChange('hospitalId', h._id)}
                                          />
                                        ))}
                                      </div>

                                      {!formData.hospitalId && (
                                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                          ⚠️ Please select a hospital to continue registration
                                        </p>
                                      )}
                                    </motion.div>
                                  )}

                                  {/* No hospitals found */}
                                  {!insuranceLoading && mediclaimProvider && insuranceHospitals.length === 0 && (
                                    <div className="text-center py-4 text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-200">
                                      No network hospitals found for {mediclaimProvider}
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* === IF NO MEDICLAIM: AI Recommendation + fallback dropdown === */}
                            <AnimatePresence>
                              {hasMediclaim === false && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-5 overflow-hidden space-y-4"
                                >
                                  {/* AI Recommendation primary CTA */}
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowWizard(true)}
                                    className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-sky-200 hover:shadow-xl transition-all"
                                  >
                                    <HeartPulse className="w-5 h-5" />
                                    🤖 Find Best Hospital with AI
                                    <ChevronRight className="w-4 h-4" />
                                  </motion.button>

                                  {selectedHospitalName && (
                                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                      className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                      <div>
                                        <p className="text-sm font-bold text-emerald-800">Hospital Selected ✓</p>
                                        <p className="text-xs text-emerald-600">{selectedHospitalName}</p>
                                      </div>
                                      <button type="button" onClick={() => { setSelectedHospitalName(''); handleInputChange('hospitalId', ''); }}
                                        className="ml-auto text-emerald-400 hover:text-emerald-600 transition-colors">
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </motion.div>
                                  )}

                                  {/* Fallback: plain dropdown */}
                                  <details className="group">
                                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-sky-600 flex items-center gap-1 select-none">
                                      <Building className="w-3 h-3" /> Or choose manually from all hospitals
                                    </summary>
                                    <div className="mt-2">
                                      <SelectField
                                        label=""
                                        required={false}
                                        value={formData.hospitalId}
                                        onChange={(e) => {
                                          const h = hospitals.find(h => h._id === e.target.value);
                                          handleInputChange('hospitalId', e.target.value);
                                          setSelectedHospitalName(h ? `${h.name} (${h.city})` : '');
                                        }}
                                        options={hospitals.map(h => ({ label: `${h.name} (${h.city})`, value: h._id }))}
                                      />
                                    </div>
                                  </details>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Department (visible after hospital selected) */}
                            {formData.hospitalId && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                                <SelectField
                                  label="Preferred Department"
                                  value={formData.department}
                                  onChange={(e) => handleInputChange('department', e.target.value)}
                                  required={false}
                                  options={[
                                    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology',
                                    'Radiology', 'Emergency Medicine', 'Internal Medicine', 'Surgery',
                                    'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT', 'Psychiatry', 'General'
                                  ].map(d => ({ label: d, value: d }))}
                                />
                                <p className="text-xs text-slate-400 ml-1 mt-1">💡 Admin will confirm your final department on approval</p>
                              </motion.div>
                            )}
                          </div>
                        </>
                      )}

                      {/* DOCTOR FIELDS */}
                      {selectedRole === 'doctor' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <InputField label="License Number" value={formData.licenseNumber} onChange={(e) => handleInputChange('licenseNumber', e.target.value)} placeholder="MED123456" />
                            <InputField label="Experience (Years)" value={formData.experience} onChange={(e) => handleInputChange('experience', e.target.value)} type="number" placeholder="5" />
                          </div>
                          <InputField label="Qualification" value={formData.qualification} onChange={(e) => handleInputChange('qualification', e.target.value)} placeholder="MBBS, MD Cardiology" />
                          <InputField label="Specialization" value={formData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} placeholder="Cardiologist" />
                          <SelectField label="Hospital / Clinic" value={formData.hospitalId} onChange={(e) => handleInputChange('hospitalId', e.target.value)}
                            options={hospitals.map(h => ({ label: `${h.name} (${h.city})`, value: h._id }))} />
                          <div className="grid grid-cols-2 gap-4">
                            <InputField label="Consultation Fee (₹)" value={formData.consultationFee} onChange={(e) => handleInputChange('consultationFee', e.target.value)} type="number" placeholder="500" />
                            <InputField label="Contact Phone" value={formData.doctorPhone} onChange={(e) => handleInputChange('doctorPhone', e.target.value)} icon={Phone} placeholder="+91 9876..." />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <InputField label="Available Days" value={formData.availableDays} onChange={(e) => handleInputChange('availableDays', e.target.value)} icon={Calendar} placeholder="Mon-Fri" />
                            <InputField label="Available Time" value={formData.availableTime} onChange={(e) => handleInputChange('availableTime', e.target.value)} icon={Clock} placeholder="9:00 AM - 5:00 PM" />
                          </div>
                        </>
                      )}

                      {/* DRIVER FIELDS */}
                      {selectedRole === 'driver' && (
                        <>
                          <InputField label="Driver License" value={formData.driverLicenseNumber} onChange={(e) => handleInputChange('driverLicenseNumber', e.target.value)} placeholder="DL-1234567890" />
                          <div className="grid grid-cols-2 gap-4">
                            <InputField label="Vehicle Number" value={formData.vehicleNumber} onChange={(e) => handleInputChange('vehicleNumber', e.target.value)} placeholder="WB-01-AB-1234" />
                            <InputField label="Vehicle Type" value={formData.vehicleType} onChange={(e) => handleInputChange('vehicleType', e.target.value)} placeholder="ALS Ambulance" />
                          </div>
                          <InputField label="Contact Phone" value={formData.driverPhone} onChange={(e) => handleInputChange('driverPhone', e.target.value)} icon={Phone} placeholder="+91 9876..." />
                        </>
                      )}

                      {/* ADMIN FIELDS */}
                      {selectedRole === 'admin' && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <SelectField label="Select Hospital to Manage" value={formData.hospitalId} onChange={(e) => handleInputChange('hospitalId', e.target.value)}
                            options={hospitals.map(h => ({
                              label: `${h.name} (${h.city}) ${h.adminId ? '⚠️ Admin Exists' : '✅ Available'}`,
                              value: h._id
                            }))}
                          />
                          <p className="text-xs text-slate-500 mt-2 ml-1">Only hospitals without an assigned administrator are available.</p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || (selectedRole === 'patient' && hasMediclaim === true && !formData.hospitalId)}
                      className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── AI Hospital Wizard Modal ── */}
      <AnimatePresence>
        {showWizard && (
          <HospitalRecommendWizard
            onSelect={(hosp) => {
              handleInputChange('hospitalId', hosp._id || hosp.hospitalId);
              setSelectedHospitalName(`${hosp.hospitalName} (${hosp.city})`);
              setShowWizard(false);
            }}
            onClose={() => setShowWizard(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Signup;