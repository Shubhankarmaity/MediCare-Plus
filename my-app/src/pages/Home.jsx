import React, { useState } from 'react'; import { Ambulance, User, Shield, Clock, Stethoscope, Heart, Phone, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button
} from '@mui/material';

const Home = () => {
  // Video Carousel Data
  const videoSources = [
    "https://assets.mixkit.co/videos/5568/5568-720.mp4", // Nurse & Patient
    "https://assets.mixkit.co/videos/23069/23069-720.mp4", // Medical Students
    "https://assets.mixkit.co/videos/6562/6562-720.mp4"   // Doctor & Heartbeat
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
  };
  // Features data
  const features = [
    {
      icon: <Ambulance size={40} />,
      title: "Emergency Services",
      desc: "24/7 ambulance services with real-time GPS tracking and fastest response times.",
      color: "text-red-500"
    },
    {
      icon: <User size={40} />,
      title: "Expert Doctors",
      desc: "Access to over 500+ certified specialists across various medical disciplines.",
      color: "text-blue-500"
    },
    {
      icon: <Shield size={40} />,
      title: "Secure Data",
      desc: "Your medical history is encrypted and only accessible by authorized personnel.",
      color: "text-green-500"
    },
    {
      icon: <Stethoscope size={40} />,
      title: "Online Consultations",
      desc: "Connect with doctors virtually from the comfort of your home.",
      color: "text-purple-500"
    },
    {
      icon: <Heart size={40} />,
      title: "Health Monitoring",
      desc: "Track your vital signs and receive personalized health recommendations.",
      color: "text-pink-500"
    },
    {
      icon: <Clock size={40} />,
      title: "Quick Appointments",
      desc: "Book appointments instantly with your preferred doctor and time slot.",
      color: "text-indigo-500"
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      content: "The online consultation feature saved me hours of waiting. The doctor was attentive and prescribed the right treatment.",
      avatar: "SJ"
    },
    {
      name: "Dr. Michael Chen",
      role: "Cardiologist",
      content: "As a doctor, I appreciate the streamlined appointment system and patient record management.",
      avatar: "MC"
    },
    {
      name: "Robert Williams",
      role: "Ambulance Driver",
      content: "The real-time dispatch system helps us reach patients faster than ever before.",
      avatar: "RW"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Emergency Hotline Sticky Card */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <Phone className="text-red-600" size={24} />
            </div>
            <div>
              <Typography className="font-bold text-gray-800">Emergency Hotline</Typography>
              <Typography className="text-gray-600">24/7 Support</Typography>
              <Typography className="font-bold text-blue-600">1-800-MEDICARE</Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Video Background */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            key={currentVideoIndex}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover opacity-20 transition-opacity duration-1000"
            onEnded={handleVideoEnded}
            onError={(e) => {
              console.log("Video failed to load, using fallback background");
              e.target.style.display = 'none';
              const fallbackBg = document.getElementById('video-fallback-bg');
              if (fallbackBg) fallbackBg.style.display = 'block';
            }}
          >
            <source src={videoSources[currentVideoIndex]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Fallback background when video fails to load */}
          <div
            id="video-fallback-bg"
            className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900"
            style={{ display: 'none' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-indigo-900/30"></div>
        </div>
        <Container maxWidth="lg" className="relative z-10">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 12 }}>
              <div className="py-8">
                <Typography variant="h1" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                  Your Health is Our <span className="text-blue-600">Priority</span>
                </Typography>
                <Typography variant="h6" className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl">
                  Comprehensive healthcare platform connecting patients with top specialists, 
                  offering real-time ambulance tracking, secure medical records, and instant appointments.
                </Typography>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="contained" 
                    size="large" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
                    component={Link} 
                    to="/signup"
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large" 
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-bold shadow transition-all duration-300"
                    component={Link} 
                    to="/login"
                  >
                    Book Appointment
                  </Button>
                </div>
              </div>
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* Services Section */}
      <div id="services" className="py-20 bg-white">
        <Container maxWidth="lg">
          <div className="text-center mb-16">
            <Typography variant="h6" className="text-blue-600 font-bold uppercase tracking-wider mb-2">
              Our Services
            </Typography>
            <Typography variant="h3" className="text-gray-800 font-bold mb-4">
              Comprehensive Healthcare Solutions
            </Typography>
            <Typography variant="h6" className="text-gray-600 max-w-3xl mx-auto">
              We offer a wide range of healthcare services designed to meet all your medical needs with convenience and professionalism.
            </Typography>
          </div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-gray-100 rounded-2xl overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6 ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <Typography variant="h5" className="font-bold text-gray-800 mb-3">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" className="text-gray-600">
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {/* About Section */}
      <div id="about" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <div className="relative">
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    alt="Healthcare team"
                    className="rounded-2xl w-full h-auto shadow-lg"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
                  <Typography variant="h4" className="font-bold">20+ Years</Typography>
                  <Typography variant="h6">of Excellence</Typography>
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <div>
                <Typography variant="h6" className="text-blue-600 font-bold uppercase tracking-wider mb-2">
                  About Us
                </Typography>
                <Typography variant="h3" className="text-gray-800 font-bold mb-6">
                  Leading Healthcare Provider in the Region
                </Typography>
                <Typography variant="body1" className="text-gray-600 mb-6">
                  MediCare Plus has been at the forefront of healthcare innovation for over two decades.
                  Our commitment to excellence and patient care has made us the trusted choice for thousands
                  of families across the region.
                </Typography>
                <Typography variant="body1" className="text-gray-600 mb-6">
                  With state-of-the-art facilities, cutting-edge technology, and a team of dedicated
                  professionals, we provide comprehensive medical services tailored to meet your unique
                  health needs.
                </Typography>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Shield className="text-blue-600" size={20} />
                    </div>
                    <Typography variant="body1" className="font-medium">Certified Professionals</Typography>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Heart className="text-blue-600" size={20} />
                    </div>
                    <Typography variant="body1" className="font-medium">Patient-Centered Care</Typography>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Clock className="text-blue-600" size={20} />
                    </div>
                    <Typography variant="body1" className="font-medium">24/7 Availability</Typography>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Stethoscope className="text-blue-600" size={20} />
                    </div>
                    <Typography variant="body1" className="font-medium">Advanced Technology</Typography>
                  </div>
                </div>
                <Button
                  variant="contained"
                  size="large"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all duration-300"
                  component={Link}
                  to="/#"
                >
                  Learn More About Us
                </Button>
              </div>
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <Container maxWidth="lg">
          <Grid container spacing={6} className="text-center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h3" className="font-bold text-4xl mb-2">500+</Typography>
              <Typography variant="h6">Expert Doctors</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h3" className="font-bold text-4xl mb-2">50K+</Typography>
              <Typography variant="h6">Happy Patients</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h3" className="font-bold text-4xl mb-2">24/7</Typography>
              <Typography variant="h6">Support Available</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h3" className="font-bold text-4xl mb-2">99%</Typography>
              <Typography variant="h6">Satisfaction Rate</Typography>
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gray-50">
        <Container maxWidth="lg">
          <div className="text-center mb-16">
            <Typography variant="h6" className="text-blue-600 font-bold uppercase tracking-wider mb-2">
              Testimonials
            </Typography>
            <Typography variant="h3" className="text-gray-800 font-bold mb-4">
              What Our Users Say
            </Typography>
          </div>

          <Grid container spacing={6}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card className="h-full rounded-2xl border border-gray-100 shadow-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <Typography variant="h6" className="font-bold text-gray-800">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          {testimonial.role}
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="body1" className="text-gray-600 italic">
                      "{testimonial.content}"
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-20 bg-white">
        <Container maxWidth="lg">
          <div className="text-center mb-16">
            <Typography variant="h6" className="text-blue-600 font-bold uppercase tracking-wider mb-2">
              Contact Us
            </Typography>
            <Typography variant="h3" className="text-gray-800 font-bold mb-4">
              Get in Touch
            </Typography>
            <Typography variant="h6" className="text-gray-600 max-w-3xl mx-auto">
              Have questions or need assistance? Our friendly team is here to help you with any inquiries.
            </Typography>
          </div>

          <Grid container spacing={8}>
            <Grid size={{ xs: 12, md: 6 }}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 h-full">
                <Typography variant="h5" className="font-bold text-gray-800 mb-6">Contact Information</Typography>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <Phone className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <Typography variant="h6" className="font-bold text-gray-800 mb-1">Phone</Typography>
                      <Typography variant="body1" className="text-gray-600">1-800-MEDICARE</Typography>
                      <Typography variant="body1" className="text-gray-600">+1 (555) 123-4567</Typography>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <Heart className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <Typography variant="h6" className="font-bold text-gray-800 mb-1">Email</Typography>
                      <Typography variant="body1" className="text-gray-600">info@medicareplus.com</Typography>
                      <Typography variant="body1" className="text-gray-600">support@medicareplus.com</Typography>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <Clock className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <Typography variant="h6" className="font-bold text-gray-800 mb-1">Hours</Typography>
                      <Typography variant="body1" className="text-gray-600">Monday-Friday: 8am-8pm</Typography>
                      <Typography variant="body1" className="text-gray-600">Saturday-Sunday: 9am-5pm</Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="rounded-3xl shadow-lg">
                <CardContent className="p-8">
                  <Typography variant="h5" className="font-bold text-gray-800 mb-6">Send us a Message</Typography>

                  <form className="space-y-6">
                    <div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Your Message"
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    </div>
                    <Button
                      variant="contained"
                      size="large"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container maxWidth="md" className="text-center">
          <Typography variant="h3" className="text-gray-800 font-bold mb-4">
            Ready to Take Control of Your Health?
          </Typography>
          <Typography variant="h6" className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied patients who have transformed their healthcare experience with our platform.
          </Typography>
          <Button
            variant="contained"
            size="large"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            component={Link}
            to="/signup"
          >
            Create Your Account
          </Button>
        </Container>
      </div>
    </div>
  );
};

export default Home;