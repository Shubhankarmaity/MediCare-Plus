import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Calendar,
    Users,
    Activity,
    Clock,
    Shield,
    Award,
    Phone,
    ArrowRight,
    Stethoscope,
    HeartPulse,
    Microscope,
    Search,
    CheckCircle,
    Star,
    MapPin,
    Bed,
    ChevronDown,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@mui/material'; // Keeping for Avatar support if needed, or replace with img
import cityGeneralImg from '../assets/images/city hospital.avif';
import metropolitanImg from '../assets/images/hospital4.avif';
import greenValleyImg from '../assets/images/hospital3.avif';
import { API_URL } from '../config';

const Home = () => {
    const navigate = useNavigate();

    // State for dynamic data
    const [hospitals, setHospitals] = useState([]);
    const [dbDoctors, setDbDoctors] = useState([]);
    const [insuranceStats, setInsuranceStats] = useState({ 'HDFC ERGO': 0, 'Niva Bupa': 0 });
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [activeFaq, setActiveFaq] = useState(null);

    const videoSources = [
        "https://assets.mixkit.co/videos/5568/5568-720.mp4",
        "https://assets.mixkit.co/videos/23069/23069-720.mp4",
        "https://assets.mixkit.co/videos/6562/6562-720.mp4"
    ];

    const handleVideoEnded = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
    };

    // Auth Protection Handler
    const handleProtectedAction = (path) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            navigate(path);
        }
    };


    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const services = [
        {
            icon: <Stethoscope className="w-8 h-8 text-sky-600" />,
            title: "Primary Care",
            desc: "Comprehensive general health services for patients of all ages, focusing on prevention and wellness.",
            link: "/doctors?specialty=General"
        },
        {
            icon: <HeartPulse className="w-8 h-8 text-rose-500" />,
            title: "Cardiology",
            desc: "Advanced cardiac care including diagnostics, treatment, and rehabilitation by top specialists.",
            link: "/doctors?specialty=Cardiology"
        },
        {
            icon: <Microscope className="w-8 h-8 text-teal-500" />,
            title: "Laboratory",
            desc: "State-of-the-art diagnostic testing with quick turnaround times for accurate results.",
            link: "/lab-tests"
        },
        {
            icon: <Activity className="w-8 h-8 text-indigo-500" />,
            title: "Emergency",
            desc: "24/7 rapid response emergency care equipped to handle critical medical situations.",
            link: "/hospitals?query=emergency"
        },
        {
            icon: <Users className="w-8 h-8 text-amber-500" />,
            title: "Pediatrics",
            desc: "Specialized care for infants, children, and adolescents in a child-friendly environment.",
            link: "/doctors?specialty=Pediatrics"
        },
        {
            icon: <Shield className="w-8 h-8 text-emerald-500" />,
            title: "Surgery",
            desc: "Modern surgical procedures using minimally invasive techniques for faster recovery.",
            link: "/doctors?specialty=Surgery"
        }
    ];

    // Logic to Fetch All Data
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Featured Hospitals
                const hospRes = await fetch(`${API_URL}/api/hospitals`);
                const hospData = await hospRes.json();
                const featured = hospData.slice(0, 4).map(hospital => {
                    const name = hospital.name.toLowerCase();
                    let img = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                    if (name.includes('city general')) img = cityGeneralImg;
                    else if (name.includes('metropolitan')) img = metropolitanImg;
                    else if (name.includes('green valley')) img = greenValleyImg;
                    return { ...hospital, image: img };
                });
                setHospitals(featured);

                // 2. Fetch Public Specialists
                const docRes = await fetch(`${API_URL}/api/doctors/public-preview`);
                if (docRes.ok) {
                    const docData = await docRes.json();
                    setDbDoctors(docData.slice(0, 3)); // Show top 3
                }

                // 3. Fetch Insurance Highlights
                const insRes = await fetch(`${API_URL}/api/hospitals/insurance-highlights`);
                if (insRes.ok) {
                    const insData = await insRes.json();
                    setInsuranceStats(insData);
                }

            } catch (error) {
                console.error("Home data fetch failed:", error);
            }
        };
        fetchData();
    }, []);

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

    const faqItems = [
        {
            q: "How do I book an appointment?",
            a: "Simply log in to your patient dashboard, search for a doctor or hospital, and click the 'Book Appointment' button. You can choose your preferred time and department."
        },
        {
            q: "Does my insurance cover cashless treatment?",
            a: "Yes! We have a vast network of partner hospitals that support cashless treatment for companies like HDFC ERGO and Niva Bupa. Check the 'Mediclaim' flag on hospital cards."
        },
        {
            q: "Is emergency care available 24/7?",
            a: "Absolutely. All hospitals marked with the 'Emergency' badge provide 24/7 trauma and urgent care services."
        },
        {
            q: "How can I access my medical records?",
            a: "Your medical history and prescriptions are securely stored in your Profile. You can also grant temporary access to doctors when needed."
        }
    ];

    return (
        <div className="font-sans antialiased text-slate-800">
            {/* Hero Section with Video Background */}
            <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
                {/* Background Video */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/40 z-10"></div>
                    <video
                        key={currentVideoIndex}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        onEnded={handleVideoEnded}
                    >
                        <source src={videoSources[currentVideoIndex]} type="video/mp4" />
                    </video>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <div className="inline-flex items-center gap-2 bg-sky-500/20 backdrop-blur-md border border-sky-400/30 text-sky-200 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                            <Award className="w-4 h-4" />
                            <span>#1 Ranked Hospital in the Region</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-8">
                            Modern Healthcare <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
                                For Your Whole Family
                            </span>
                        </h1>
                        <p className="text-slate-200 text-xl mb-10 leading-relaxed max-w-2xl">
                            Experience world-class medical care with enhanced technology and compassionate experts.
                            <br className="hidden md:block" /> Your health journey, reimagined.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search Hospital Button - Primary Action */}
                            <button onClick={() => navigate('/hospitals')} className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4 cursor-pointer">
                                <Search className="w-5 h-5" /> Find Hospital
                            </button>

                            {/* Book Appointment - Secondary Action (PROTECTED) */}
                            <button
                                onClick={() => handleProtectedAction('/patient-dashboard')}
                                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Calendar className="w-5 h-5" /> Book Appointment
                            </button>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-slate-300">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-sky-400" />
                                <span className="font-medium">JCI Accredited</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-sky-400" />
                                <span className="font-medium">24/7 Support</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-sky-400" />
                                <span className="font-medium">50+ Specialists</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Strip */}
            <section className="bg-sky-600 py-12 relative z-20 -mt-2">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
                        {[
                            { label: "Expert Doctors", value: "500+" },
                            { label: "Successful Surgeries", value: "20k+" },
                            { label: "Patient Satisfaction", value: "99%" },
                            { label: "Years Experience", value: "25+" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                className="space-y-1"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <p className="text-4xl lg:text-5xl font-bold">{stat.value}</p>
                                <p className="text-sky-100 font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Access / Services Section */}
            <section id="services" className="py-12 md:py-20 lg:py-28 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-16"
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-sky-600 font-bold uppercase tracking-wide text-sm mb-3">Our Services</h2>
                        <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Comprehensive Care Solutions</h3>
                        <p className="text-slate-600 text-lg">We provide a wide range of medical services designed to meet your specific health needs.</p>
                    </motion.div>

                    {/* Quick Actions Row */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-4 mb-16"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <button onClick={() => navigate('/ambulance')} className="px-6 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2 cursor-pointer">
                            <Activity size={20} /> Ambulance
                        </button>
                        <button onClick={() => navigate('/lab-tests')} className="px-6 py-3 rounded-xl bg-teal-50 text-teal-700 font-semibold hover:bg-teal-100 transition-colors flex items-center gap-2 cursor-pointer">
                            <Microscope size={20} /> Lab Tests
                        </button>
                        <button onClick={() => navigate('/hospitals')} className="px-6 py-3 rounded-xl bg-sky-50 text-sky-700 font-semibold hover:bg-sky-100 transition-colors flex items-center gap-2 cursor-pointer">
                            <Search size={20} /> Find Hospital
                        </button>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="group p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                            >
                                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:shadow-md transition-colors border border-transparent group-hover:border-slate-100">
                                    {service.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">{service.title}</h4>
                                <p className="text-slate-500 mb-6 leading-relaxed">{service.desc}</p>
                                <span className="inline-flex items-center text-sky-600 font-semibold group-hover:gap-2 transition-all">
                                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Featured Hospitals Section (New from DB) */}
            <section className="py-12 md:py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-sky-600 font-bold uppercase tracking-wide text-sm mb-3">Our Network</h2>
                            <h3 className="text-3xl font-bold text-slate-900">Featured Hospitals</h3>
                        </div>
                        <Link to="/hospitals" className="hidden lg:flex items-center text-sky-600 font-semibold hover:gap-2 transition-all">
                            View All <ArrowRight className="w-5 h-5 ml-1" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {hospitals.map((hospital, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-amber-500 shadow-sm">
                                        <Star size={12} fill="currentColor" /> {hospital.rating}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h4 className="font-bold text-slate-900 mb-1 line-clamp-1" title={hospital.name}>{hospital.name}</h4>
                                    <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
                                        <MapPin size={14} /> {hospital.city}
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-3 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <Bed size={16} className="text-sky-500" />
                                            <span className="font-semibold">{hospital.beds}</span> Beds
                                        </div>
                                        <span className="text-xs font-medium bg-sky-50 text-sky-700 px-2 py-1 rounded-md">
                                            {hospital.facilities[0]}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleProtectedAction(`/hospitals/${hospital._id}`)}
                                        className="w-full mt-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Insurance Network Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">CASHLESS NETWORK</span>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-2 mb-6">Our Insurance Partners</h2>
                            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                We've partnered with India's leading insurance providers to ensure you get best-in-class healthcare without financial stress. Access over 50+ network hospitals with 100% cashless facility.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {[
                                    { name: 'HDFC ERGO', count: insuranceStats['HDFC ERGO'], color: 'bg-blue-50 text-blue-700' },
                                    { name: 'Niva Bupa', count: insuranceStats['Niva Bupa'], color: 'bg-rose-50 text-rose-700' }
                                ].map((ins, i) => (
                                    <div key={i} className={`p-6 rounded-2xl border border-transparent hover:border-slate-200 transition-all ${ins.color}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <ShieldCheck size={24} />
                                            <span className="font-bold text-xl">{ins.name}</span>
                                        </div>
                                        <p className="text-sm opacity-80 font-medium"> 5 Network Hospitals</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => navigate('/hospitals')}
                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition-all transform hover:scale-105"
                            >
                                Check Cashless Availability <ArrowRight size={20} />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl"
                        >
                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold mb-4">Mediclaim Benefits</h3>
                                <ul className="space-y-4">
                                    {[
                                        "Zero out-of-pocket expenses for network hospitals",
                                        "Priority admission and discharge process",
                                        "Dedicated insurance desk at all locations",
                                        "100% transparent billing and processing"
                                    ].map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1 bg-white/20 p-1 rounded-full">
                                                <CheckCircle size={16} />
                                            </div>
                                            <span className="font-medium">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-10 p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
                                    <p className="italic text-blue-100">
                                        "The cashless process was so smooth. I didn't have to worry about anything except my recovery."
                                    </p>
                                    <p className="mt-4 font-bold">- Arjay Maity, Patient</p>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* About Section - Modern Split with Parallax effect */}
            <section id="about" className="py-12 md:py-24 bg-white relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-20 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-[100px]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            className="lg:w-1/2 relative"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-700">
                                <img
                                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Medical Team"
                                    className="w-full h-auto"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                    <h5 className="text-white font-bold text-xl">World-Class Facilities</h5>
                                    <p className="text-gray-300">Equipped with latest diagnostic tech</p>
                                </div>
                            </div>
                            {/* Floating Badge */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ delay: 0.4 }}
                                className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden sm:block"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <Star className="text-blue-600" fill="currentColor" size={24} />
                                    </div>
                                    <div>
                                        <h6 className="font-bold text-gray-900 text-lg">#1 Choice</h6>
                                        <span className="text-gray-500 font-bold text-xs">IN REGION</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="lg:w-1/2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="text-indigo-600 font-bold tracking-widest text-sm uppercase">ABOUT MEDICARE PLUS</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-2 mb-6 leading-tight">
                                Leading the Way in <br />
                                <span className="text-sky-600">Medical Excellence</span>
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8">
                                For over two decades, MediCare Plus has stood as a beacon of hope and healing.
                                We combine compassionate care with cutting-edge technology to deliver outcomes that matter.
                            </p>

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
                                        <span className="font-medium text-slate-700">{item}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <Link to="/team" className="btn-primary inline-flex items-center">
                                Meet Our Team
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials - Staggered Cards */}
            <section className="py-12 md:py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">
                            Trusted by Thousands
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                whileHover={{ y: -10 }}
                                className="bg-white p-8 rounded-3xl h-full border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar src={t.avatar} alt={t.name} sx={{ width: 56, height: 56 }} className="ring-4 ring-white shadow-md" />
                                    <div>
                                        <h6 className="font-bold text-slate-900 text-lg">{t.name}</h6>
                                        <p className="text-sky-600 font-medium text-sm">{t.role}</p>
                                    </div>
                                </div>
                                <p className="text-slate-600 italic leading-relaxed">"{t.content}"</p>
                                <div className="flex gap-1 mt-6 text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 md:py-32 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-slate-600 text-lg">Everything you need to know about our services and process.</p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqItems.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
                            >
                                <button
                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-bold text-lg text-slate-900">{item.q}</span>
                                    <ChevronDown
                                        className={`text-slate-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`}
                                        size={20}
                                    />
                                </button>
                                <AnimatePresence>
                                    {activeFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden bg-slate-50/50"
                                        >
                                            <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100/50">
                                                {item.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctors Preview */}
            <section className="py-12 md:py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-sky-600 font-bold uppercase tracking-wide text-sm mb-3">Our Team</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Meet Our Specialists</h3>
                        </div>
                        <button onClick={() => navigate('/doctors')} className="hidden lg:flex items-center text-sky-600 font-semibold hover:gap-2 transition-all cursor-pointer">
                            View All Doctors <ArrowRight className="w-5 h-5 ml-1" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(dbDoctors.length > 0 ? dbDoctors : Array(3).fill(null)).map((doctor, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                <div className="h-72 overflow-hidden relative">
                                    <img
                                        src={doctor?.profilePic || `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600&h=600`}
                                        alt={doctor?.name || "Doctor"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm border border-blue-100">
                                            {doctor?.specialization || "Medical Specialist"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <h4 className="text-xl font-bold text-slate-900 mb-1">{doctor?.name || "Loading Dr..."}</h4>
                                    <p className="text-slate-500 font-medium mb-1 text-sm">{doctor?.role || "Specialist"}</p>
                                    <p className="text-sky-600 font-bold mb-4 text-xs">{doctor?.hospitalName || "MediCare Partner"}</p>
                                    <button
                                        onClick={() => doctor && navigate(`/doctors/${doctor._id}`)}
                                        className="inline-flex items-center gap-2 text-slate-900 font-bold text-sm bg-slate-50 hover:bg-slate-100 px-6 py-2.5 rounded-full transition-colors w-full justify-center"
                                    >
                                        Book Appointment <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-slate-900 text-slate-300 py-20 px-4 border-t border-slate-800">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        {/* Column 1: About */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-white text-2xl font-bold">
                                <div className="bg-sky-500 p-2 rounded-lg">
                                    <Activity className="text-white" size={24} />
                                </div>
                                MediCare <span className="text-sky-500">Plus</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">
                                Redefining healthcare through technology and compassion. We provide world-class medical services across a vast network of partner hospitals.
                            </p>
                            <div className="flex gap-4">
                                {/* Social placeholders could go here */}
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-sky-500 transition-colors cursor-pointer">
                                    <Shield size={18} />
                                </div>
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-sky-500 transition-colors cursor-pointer">
                                    <Phone size={18} />
                                </div>
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-sky-500 transition-colors cursor-pointer">
                                    <MapPin size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
                            <ul className="space-y-4">
                                {['Find a Doctor', 'Our Hospitals', 'Book Appointment', 'Mediclaim Center', 'Emergency Care'].map((link, i) => (
                                    <li key={i}>
                                        <button onClick={() => navigate('/hospitals')} className="hover:text-sky-400 transition-colors">
                                            {link}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Departments */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">Medical Departments</h4>
                            <ul className="space-y-4">
                                {['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Orthopedics'].map((link, i) => (
                                    <li key={i}>
                                        <button onClick={() => navigate(`/doctors?specialty=${link}`)} className="hover:text-sky-400 transition-colors">
                                            {link}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Contact */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">Connect with Us</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <Phone className="text-sky-500 mt-1" size={20} />
                                    <div>
                                        <p className="text-white font-semibold">24/7 Helpline</p>
                                        <p className="text-slate-400">+1 (234) 567-890</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-sky-500 mt-1" size={20} />
                                    <div>
                                        <p className="text-white font-semibold">Location</p>
                                        <p className="text-slate-400">123 Health Ave, Medical City</p>
                                    </div>
                                </div>
                                <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl mt-6">
                                    <p className="text-sky-400 font-bold text-sm uppercase mb-1">Emergency Service</p>
                                    <p className="text-white font-bold text-xl">Call 112</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
                        <p>© {new Date().getFullYear()} MediCare Plus. All rights reserved.</p>
                        <div className="flex gap-8">
                            <button className="hover:text-white transition-colors">Privacy Policy</button>
                            <button className="hover:text-white transition-colors">Terms of Use</button>
                            <button className="hover:text-white transition-colors">Cookie Policy</button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
