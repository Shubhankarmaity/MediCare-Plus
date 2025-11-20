import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Grid, Paper, Typography, TextField, Button, Avatar, Box 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.result));
        
        const role = data.result.role;
        if (role === 'patient') navigate('/patient-dashboard');
        else if (role === 'doctor') navigate('/doctor-dashboard');
        else if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'driver') navigate('/driver-dashboard');
        else navigate('/');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Login failed. Check connection.");
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      
      {/* Left Side - Image Cover */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1350&q=80)', // Professional hospital lobby
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Right Side - Login Form */}
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#334155' }}>
            Welcome Back
          </Typography>
          
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, maxWidth: 450, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              variant="outlined"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 4, mb: 3, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}
            >
              Sign In
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;