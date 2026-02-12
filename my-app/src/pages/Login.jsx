import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Activity, HeartPulse } from 'lucide-react';
import authService from '../services/authService';
import hospitalImg from '../assets/images/hospital4.avif'; // Ensure this path is correct or use a URL if needed

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Login, 2: OTP
  const [otp, setOtp] = useState('');
  const [emailToVerify, setEmailToVerify] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // CRITICAL: Clear any existing user data before login
      localStorage.clear();

      // Simulate network delay for smooth UX feel
      await new Promise(r => setTimeout(r, 800));

      const data = await authService.login(formData);

      console.log('Login successful - User data:', { name: data.result.name, email: data.result.email, role: data.result.role, id: data.result._id });

      // Store fresh token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.result));

      const role = data.result.role;
      const target = role === 'patient' ? '/patient-dashboard' :
        role === 'doctor' ? '/doctor-dashboard' :
          role === 'admin' ? '/admin-dashboard' :
            role === 'super-admin' ? '/super-admin-dashboard' :
              role === 'driver' ? '/driver-dashboard' : '/';
      navigate(target);

    } catch (err) {
      console.error('Login error:', err);
      const errorData = err.response?.data;

      // Handle Unverified Email
      if (err.response?.status === 403 && errorData?.requiresVerification) {
        setError(errorData.message);
        setEmailToVerify(errorData.email || formData.email);
        setStep(2); // Switch to OTP view
        return;
      }

      const errorMessage = errorData?.message || err.message || "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.verifyEmail({ email: emailToVerify, otp });
      alert('Email verified successfully! Please sign in again.');
      setStep(1); // Back to login
      setOtp('');
      // Optionally auto-login here via a new call to authService.login
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

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
            <ArrowRight className="w-4 h-4 rotate-180" />
          </div>
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/90 to-indigo-900/90 z-10" />
        <img
          src={hospitalImg}
          alt="Hospital Building"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=2000" }} // Fallback image
        />

        <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
          <div className="flex items-center gap-2 mt-12">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">MediCare Plus</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-bold leading-tight">
              Advanced Healthcare, <br />
              <span className="text-sky-300">Simplified.</span>
            </h1>
            <p className="text-lg text-slate-200 leading-relaxed">
              Experience the future of medical management. Secure, efficient, and designed for healthcare professionals and patients alike.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-300 font-medium">
            <span>© 2024 MediCare Plus</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <Link to="/contact" className="hover:text-white transition cursor-pointer">Contact Support</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <Link to="/privacy" className="hover:text-white transition cursor-pointer">Privacy Policy</Link>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Home Button */}
          <div className="lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6">
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center gap-2 mb-8 justify-center">
              <div className="bg-sky-600 p-2 rounded-lg">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">MediCare Plus</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {step === 1 ? "Welcome back" : "Verify Email"}
            </h2>
            <p className="mt-2 text-slate-600">
              {step === 1 ? "Please enter your details to sign in." : `Enter the OTP sent to ${emailToVerify}`}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {step === 1 ? (
            // LOGIN FORM
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 sm:text-sm"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 sm:text-sm"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-sky-600 hover:text-sky-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          ) : (
            // OTP FORM
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-center tracking-widest text-2xl font-bold"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Verify Account'
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                Back to Login
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mt-8 text-center">
              <p className="text-slate-600 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-sky-600 hover:text-sky-500 transition-colors inline-flex items-center gap-1 group">
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
