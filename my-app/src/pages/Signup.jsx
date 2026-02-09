import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Stethoscope, Ambulance, Shield, ArrowLeft,
  Mail, Lock, Phone, Calendar, Heart, MapPin,
  AlertCircle, CheckCircle, ChevronRight, Building, Clock
} from 'lucide-react';
import authService from '../services/authService';
import hospitalService from '../services/hospitalService';
import hospitalImg from '../assets/images/hospital4.avif'; // Using same image as login for consistency

const roleCards = [
  { id: 'patient', label: 'Patient', icon: User, description: 'Find doctors & book appointments.', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, description: 'Register your clinic availability.', color: 'bg-teal-50 text-teal-600 border-teal-200' },
  { id: 'driver', label: 'Driver', icon: Ambulance, description: 'Join emergency response network.', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { id: 'admin', label: 'Admin', icon: Shield, description: 'Manage hospital resources.', color: 'bg-violet-50 text-violet-600 border-violet-200' }
];

const Signup = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');

  // Initial State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    phone: '', age: '', gender: '', bloodGroup: '', address: '',
    emergencyContact: '', medicalHistory: '',
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
    const hospital = hospitals.find(h => h._id === formData.hospitalId);
    return hospital ? hospital.facilities : [];
  }, [formData.hospitalId, hospitals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalData = { ...formData, role: selectedRole };

    try {
      const data = await authService.register(finalData);
      if (data.requiresApproval) {
        alert(data.message);
      } else {
        alert("Registration Successful! Please Login.");
      }
      navigate('/login');
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentRoleDetails = roleCards.find(r => r.id === selectedRole);

  const InputField = ({ label, type = "text", field, required = true, icon: Icon, placeholder }) => (
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
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
        />
      </div>
    </div>
  );

  const SelectField = ({ label, field, options, required = true, disabled = false, placeholder = "Select..." }) => (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>
      <div className="relative">
        <select
          required={required}
          disabled={disabled}
          className="block w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 sm:text-sm appearance-none disabled:bg-slate-100 disabled:text-slate-400"
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
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

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      {/* Left Side - Hero Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900"
      >
        {/* Desktop Home Button */}
        <Link to="/" className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
          <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-all backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/90 to-indigo-900/90 z-10" />
        <img
          src={hospitalImg}
          alt="Hospital Building"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
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
            <span>© 2024 MediCare Plus</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <Link to="/privacy" className="hover:text-white transition cursor-pointer">Privacy Policy</Link>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form Container */}
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
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center lg:text-left space-y-2">
                  {/* Mobile Logo */}
                  <div className="inline-flex lg:hidden items-center gap-2 mb-6">
                    <div className="bg-sky-600 p-2 rounded-lg">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
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
                      onClick={() => setSelectedRole(role.id)}
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
                    <Link to="/login" className="font-bold text-sky-600 hover:text-sky-500 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              // VIEW 2: REGISTRATION FORM
              <motion.div
                key="registration-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Sign up as {currentRoleDetails?.label}</h2>
                    <p className="text-sm text-slate-500">Please fill in your professional details</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5">
                    {/* Common Fields */}
                    <InputField label="Full Name" field="name" icon={User} placeholder="John Doe" />
                    <InputField label="Email Address" field="email" type="email" icon={Mail} placeholder="john@example.com" />
                    <InputField label="Password" field="password" type="password" icon={Lock} placeholder="••••••••" />
                  </div>

                  {/* Dynamic Fields Based on Role */}
                  <div className="space-y-5 pt-2">

                    {/* PATIENT FIELDS */}
                    {selectedRole === 'patient' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="Age" field="age" type="number" placeholder="25" />
                          <SelectField label="Gender" field="gender" options={[
                            { label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }, { label: 'Other', value: 'Other' }
                          ]} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="Phone" field="phone" icon={Phone} placeholder="+1 234..." />
                          <SelectField label="Blood Group" field="bloodGroup" options={[
                            { label: 'A+', value: 'A+' }, { label: 'B+', value: 'B+' }, { label: 'O+', value: 'O+' }, { label: 'AB+', value: 'AB+' },
                            { label: 'A-', value: 'A-' }, { label: 'B-', value: 'B-' }, { label: 'O-', value: 'O-' }, { label: 'AB-', value: 'AB-' }
                          ]} />
                        </div>
                        <InputField label="Address" field="address" icon={MapPin} placeholder="123 Main St" />
                        <InputField label="Emergency Contact" field="emergencyContact" icon={Phone} placeholder="Parent/Guardian Name & Phone" />

                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-700 ml-1">Medical History</label>
                          <textarea
                            className="block w-full px-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 sm:text-sm"
                            rows="3"
                            placeholder="Allergies, chronic conditions, etc."
                            value={formData.medicalHistory}
                            onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                          />
                        </div>

                        <div className="pt-4 border-t border-slate-100 mt-4">
                          <p className="text-sm font-medium text-slate-900 mb-4">Hospital Admission Preferences</p>
                          <SelectField label="Preferred Hospital" field="hospitalId"
                            options={hospitals.map(h => ({ label: `${h.name} (${h.city})`, value: h._id }))}
                          />
                          <div className="mt-4">
                            <SelectField label="Department" field="department" disabled={!formData.hospitalId}
                              options={availableDepartments.map(d => ({ label: d, value: d }))}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* DOCTOR FIELDS */}
                    {selectedRole === 'doctor' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="License Number" field="licenseNumber" placeholder="MED123456" />
                          <InputField label="Experience (Years)" field="experience" type="number" placeholder="5" />
                        </div>
                        <InputField label="Qualification" field="qualification" placeholder="MBBS, MD Cardiology" />
                        <InputField label="Specialization" field="specialization" placeholder="Cardiologist" />

                        <SelectField label="Hospital / Clinic" field="hospitalId"
                          options={hospitals.map(h => ({ label: `${h.name} (${h.city})`, value: h._id }))}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="Consultation Fee (₹)" field="consultationFee" type="number" placeholder="500" />
                          <InputField label="Contact Phone" field="doctorPhone" icon={Phone} placeholder="+1 234..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="Available Days" field="availableDays" icon={Calendar} placeholder="Mon-Fri" />
                          <InputField label="Available Time" field="availableTime" icon={Clock} placeholder="9:00 AM - 5:00 PM" />
                        </div>
                      </>
                    )}

                    {/* DRIVER FIELDS */}
                    {selectedRole === 'driver' && (
                      <>
                        <InputField label="Driver License" field="driverLicenseNumber" placeholder="DL-1234567890" />
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="Vehicle Number" field="vehicleNumber" placeholder="ABC-1234" />
                          <InputField label="Vehicle Type" field="vehicleType" placeholder="ALS Ambulance" />
                        </div>
                        <InputField label="Contact Phone" field="driverPhone" icon={Phone} placeholder="+1 234..." />
                      </>
                    )}

                    {/* ADMIN FIELDS */}
                    {selectedRole === 'admin' && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <SelectField label="Select Hospital to Manage" field="hospitalId"
                          options={hospitals.map(h => ({
                            label: `${h.name} (${h.city}) ${h.adminId ? '⚠️ Admin Exists' : '✅ Available'}`,
                            value: h._id
                          }))}
                        />
                        <p className="text-xs text-slate-500 mt-2 ml-1">
                          You can only register for hospitals that do not already have an administrator assigned.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Signup;