import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { AppBar, Toolbar, Button, Container, Dialog, DialogContent, Typography, IconButton, Box, Avatar, Chip, Link as MuiLink } from '@mui/material';
import { Close, GitHub, LinkedIn, Language, Code } from '@mui/icons-material';

const Navbar = () => {
  const [openOwner, setOpenOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('owner'); // 'owner' or 'guide'

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
            <button
              onClick={() => setOpenOwner(true)}
              className="text-gray-600 hover:text-blue-700 px-4 py-2 font-medium transition-all duration-300 rounded-full hover:bg-white hover:shadow-sm text-sm uppercase tracking-wide cursor-pointer"
            >
              Owner
            </button>
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

      {/* Owner Details Dialog */}
      <Dialog
        open={openOwner}
        onClose={() => setOpenOwner(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 24,
            backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden', minHeight: '500px' }}>
          <IconButton
            onClick={() => setOpenOwner(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary', bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' }, zIndex: 20 }}
          >
            <Close />
          </IconButton>

          {/* Tab Selection */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setActiveTab('owner')}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide uppercase transition-all ${activeTab === 'owner' ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Project Developer
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide uppercase transition-all ${activeTab === 'guide' ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Project Guide
            </button>
          </div>

          {activeTab === 'owner' ? (
            <div className="flex flex-col md:flex-row h-full">
              {/* Left Side - Profile & Gradient */}
              <div className="w-full md:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-800 p-8 flex flex-col items-center justify-center text-white text-center relative overflow-hidden min-h-[400px]">
                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full translate-x-1/3 translate-y-1/3 blur-xl"></div>

                <Avatar
                  sx={{ width: 140, height: 140, mb: 3, border: '4px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
                  src="https://shubhankarmaity.tech/static/media/profile_photo.6b3d1b6e.png"
                  alt="Shubhankar Maity"
                >
                  SM
                </Avatar>

                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Shubhankar Maity
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500, mb: 3, letterSpacing: '0.05em' }}>
                  FULL STACK DEVELOPER
                </Typography>

                <div className="flex gap-4 mt-2">
                  <IconButton
                    href="https://github.com/Shubhankarmaity"
                    target="_blank"
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' }, transition: '0.3s' }}
                  >
                    <GitHub />
                  </IconButton>
                  <IconButton
                    href="https://www.linkedin.com/in/shubhankar-maity-05976b290"
                    target="_blank"
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' }, transition: '0.3s' }}
                  >
                    <LinkedIn />
                  </IconButton>
                  <IconButton
                    href="https://shubhankarmaity.tech"
                    target="_blank"
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' }, transition: '0.3s' }}
                  >
                    <Language />
                  </IconButton>
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="w-full md:w-3/5 p-8 md:p-10 bg-white">
                <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code className="text-blue-600" /> About Me
                </Typography>

                <Typography paragraph color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1rem', mb: 3 }}>
                  Passionate Computer Science student specializing in Data Science and MERN Stack Development.
                  I build robust, user-centric applications like <b>MediCare Plus</b> to solve real-world problems through technology.
                </Typography>

                <div className="space-y-4 mb-6">
                  <div>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
                      EDUCATION
                    </Typography>
                    <Typography variant="body2" color="text.primary" fontWeight="bold">
                      Brainware University
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      B.Tech in Computer Science & Engineering (Data Science)
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
                      SKILLS
                    </Typography>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['MERN Stack', 'Data Science', 'Machine Learning', 'Java', 'React', 'Node.js', 'MongoDB'].map(skill => (
                        <Chip key={skill} label={skill} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, borderRadius: 1.5 }} />
                      ))}
                    </div>
                  </div>
                </div>

                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    href="https://shubhankarmaity.tech"
                    target="_blank"
                    endIcon={<Language size={16} />}
                    sx={{
                      borderRadius: 10,
                      textTransform: 'none',
                      px: 3,
                      background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                      boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.4)'
                    }}
                  >
                    View Full Portfolio
                  </Button>
                </Box>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row h-full">
              {/* Left Side - Profile & Gradient (Guide) */}
              <div className="w-full md:w-2/5 bg-gradient-to-br from-purple-600 to-pink-800 p-8 flex flex-col items-center justify-center text-white text-center relative overflow-hidden min-h-[400px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -translate-x-1/3 translate-y-1/3 blur-xl"></div>

                <Avatar
                  sx={{ width: 140, height: 140, mb: 3, border: '4px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', bgcolor: '#7c3aed' }}
                  alt="Dr. Arnab Kundu"
                >
                  AK
                </Avatar>

                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Dr. Arnab Kundu
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500, mb: 3, letterSpacing: '0.05em' }}>
                  ASSISTANT PROFESSOR
                </Typography>

                <div className="flex gap-4 mt-2">
                  <IconButton
                    href="https://www.linkedin.com/in/dr-arnab-kundu-4a211188/"
                    target="_blank"
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' }, transition: '0.3s' }}
                  >
                    <LinkedIn />
                  </IconButton>
                </div>
              </div>

              {/* Right Side - Details (Guide) */}
              <div className="w-full md:w-3/5 p-8 md:p-10 bg-white">
                <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code className="text-purple-600" /> Project Guide
                </Typography>

                <Typography paragraph color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1rem', mb: 3 }}>
                  A distinguished academic and mentor in the field of Computer Science and Engineering.
                  Dr. Kundu specializes in <b>Wireless Communication, Cognitive Radio networks, and Blockchain Technology</b>.
                </Typography>

                <div className="space-y-4 mb-6">
                  <div>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom sx={{ color: '#9333ea' }}>
                      AFFILIATION
                    </Typography>
                    <Typography variant="body2" color="text.primary" fontWeight="bold">
                      Brainware University
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Department of Computer Science & Engineering (CS & DS)
                    </Typography>
                  </div>

                  <div>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom sx={{ color: '#9333ea' }}>
                      RESEARCH AREAS
                    </Typography>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Cognitive Radio', 'Blockchain', 'Wireless Communication', 'IoT', 'Networking'].map(skill => (
                        <Chip key={skill} label={skill} size="small" sx={{ bgcolor: '#f3e8ff', color: '#7e22ce', fontWeight: 600, borderRadius: 1.5 }} />
                      ))}
                    </div>
                  </div>
                </div>

                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    href="https://www.linkedin.com/in/dr-arnab-kundu-4a211188/"
                    target="_blank"
                    endIcon={<LinkedIn size={16} />}
                    sx={{
                      borderRadius: 10,
                      textTransform: 'none',
                      px: 3,
                      background: 'linear-gradient(45deg, #7c3aed, #db2777)',
                      boxShadow: '0 4px 14px 0 rgba(219, 39, 119, 0.4)'
                    }}
                  >
                    View LinkedIn Profile
                  </Button>
                </Box>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;