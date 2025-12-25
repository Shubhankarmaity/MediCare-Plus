import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField, Button, Box, Typography, InputAdornment,
  IconButton, Alert, CircularProgress
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, HeartPulse, ArrowRight } from 'lucide-react';
import CssBaseline from '@mui/material/CssBaseline';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // CRITICAL: Clear any existing user data before login
      localStorage.clear();
      
      // Simulate network delay for smooth UX feel
      await new Promise(r => setTimeout(r, 800));

      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        console.log('Login successful - User data:', { name: data.result.name, email: data.result.email, role: data.result.role, id: data.result._id });
        
        // Store fresh token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.result));
        
        // Verify what was stored
        console.log('Stored in localStorage:', {
          token: localStorage.getItem('token') ? 'Token stored' : 'No token',
          user: JSON.parse(localStorage.getItem('user'))
        });

        const role = data.result.role;
        const target = role === 'patient' ? '/patient-dashboard' :
          role === 'doctor' ? '/doctor-dashboard' :
            role === 'admin' ? '/admin-dashboard' :
              role === 'driver' ? '/driver-dashboard' : '/';
        navigate(target);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <CssBaseline />

      {/* Healthcare-themed background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-200 opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-indigo-200 opacity-50"></div>
        <div className="absolute top-1/3 right-10 w-24 h-24 rounded-full bg-cyan-200 opacity-50"></div>
        <div className="absolute bottom-1/3 left-20 w-40 h-40 rounded-full bg-blue-100 opacity-50"></div>
      </div>

      {/* Healthcare-themed Card */}
      <div
        className="z-10 w-full max-w-md p-8 bg-white backdrop-blur-sm border border-blue-100 rounded-2xl shadow-xl mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full mb-4 shadow-lg">
            <HeartPulse className="text-white w-10 h-10" />
          </div>
          <Typography variant="h4" fontWeight="bold" className="text-gray-800 tracking-wide">
            MediCare Plus
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-2">
            Sign in to access your healthcare portal
          </Typography>
        </div>

        {error && (
          <div
            className="mb-4"
          >
            <Alert severity="error" sx={{ bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
              {error}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Mail className="text-blue-500 w-5 h-5" /></InputAdornment>,
              sx: {
                color: 'gray',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(209 213 219)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(156 163 175)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' }
              }
            }}
            InputLabelProps={{ sx: { color: 'rgb(107 114 128)', '&.Mui-focused': { color: '#3b82f6' } } }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock className="text-blue-500 w-5 h-5" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" className="text-blue-500">
                    {showPassword ? <EyeOff className="text-blue-500 w-5 h-5" /> : <Eye className="text-blue-500 w-5 h-5" />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                color: 'gray',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(209 213 219)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(156 163 175)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' }
              }
            }}
            InputLabelProps={{ sx: { color: 'rgb(107 114 128)', '&.Mui-focused': { color: '#3b82f6' } } }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '12px',
              textTransform: 'none',
              background: 'linear-gradient(to right, #3b82f6, #6366f1)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-800 transition ml-1 inline-flex items-center gap-1 group">
            Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;