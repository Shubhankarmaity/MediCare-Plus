import React, { useState } from 'react';
import { Ambulance, User, Shield, Clock, Stethoscope, Heart, Phone, ChevronRight, Activity, Calendar, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container, Grid, Typography, Button, Avatar, Box } from '@mui/material';
import { motion } from 'framer-motion';

const Home = () => {
  // Video Carousel Data
  const videoSources = [
    "https://assets.mixkit.co/videos/5568/5568-720.mp4",
    "https://assets.mixkit.co/videos/23069/23069-720.mp4",
    "https://assets.mixkit.co/videos/6562/6562-720.mp4"
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.03,
      y: -10,
      boxShadow: "0 20px 30px rgba(0,0,0,0.1)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  // Features data
  const features = [
    {
      icon: <Ambulance size={36} />,
      title: "Emergency Services",
      desc: "24/7 rapid response ambulance fleet with advanced life support systems.",
      color: "bg-red-50 text-red-600",
      border: "hover:border-red-200",
      gradient: "from-red-500/20 to-red-100/0"
    },
    {
      icon: <User size={36} />,
      title: "Top Specialists",
      desc: "Instant access to 500+ board-certified doctors across all departments.",
      color: "bg-blue-50 text-blue-600",
      border: "hover:border-blue-200",
      gradient: "from-blue-500/20 to-blue-100/0"
    },
    {
      icon: <Shield size={36} />,
      title: "Secure Health Records",
      desc: "Bank-grade encryption for all your medical history and sensitive data.",
      color: "bg-cyan-50 text-cyan-600",
      border: "hover:border-cyan-200",
      gradient: "from-cyan-500/20 to-cyan-100/0"
    },
    {
      icon: <Activity size={36} />,
      title: "Virtual Consultations",
      desc: "HD video consultations from the comfort of your home.",
      color: "bg-indigo-50 text-indigo-600",
      border: "hover:border-indigo-200",
      gradient: "from-indigo-500/20 to-indigo-100/0"
    },
    {
      icon: <Heart size={36} />,
      title: "Preventive Care",
      desc: "AI-driven health monitoring and personalized wellness plans.",
      color: "bg-pink-50 text-pink-600",
      border: "hover:border-pink-200",
      gradient: "from-pink-500/20 to-pink-100/0"
    },
    {
      icon: <Calendar size={36} />,
      title: "Smart Booking",
      desc: "Hassle-free 1-click appointment booking with zero waiting time.",
      color: "bg-violet-50 text-violet-600",
      border: "hover:border-violet-200",
      gradient: "from-violet-500/20 to-violet-100/0"
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      content: "The online consultation feature saved me hours of waiting. The interface is beautiful and so easy to use.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Dr. Michael Chen",
      role: "Chief Cardiologist",
      content: "MediCare Plus has revolutionized our patient management. It's the most intuitive medical platform I've used.",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Robert Williams",
      role: "Emergency EMT",
      content: "The real-time dispatch system is a lifesaver. Literally. We reach patients faster than ever before.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans selection:bg-blue-200 overflow-x-hidden">
      {/* Emergency Floating Action Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <a href="tel:911" className="group flex items-center bg-white p-1 pr-6 rounded-full shadow-2xl border border-red-50 hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105">
          <div className="bg-gradient-to-tr from-red-500 to-pink-600 p-4 rounded-full text-white shadow-lg animate-pulse-slow">
            <Phone size={24} fill="currentColor" />
          </div>
          <div className="ml-4 text-left">
            <Typography variant="caption" className="block text-gray-500 font-bold uppercase tracking-wider text-[10px]">Emergency</Typography>
            <Typography variant="h6" className="font-bold text-gray-900 leading-none">112</Typography>
          </div>
        </a>
      </motion.div>

      {/* Hero Section */}
      <div className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        {/* Modern Overlay Gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-blue-900/95 via-blue-900/80 to-transparent"></div>

        {/* Background Video */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <video
            key={currentVideoIndex}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-105 transition-all duration-[2000ms]"
            onEnded={handleVideoEnded}
          >
            <source src={videoSources[currentVideoIndex]} type="video/mp4" />
          </video>
        </motion.div>

        <Container maxWidth="xl" className="relative z-20">
          <Grid container alignItems="center">
            <Grid item xs={12} md={8} lg={6}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="space-y-8"
              >
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-xl">
                  <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-sm font-medium tracking-wide">Live Wait Time: &lt; 10 mins</span>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Typography variant="h1" className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
                    Healthcare <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Reimagined.</span>
                  </Typography>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Typography variant="h6" className="text-blue-100 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
                    Experience the future of medical care with our AI-powered platform.
                    Connect with world-class specialists, track real-time emergency services,
                    and manage your health digitally.
                  </Typography>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 pt-4">
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-blue-600/30 transition-all duration-300"
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    to="/hospitals"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm transition-all duration-300"
                    endIcon={<ChevronRight />}
                  >
                    Find Hospital
                  </Button>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-center gap-8 pt-8 border-t border-white/10">
                  <div>
                    <Typography variant="h4" className="font-bold text-white">500+</Typography>
                    <Typography variant="body2" className="text-blue-200">Specialists</Typography>
                  </div>
                  <div className="w-px h-12 bg-white/10"></div>
                  <div>
                    <Typography variant="h4" className="font-bold text-white">50k+</Typography>
                    <Typography variant="body2" className="text-blue-200">Satisfied Patients</Typography>
                  </div>
                  <div className="w-px h-12 bg-white/10"></div>
                  <div>
                    <Typography variant="h4" className="font-bold text-white">4.9/5</Typography>
                    <Typography variant="body2" className="text-blue-200">User Rating</Typography>
                  </div>
                </motion.div>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* Services Section - Animated Bento Grid */}
      <div id="services" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none"></div>
        <Container maxWidth="xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <Typography variant="overline" className="text-blue-600 font-bold tracking-widest text-sm">
              OUR ECOSYSTEM
            </Typography>
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
              Comprehensive Care
            </Typography>
            <Typography variant="h6" className="text-gray-500 font-normal">
              A fully integrated suite of medical services designed around your life.
            </Typography>
          </motion.div>

          <Grid container spacing={4} component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index} component={motion.div} variants={fadeInUp}>
                <motion.div
                  initial="rest"
                  whileHover="hover"
                  variants={cardHover}
                  className={`p-8 rounded-3xl bg-white border border-gray-100 transition-all duration-300 h-full relative overflow-hidden group`}
                >
                  {/* Subtle Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                  <div className={`relative z-10 inline-flex items-center justify-center p-4 rounded-2xl mb-6 ${feature.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                    {feature.icon}
                  </div>

                  <Typography variant="h5" className="relative z-10 font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {feature.title}
                  </Typography>

                  <Typography variant="body1" className="relative z-10 text-gray-500 leading-relaxed mb-6">
                    {feature.desc}
                  </Typography>

                  <a href="#" className="relative z-10 inline-flex items-center text-sm font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                    Learn More <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {/* About Section - Modern Split with Parallax effect */}
      <div id="about" className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-[100px]"></div>

        <Container maxWidth="xl" className="relative z-10">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-700">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Medical Team"
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <Typography variant="h5" className="text-white font-bold">World-Class Facilities</Typography>
                    <Typography className="text-gray-300">Equipped with latest diagnostic tech</Typography>
                  </div>
                </div>

                {/* Floating Badge */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Star className="text-blue-600" fill="currentColor" />
                    </div>
                    <div>
                      <Typography variant="h6" className="font-bold text-gray-900">#1 Choice</Typography>
                      <Typography variant="caption" className="text-gray-500 font-bold">IN REGION</Typography>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="pl-0 lg:pl-12"
              >
                <Typography variant="overline" className="text-indigo-600 font-bold tracking-widest text-sm">
                  ABOUT MEDICARE PLUS
                </Typography>
                <Typography variant="h2" className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-6 leading-tight">
                  Leading the Way in <br />
                  <span className="text-blue-600">Medical Excellence</span>
                </Typography>
                <Typography variant="body1" className="text-gray-600 text-lg leading-relaxed mb-8">
                  For over two decades, MediCare Plus has stood as a beacon of hope and healing.
                  We combine compassionate care with cutting-edge technology to deliver outcomes that matter.
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  {[
                    "JCI Accredited Facility",
                    "24/7 Emergency Support",
                    "Advanced Robotic Surgery",
                    "International Patient Care"
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-3"
                    >
                      <div className="bg-green-100 p-1.5 rounded-full">
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                      <span className="font-medium text-gray-700">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="outlined"
                  size="large"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-3 rounded-full font-bold transition-all duration-300"
                >
                  Meet Our Team
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* Testimonials - Staggered Cards */}
      <div className="py-24 bg-white">
        <Container maxWidth="xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Typography variant="h2" className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </Typography>
          </motion.div>

          <Grid container spacing={4} component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {testimonials.map((t, i) => (
              <Grid item xs={12} md={4} key={i} component={motion.div} variants={fadeInUp}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-slate-50 p-8 rounded-3xl h-full border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar src={t.avatar} alt={t.name} sx={{ width: 56, height: 56 }} className="ring-4 ring-white shadow-md" />
                    <div>
                      <Typography variant="h6" className="font-bold text-gray-900">{t.name}</Typography>
                      <Typography variant="body2" className="text-blue-600 font-medium">{t.role}</Typography>
                    </div>
                  </div>
                  <Typography className="text-gray-600 italic leading-relaxed">"{t.content}"</Typography>
                  <div className="flex gap-1 mt-6 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
                  </div>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Modern Contact Section */}
      <div id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Animated Background Shapes */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"
        ></motion.div>

        <Container maxWidth="xl" className="relative z-10">
          <Grid container spacing={8}>
            <Grid item xs={12} lg={5}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <Typography variant="overline" className="text-blue-400 font-bold tracking-widest">
                    CONTACT US
                  </Typography>
                  <Typography variant="h2" className="text-4xl md:text-5xl font-bold mt-2 mb-8">
                    Let's Talk About Your Health
                  </Typography>
                  <Typography className="text-gray-400 text-lg mb-12">
                    Have a question? detailed medical inquiry? or just want to know more about our services?
                  </Typography>
                </motion.div>

                <div className="space-y-8">
                  <motion.div variants={fadeInUp} className="flex items-start gap-6">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                      <Phone className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <Typography variant="h6" className="font-bold">Phone Support</Typography>
                      <Typography className="text-gray-400">24/7 Available</Typography>
                      <Typography className="text-blue-400 font-bold mt-1">1-800-MEDICARE</Typography>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-start gap-6">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                      <User className="text-indigo-400" size={24} />
                    </div>
                    <div>
                      <Typography variant="h6" className="font-bold">Patient Helpdesk</Typography>
                      <Typography className="text-gray-400">help@medicareplus.com</Typography>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={7}>
              <motion.form
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl"
              >
                <Typography variant="h4" className="text-gray-900 font-bold mb-8">Send a Message</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900" placeholder="Doe" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                  <input type="email" className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900" placeholder="john@example.com" />
                </div>
                <div className="mb-8">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Message</label>
                  <textarea rows={4} className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900" placeholder="How can we help you?"></textarea>
                </div>
                <Button
                  size="large"
                  fullWidth
                  className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Send Message
                </Button>
              </motion.form>
            </Grid>
          </Grid>
        </Container>
      </div>
    </div>
  );
};

export default Home;