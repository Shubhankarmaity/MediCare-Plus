import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, CardContent, Button, Chip } from '@mui/material';
import { MapPin, Phone, Mail, Award, BookOpen, Clock, Activity, Star, Calendar, Globe, GraduationCap, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const DoctorDetails = () => {
    const { id } = useParams();

    // Mock Data (matching Home.jsx + extra details)
    // In a real app, this would fetch from API based on ID
    const doctors = [
        {
            id: 0,
            name: "Dr. Sarah Johnson",
            role: "Chief Cardiologist",
            specialty: "Cardiology",
            hospital: "City General Hospital",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300",
            about: "Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience in diagnosing and treating complex heart conditions. She leads the cardiology department at City General, pioneering minimally invasive procedures.",
            education: [
                "MD, Harvard Medical School",
                "Residency in Internal Medicine, Johns Hopkins",
                "Fellowship in Cardiology, Cleveland Clinic"
            ],
            experience: "15+ Years",
            languages: ["English", "Spanish"],
            rating: 4.9,
            reviews: 124
        },
        {
            id: 1,
            name: "Dr. James Wilson",
            role: "Senior Neurologist",
            specialty: "Neurology",
            hospital: "Sunrise Medical Center",
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300",
            about: "Dr. James Wilson specializes in neurological disorders, including stroke, epilepsy, and multiple sclerosis. He is dedicated to providing compassionate care and utilizing the latest neurological research in his treatments.",
            education: [
                "MD, Stanford University School of Medicine",
                "Residency in Neurology, UCSF Medical Center",
                "PhD in Neuroscience, MIT"
            ],
            experience: "12+ Years",
            languages: ["English", "Mandarin"],
            rating: 4.8,
            reviews: 98
        },
        {
            id: 2,
            name: "Dr. Emily Chen",
            role: "Head Pediatrician",
            specialty: "Pediatrics",
            hospital: "Green Valley Rehab",
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300",
            about: "Dr. Emily Chen provides comprehensive care for infants, children, and adolescents. Her warm approach and expertise in developmental pediatrics make her a favorite among families in the Green Valley area.",
            education: [
                "MD, Yale School of Medicine",
                "Residency in Pediatrics, Children's Hospital of Philadelphia",
                "Fellowship in Pediatric Critical Care"
            ],
            experience: "10+ Years",
            languages: ["English", "French"],
            rating: 4.9,
            reviews: 156
        }
    ];

    const doctor = doctors[id] || doctors[0]; // Fallback to first if not found

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Hero Profile Header */}
            <div className="bg-white shadow-sm border-b border-slate-200">
                <Container maxWidth="lg" className="py-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full md:w-64 flex-shrink-0"
                        >
                            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                                <img src={doctor.image} alt={doctor.name} className="w-full h-auto object-cover" />
                            </div>
                            <div className="mt-4 flex justify-center gap-2">
                                <span className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                    <Star size={14} fill="currentColor" /> {doctor.rating} Rating
                                </span>
                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                                    {doctor.reviews} Reviews
                                </span>
                            </div>
                        </motion.div>

                        <div className="flex-grow pt-2">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <span className="text-sky-600 font-bold tracking-wider text-sm uppercase mb-1 block">{doctor.specialty}</span>
                                <h1 className="text-4xl font-bold text-slate-900 mb-2">{doctor.name}</h1>
                                <p className="text-xl text-slate-500 mb-6">{doctor.role} at <span className="text-slate-700 font-semibold">{doctor.hospital}</span></p>

                                <div className="flex flex-wrap gap-4 mb-8">
                                    <div className="flex items-center text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
                                        <Briefcase size={18} className="mr-2 text-sky-600" />
                                        <span>{doctor.experience} Experience</span>
                                    </div>
                                    <div className="flex items-center text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
                                        <Globe size={18} className="mr-2 text-sky-600" />
                                        <span>Speaks {doctor.languages.join(", ")}</span>
                                    </div>
                                    <div className="flex items-center text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
                                        <MapPin size={18} className="mr-2 text-sky-600" />
                                        <span>{doctor.hospital}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        component={Link}
                                        to="/login"
                                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 py-3 rounded-xl normal-case"
                                    >
                                        Book Appointment
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-8 py-3 rounded-xl normal-case"
                                    >
                                        Send Message
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </div>

            <Container maxWidth="lg" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Detailed Info */}
                    <div className="md:col-span-2 space-y-8">
                        {/* About Section */}
                        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <CardContent className="p-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Activity className="text-sky-600" /> About Dr. {doctor.name.split(' ')[1]}
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    {doctor.about}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Education & Credentials */}
                        <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <CardContent className="p-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <GraduationCap className="text-sky-600" /> Education & Credentials
                                </h3>
                                <div className="space-y-6">
                                    {doctor.education.map((edu, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="mt-1">
                                                <div className="w-3 h-3 rounded-full bg-sky-200 ring-4 ring-sky-50"></div>
                                            </div>
                                            <div>
                                                <p className="text-slate-800 font-medium text-lg">{edu}</p>
                                                <p className="text-slate-500 text-sm">Completed with Honors</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Clock className="text-sky-600" size={20} /> Availability
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Mon - Fri</span>
                                    <span className="font-medium text-slate-900">9:00 AM - 5:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Saturday</span>
                                    <span className="font-medium text-slate-900">10:00 AM - 2:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Sunday</span>
                                    <span className="text-red-500 font-medium">Closed</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-2xl shadow-sm border border-slate-100 p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                            <h4 className="font-bold text-xl mb-2">Need a consult?</h4>
                            <p className="text-indigo-100 mb-6">Book an appointment online and get priority access.</p>
                            <Button
                                variant="contained"
                                fullWidth
                                component={Link}
                                to="/login"
                                className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold py-3 rounded-xl normal-case"
                            >
                                Schedule Now
                            </Button>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default DoctorDetails;
