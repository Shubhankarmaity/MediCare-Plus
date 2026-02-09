import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { AppBar, Toolbar, Button, Container, Dialog, DialogContent, Typography, IconButton, Box, Avatar, Chip, Link as MuiLink } from '@mui/material';
import { Close, GitHub, LinkedIn, Language, Code } from '@mui/icons-material';

const Navbar = () => {


  return (

    <AppBar
      position="sticky"
      className="backdrop-blur-md bg-white/80 border-b border-white/20"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        py: 1
      }}
    >
      <Container maxWidth="xl">
        <Toolbar className="flex justify-between items-center px-2 md:px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <HeartPulse size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-slate-700 tracking-tight leading-none">
                MediCare<span className="text-blue-600">Plus</span>
              </span>
              <span className="text-xs text-gray-500 font-medium tracking-wider">PREMIUM HEALTHCARE</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center bg-gray-50/80 px-2 py-1.5 rounded-full border border-gray-100 shadow-inner gap-1">
            <Link to="/" className="text-gray-600 hover:text-blue-700 px-4 py-2 font-medium transition-all duration-300 rounded-full hover:bg-white hover:shadow-sm text-sm uppercase tracking-wide">
              Home
            </Link>
            <Link to="/#services" className="text-gray-600 hover:text-blue-700 px-4 py-2 font-medium transition-all duration-300 rounded-full hover:bg-white hover:shadow-sm text-sm uppercase tracking-wide">
              Services
            </Link>
            <Link to="/#about" className="text-gray-600 hover:text-blue-700 px-4 py-2 font-medium transition-all duration-300 rounded-full hover:bg-white hover:shadow-sm text-sm uppercase tracking-wide">
              About
            </Link>

            <Link to="/#contact" className="text-gray-600 hover:text-blue-700 px-4 py-2 font-medium transition-all duration-300 rounded-full hover:bg-white hover:shadow-sm text-sm uppercase tracking-wide">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              component={Link}
              to="/login"
              className="text-gray-600 hover:text-blue-700 font-semibold px-4"
              sx={{ textTransform: 'none', fontSize: '0.95rem' }}
            >
              Log In
            </Button>
            <Button
              variant="contained"
              component={Link}
              to="/signup"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-full px-6 py-2.5 shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all duration-300 hover:-translate-y-0.5"
              sx={{
                textTransform: 'none',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                background: 'linear-gradient(to right, #2563eb, #4338ca)',
              }}
            >
              Sign Up
            </Button>
          </div>
        </Toolbar>
      </Container>


    </AppBar>
  );
};

export default Navbar;