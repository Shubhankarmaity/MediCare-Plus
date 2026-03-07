import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { AppBar, Toolbar, Button, Container, Dialog, IconButton, Box } from '@mui/material';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Hospitals', path: '/hospitals' },
    { title: 'Find a Doctor', path: '/doctors' },
    { title: 'Lab Tests', path: '/lab-tests' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', backgroundColor: '#FFFFFF', height: '100%' }}>
      <div className="h-[72px] flex justify-center items-center border-b border-divider-gray">
        <div className="flex items-center gap-2">
          <HeartPulse className="text-primary-blue" size={24} />
          <span className="text-xl font-bold text-primary-navy">MediCare Plus</span>
        </div>
      </div>
      <div className="flex flex-col p-6 gap-4">
        {navLinks.map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className="text-body-gray hover:text-primary-blue font-medium py-2 text-left"
          >
            {item.title}
          </Link>
        ))}
        <div className="h-px bg-divider-gray my-4"></div>
        <Link
          to="/login"
          className="btn-outline w-full text-center"
          onClick={handleDrawerToggle}
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="btn-primary w-full text-center mt-2"
          onClick={handleDrawerToggle}
        >
          Sign Up / Book
        </Link>
      </div>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        color: '#1A365D',
        height: '72px',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar className="flex justify-between items-center px-0 md:px-4" disableGutters>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#1A365D' }}
          >
            <div className="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </IconButton>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="text-primary-blue">
              <HeartPulse size={32} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary-navy tracking-tight leading-none">
                MediCare Plus
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className="text-primary-navy hover:text-primary-blue py-2 font-medium transition-colors text-base relative group"
              >
                {item.title}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {localStorage.getItem('token') ? (
              <Link
                to="/patient-dashboard"
                className="btn-primary"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-primary-navy hover:text-primary-blue font-semibold px-2 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Book Appointment
                </Link>
              </>
            )}
          </div>
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
              width: '85%',
              maxWidth: '320px',
              height: '100%',
              position: 'fixed',
              left: 0,
              top: 0,
              m: 0,
              borderRadius: '0'
            }
          }}
          hideBackdrop={false}
          style={{ zIndex: 1200 }}
        >
          {drawer}
        </Dialog>
      </nav>
    </AppBar>
  );
};

export default Navbar;