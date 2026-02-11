import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { AppBar, Toolbar, Button, Container, Dialog, DialogContent, Typography, IconButton, Box, Avatar, Chip, Link as MuiLink } from '@mui/material';
import { Close, GitHub, LinkedIn, Language, Code } from '@mui/icons-material';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Services', path: '/#services' },
    { title: 'About', path: '/#about' },
    { title: 'Contact', path: '/#contact' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <div className="p-4 flex justify-center items-center border-b border-gray-100">
        <div className="flex items-center gap-2">
          <HeartPulse className="text-blue-600" size={24} />
          <span className="text-xl font-bold text-gray-900">MediCare<span className="text-blue-600">Plus</span></span>
        </div>
      </div>
      <div className="flex flex-col p-4 gap-2">
        {navLinks.map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className="text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {item.title}
          </Link>
        ))}
        <div className="h-px bg-gray-100 my-2"></div>
        <Button
          component={Link}
          to="/login"
          fullWidth
          className="text-gray-600 hover:text-blue-700 font-semibold mb-2"
        >
          Log In
        </Button>
        <Button
          component={Link}
          to="/signup"
          fullWidth
          variant="contained"
          className="bg-blue-600 text-white font-semibold rounded-full shadow-md"
        >
          Sign Up
        </Button>
      </div>
    </Box>
  );

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
        <Toolbar className="flex justify-between items-center px-2 md:px-4" disableGutters>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            <div className="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </IconButton>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <HeartPulse size={28} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-slate-700 tracking-tight leading-none">
                MediCare<span className="text-blue-600">Plus</span>
              </span>
              <span className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wider hidden sm:block">PREMIUM HEALTHCARE</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center bg-gray-50/80 px-2 py-1.5 rounded-full border border-gray-100 shadow-inner gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className="text-gray-600 hover:text-blue-700 px-4 py-2 font-medium transition-all duration-300 rounded-full hover:bg-white hover:shadow-sm text-sm uppercase tracking-wide"
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile Auth Button (Icon Only) - Optional or keep just hamburger */}
          {/* <div className="flex md:hidden">
              <IconButton component={Link} to="/login" color="primary">
                 <UserCircle size={24} />
              </IconButton>
           </div> */}

        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <nav>
        <Dialog
          open={mobileOpen}
          onClose={handleDrawerToggle}
          fullScreen
          PaperProps={{
            sx: {
              width: '80%',
              maxWidth: '300px',
              height: '100%',
              position: 'fixed',
              left: 0,
              top: 0,
              m: 0,
              borderRadius: '0 16px 16px 0'
            }
          }}
          hideBackdrop={false}
          style={{ zIndex: 1200 }} // Ensure it's above other elements
        >
          {drawer}
        </Dialog>
      </nav>
    </AppBar>
  );
};

export default Navbar;