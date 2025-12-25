import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { AppBar, Toolbar, Button, Container } from '@mui/material';

const Navbar = () => {
  return (
    <AppBar 
      position="sticky" 
      className="bg-white shadow-md py-3"
      sx={{ 
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        py: 1
      }}
    >
      <Container maxWidth="xl">
        <Toolbar className="flex justify-between items-center px-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-blue-600 font-bold text-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full">
              <HeartPulse size={28} className="text-white" />
            </div>
            <span>MediCare Plus</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-4 py-2 font-medium transition">
              Home
            </Link>
            <Link to="/#services" className="text-gray-700 hover:text-blue-600 px-4 py-2 font-medium transition">
              Services
            </Link>
            <Link to="/#about" className="text-gray-700 hover:text-blue-600 px-4 py-2 font-medium transition">
              About
            </Link>
            <Link to="/#contact" className="text-gray-700 hover:text-blue-600 px-4 py-2 font-medium transition">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              variant="text" 
              component={Link} 
              to="/login"
              className="text-gray-700 hover:text-blue-600 font-medium"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 2
              }}
            >
              Log In
            </Button>
            <Button 
              variant="contained" 
              component={Link} 
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg rounded-full px-6 py-2 transition-all duration-300"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '9999px',
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)'
                }
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