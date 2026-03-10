import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Calendar, Users, Activity, Clock, Shield, Award, Phone, ArrowRight,
    Stethoscope, HeartPulse, Microscope, Search, CheckCircle, Star, MapPin,
    Bed, ShieldCheck, FileText, ChevronDown, ChevronUp, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '@mui/material'; // Keeping for Avatar support if needed, or replace with img
import { resolveHospitalImage } from '../utils/hospitalImages';
import { API_URL } from '../config';

const Home = () => {
    const navigate = useNavigate();

    // State for dynamic data
    const [hospitals, setHospitals] = useState([]);
    const [insuranceStats, setInsuranceStats] = useState({ 'HDFC ERGO': 0, 'Niva Bupa': 0 });
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

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



    const specialities = [
        {
            icon: <HeartPulse className="w-8 h-8 text-white" />,
            title: "Cardiology",
            desc: "Advanced cardiac care, interventions, and surgeries by renowned heart specialists.",
            link: "/hospitals",
            bg: "bg-blue-600"
        },
        {
            icon: <Activity className="w-8 h-8 text-white" />,
            title: "Neurology",
            desc: "Comprehensive diagnosis and treatment for all neurological block and brain conditions.",
            link: "/hospitals",
            bg: "bg-teal-600"
        },
        {
            icon: <Users className="w-8 h-8 text-white" />,
            title: "Pediatrics",
            desc: "Specialized, compassionate care for infants, children, and adolescents.",
            link: "/hospitals",
            bg: "bg-indigo-600"
        },
        {
            icon: <CheckCircle className="w-8 h-8 text-white" />,
            title: "Orthopedics",
            desc: "Expert treatment for bone, joint, and spine disorders with modern rehab facilities.",
            link: "/hospitals",
            bg: "bg-emerald-600"
        },
        {
            icon: <Shield className="w-8 h-8 text-white" />,
            title: "Oncology",
            desc: "State-of-the-art cancer treatment, chemotherapy, and radiation therapy.",
            link: "/hospitals",
            bg: "bg-rose-600"
        },
        {
            icon: <Stethoscope className="w-8 h-8 text-white" />,
            title: "General Medicine",
            desc: "Primary care and management of chronic adult illnesses and preventive health.",
            link: "/hospitals",
            bg: "bg-sky-600"
        }
    ];

    // Logic to Fetch All Data
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Featured Hospitals
                const hospRes = await fetch(`${API_URL}/api/hospitals`);
                if (hospRes.ok) {
                    const hospData = await hospRes.json();
                    const featured = (Array.isArray(hospData) ? hospData : []).slice(0, 4).map((hospital, idx) => {
                        return { ...hospital, image: resolveHospitalImage(hospital, idx) };
                    });
                    setHospitals(featured);
                } else {
                    console.error("Failed to fetch hospitals, status:", hospRes.status);
                    setHospitals([]);
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

    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: "What are the visiting hours for inpatient wards?",
            a: "General visiting hours are from 10:00 AM to 1:00 PM and 5:00 PM to 8:00 PM. Intensive Care Units (ICU) have restricted visiting hours from 11:00 AM to 12:00 PM and 6:00 PM to 7:00 PM, limited to immediate family members only."
        },
        {
            q: "What is the protocol for emergency admissions?",
            a: "Our Emergency Department operates 24/7. Patients arriving in critical condition are immediately assessed by the triage nurse and attended to by the emergency physician. Registration formalities can be completed by accompanying members subsequently."
        },
        {
            q: "How can I access my diagnostic reports?",
            a: "All verified diagnostic and laboratory reports can be securely downloaded from our online Patient Portal using your registered Patient ID and mobile number, or collected physically from the central records desk on the ground floor."
        },
        {
            q: "Do you offer cashless hospitalization?",
            a: "Yes, we are empanelled with over 50+ major health insurance providers and Third Party Administrators (TPAs). Please contact our Insurance Desk during admission with your policy details for pre-authorization."
        }
    ];

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
        <div className="font-sans antialiased text-slate-800 bg-gray-50">
            {/* Top Emergency Banner */}
            <div className="bg-red-700 text-white py-2 px-4 text-center text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                <span>24/7 Clinical Emergency Response: <a href="tel:112" className="underline hover:text-red-100 ml-1">112</a> OR <a href="tel:+1234567890" className="underline hover:text-red-100 ml-1">1-800-MEDICARE</a></span>
            </div>

            {/* Hero Section */}
            <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-primary-navy">
                {/* Background Video */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-primary-navy/80 mix-blend-multiply z-10"></div>
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
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 border-l-4 border-blue-500 bg-white/10 text-white px-4 py-2 text-sm font-bold uppercase tracking-widest mb-6">
                            <Award className="w-4 h-4" />
                            <span>Nationally Recognized Clinical Excellence</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-8">
                            Excellence in Clinical Care <br />
                            <span className="text-white">
                                & Medical Research
                            </span>
                        </h1>
                        <p className="text-gray-200 text-xl font-medium mb-10 leading-relaxed max-w-2xl border-l-2 border-gray-400 pl-4">
                            Delivering world-class medical expertise, advanced technology, and compassionate patient care.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => navigate('/hospitals')} className="bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center gap-2 text-lg px-8 py-3 cursor-pointer rounded-sm font-bold transition-colors">
                                <Search className="w-5 h-5" /> Find Hospital
                            </button>

                            <button
                                onClick={() => handleProtectedAction('/patient-dashboard')}
                                className="bg-white text-slate-900 border border-transparent px-8 py-3 rounded-sm font-bold text-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Calendar className="w-5 h-5" /> Book Appointment
                            </button>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-slate-200">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                <span className="font-bold tracking-wide uppercase text-sm">JCI Accredited</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span className="font-bold tracking-wide uppercase text-sm">24/7 Response Facility</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span className="font-bold tracking-wide uppercase text-sm">Board-Certified Specialists</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Accreditation Badges */}
            <section className="bg-slate-100 py-6 border-b border-slate-300">
                <div className="container mx-auto px-4 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
                        {/* Placeholder generic clinical looking badges */}
                        <div className="flex items-center gap-2 font-bold text-slate-800 tracking-widest uppercase text-sm">
                            <Shield className="w-5 h-5 text-slate-700" /> JCI Accredited
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-800 tracking-widest uppercase text-sm">
                            <Award className="w-5 h-5 text-slate-700" /> NABH Certified
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-800 tracking-widest uppercase text-sm">
                            <CheckCircle className="w-5 h-5 text-slate-700" /> NABL Approved Lab
                        </div>
                        <div className="flex items-center gap-2 font-bold text-slate-800 tracking-widest uppercase text-sm">
                            <Activity className="w-5 h-5 text-slate-700" /> ISO 9001:2015
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Strip */}
            <section className="bg-[#0c2340] py-12 relative z-20 border-b-4 border-blue-600">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
                        {[
                            { label: "Expert Doctors", value: "500+" },
                            { label: "Successful Surgeries", value: "20k+" },
                            { label: "Patient Satisfaction", value: "99%" },
                            { label: "Years Experience", value: "25+" }
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="space-y-1 border-r border-slate-600 last:border-0"
                            >
                                <p className="text-4xl lg:text-5xl font-bold">{stat.value}</p>
                                <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Departments / Specialities Section */}
            <section id="specialities" className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-start border-l-4 border-blue-700 pl-6 mb-16">
                        <span className="text-slate-500 font-bold tracking-widest text-sm uppercase mb-2">Centers of Excellence</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Clinical Departments</h2>
                        <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
                            We provide comprehensive, world-class medical care across a wide range of specialized departments, equipped with the latest technology and staffed by renowned experts.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-slate-200">
                        {specialities.map((speciality, index) => (
                            <Link
                                to={speciality.link}
                                key={index}
                                className="group bg-white border-b border-r border-slate-200 hover:bg-slate-50 transition-colors p-8 flex flex-col h-full"
                            >
                                <div className={`w-14 h-14 flex items-center justify-center mb-6 bg-slate-100 rounded-sm`}>
                                    {React.cloneElement(speciality.icon, { className: "w-7 h-7 text-slate-700" })}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{speciality.title}</h3>
                                <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
                                    {speciality.desc}
                                </p>
                                <div className="mt-auto flex items-center text-blue-700 font-bold text-sm uppercase tracking-wide group-hover:gap-2 transition-all">
                                    View Department Information <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section >

            {/* Featured Hospitals Section (New from DB) */}
            < section className="py-12 md:py-20 bg-background border-t border-divider-gray" >
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-primary-blue font-bold uppercase tracking-wide text-sm mb-3">Our Network</h2>
                            <h3 className="heading-h2">Featured Hospitals</h3>
                        </div>
                        <Link to="/hospitals" className="hidden lg:flex items-center text-primary-blue font-semibold hover:gap-2 transition-all">
                            View All <ArrowRight className="w-5 h-5 ml-1" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {hospitals.map((hospital, i) => (
                            <div
                                key={i}
                                className="card-clinical p-0 overflow-hidden group flex flex-col"
                            >
                                <div className="h-48 overflow-hidden relative border-b border-divider-gray">
                                    <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-3 right-3 bg-white border border-divider-gray px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-primary-navy shadow-clinical">
                                        <Star size={14} className="text-warning-yellow" fill="currentColor" /> {hospital.rating}
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h4 className="heading-h3 mb-2 line-clamp-1" title={hospital.name}>{hospital.name}</h4>
                                    <div className="flex items-center gap-1 text-body-gray text-sm mb-4">
                                        <MapPin size={16} className="text-primary-blue" /> {hospital.city}
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-4 border-t border-divider-gray mb-2">
                                        <div className="flex items-center gap-1.5 text-body-gray">
                                            <Bed size={16} className="text-primary-blue" />
                                            <span className="font-semibold text-primary-navy">{hospital.beds}</span> Beds
                                        </div>
                                        <span className="text-xs font-medium bg-muted-teal/30 text-primary-navy px-2 py-1 rounded-sm border border-divider-gray">
                                            {hospital.facilities[0]}
                                        </span>
                                    </div>
                                    <div className="mt-auto">
                                        <button
                                            onClick={() => handleProtectedAction(`/hospitals/${hospital._id}`)}
                                            className="btn-outline w-full text-sm"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Hospital Gallery Preview */}
            <section className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="text-slate-500 font-bold tracking-widest text-sm uppercase mb-3 block">Infrastructure</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                            Clinical Facilities
                        </h2>
                        <div className="w-16 h-1 bg-blue-700 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-2 row-span-2 group overflow-hidden bg-slate-200 relative">
                            <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Operation Theatre" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-6">
                                <span className="text-white font-bold tracking-wider uppercase">Advanced Surgical Suites</span>
                            </div>
                        </div>
                        <div className="group overflow-hidden bg-slate-200 relative aspect-square">
                            <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="ICU" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-4">
                                <span className="text-white font-bold tracking-wider uppercase text-sm">Intensive Care Units</span>
                            </div>
                        </div>
                        <div className="group overflow-hidden bg-slate-200 relative aspect-square">
                            <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Patient Room" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-4">
                                <span className="text-white font-bold tracking-wider uppercase text-sm">Inpatient Wards</span>
                            </div>
                        </div>
                        <div className="group overflow-hidden bg-slate-200 relative aspect-square">
                            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Laboratory" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-4">
                                <span className="text-white font-bold tracking-wider uppercase text-sm">Diagnostic Labs</span>
                            </div>
                        </div>
                        <div className="group overflow-hidden bg-slate-200 relative aspect-square">
                            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Reception" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-4">
                                <span className="text-white font-bold tracking-wider uppercase text-sm">Central Reception</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Download Medical Reports UI */}
            <section className="py-20 bg-[#0c2340] border-t-4 border-blue-600">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 border-l-4 border-blue-500 bg-white/10 text-white px-4 py-2 text-sm font-bold uppercase tracking-widest mb-6">
                                <FileText className="w-4 h-4" />
                                <span>Patient Records Portal</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Access Clinical <br />Reports Instantly
                            </h2>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                Securely view and download your laboratory test results, discharge summaries, and radiology imaging reports directly from our centralized electronic health record system.
                            </p>
                        </div>

                        <div className="bg-white rounded-sm p-8 shadow-2xl">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wide border-b border-slate-200 pb-4">Secure Report Access</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Patient ID (UHID)</label>
                                    <input type="text" placeholder="e.g. MCP-2026-X8Y9" className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-700 font-medium text-slate-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Registered Mobile No.</label>
                                    <input type="tel" placeholder="+91 " className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-blue-700 font-medium text-slate-900" />
                                </div>
                                <button className="w-full mt-4 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest transition-colors">
                                    <Download className="w-5 h-5" /> Retrieve Results
                                </button>
                                <p className="text-xs text-slate-500 text-center mt-4 uppercase tracking-wider font-semibold">
                                    AES-256 Encrypted Connection
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Insurance Network Section */}
            < section className="py-16 md:py-24 bg-white border-t border-slate-300" >
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-primary-blue font-bold tracking-widest text-sm uppercase">CASHLESS NETWORK</span>
                            <h2 className="heading-h1 mt-2 mb-6">Our Insurance Partners</h2>
                            <p className="text-body-gray text-lg mb-8 leading-relaxed">
                                We've partnered with India's leading insurance providers to ensure you get best-in-class healthcare without financial stress. Access over 50+ network hospitals with 100% cashless facility.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {[
                                    { name: 'HDFC ERGO', count: insuranceStats['HDFC ERGO'], color: 'bg-primary-navy text-white' },
                                    { name: 'Niva Bupa', count: insuranceStats['Niva Bupa'], color: 'bg-primary-navy text-white' }
                                ].map((ins, i) => (
                                    <div key={i} className={`p-6 rounded-lg border border-divider-gray transition-colors ${ins.color}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <ShieldCheck size={24} className="text-muted-teal" />
                                            <span className="font-bold text-xl">{ins.name}</span>
                                        </div>
                                        <p className="text-sm opacity-90 font-medium"> 5 Network Hospitals</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => navigate('/hospitals')}
                                className="btn-primary flex items-center gap-2"
                            >
                                Check Cashless Availability <ArrowRight size={20} />
                            </button>
                        </div>

                        <div
                            className="bg-primary-blue rounded-lg p-10 text-white relative shadow-clinical"
                        >
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-6 text-white">Mediclaim Benefits</h3>
                                <ul className="space-y-5">
                                    {[
                                        "Zero out-of-pocket expenses for network hospitals",
                                        "Priority admission and discharge process",
                                        "Dedicated insurance desk at all locations",
                                        "100% transparent billing and processing"
                                    ].map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="mt-1 bg-white border border-white/20 p-1 rounded-full text-primary-navy">
                                                <CheckCircle size={14} />
                                            </div>
                                            <span className="font-medium text-white/90">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-10 p-6 bg-primary-navy rounded-lg border border-primary-navy">
                                    <p className="italic text-muted-teal">
                                        "The cashless process was so smooth. I didn't have to worry about anything except my recovery."
                                    </p>
                                    <p className="mt-4 font-bold text-white">- Arjay Maity, Patient</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* FAQ Accordion Section */}
            <section className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-16">
                        <span className="text-slate-500 font-bold tracking-widest text-sm uppercase mb-3 block">Patient Information</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <div className="w-16 h-1 bg-blue-700 mx-auto"></div>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white border border-slate-300 rounded-sm">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                >
                                    <span className="font-bold text-slate-900 pr-4">{faq.q}</span>
                                    {openFaq === index ? (
                                        <ChevronUp className="w-5 h-5 text-blue-700 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                                        <p className="text-slate-600 leading-relaxed font-medium">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            < section id="about" className="py-16 md:py-24 bg-white border-t border-slate-300" >
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                                <img
                                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Medical Team Working"
                                    className="w-full h-auto object-cover object-center max-h-[500px]"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-primary-navy to-primary-navy/80 backdrop-blur-sm">
                                    <h5 className="text-white font-bold text-xl mb-1">State-of-the-Art Facilities</h5>
                                    <p className="text-gray-200 text-sm">Equipped with the latest diagnostic and surgical technology</p>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl border border-gray-200 shadow-xl hidden sm:block">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                        <Award className="text-primary-blue w-8 h-8" />
                                    </div>
                                    <div>
                                        <h6 className="font-extrabold text-primary-navy text-2xl">25+ Years</h6>
                                        <span className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Of Excellence</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2">
                            <span className="text-primary-blue font-bold tracking-wider text-sm uppercase mb-3 block">Why Choose Us</span>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-primary-navy mb-6 leading-tight">
                                Delivering Excellence in <br className="hidden md:block" />
                                <span className="text-primary-blue">Patient-Centered Care</span>
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                For over two decades, MediCare Plus has stood as a beacon of hope and healing.
                                We combine compassionate care with cutting-edge medical technology to deliver outcomes that matter most to our patients.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                {[
                                    { title: "JCI Accredited Facility", desc: "Internationally recognized quality standards" },
                                    { title: "24/7 Emergency Support", desc: "Always open, always ready for critical care" },
                                    { title: "Advanced Robotic Surgery", desc: "Precision procedures with faster recovery" },
                                    { title: "Expert Certified Doctors", desc: "Top-tier professionals across all specialties" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1 bg-blue-50 rounded-full p-2 flex-shrink-0 h-fit">
                                            <CheckCircle className="w-5 h-5 text-primary-blue" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary-navy mb-1">{item.title}</h4>
                                            <p className="text-gray-500 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link to="/team" className="btn-primary inline-flex items-center">
                                Learn More About Us <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section >

            {/* Static Testimonials Section */}
            < section className="py-16 md:py-24 bg-white border-t border-gray-200" >
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="text-primary-blue font-bold tracking-wider text-sm uppercase mb-3 block">Patient Stories</span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-primary-navy mb-4">
                            Trusted by Thousands
                        </h2>
                        <div className="w-24 h-1 bg-primary-blue mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className="bg-gray-50 p-8 rounded-xl border border-gray-200 h-full flex flex-col relative"
                            >
                                <div className="absolute top-6 right-8 text-blue-100">
                                    <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-8 flex-grow relative z-10 font-medium">
                                    "{t.content}"
                                </p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                                    <div>
                                        <h6 className="font-bold text-primary-navy">{t.name}</h6>
                                        <p className="text-primary-blue font-semibold text-sm">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Final CTA Section */}
            < section className="py-20 bg-primary-navy relative overflow-hidden" >
                <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply z-10"></div>
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-blue rounded-full blur-3xl opacity-20 z-0"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-teal-500 rounded-full blur-3xl opacity-20 z-0"></div>

                <div className="container mx-auto px-4 max-w-4xl text-center relative z-20">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                        Ready to Prioritize Your Health?
                    </h2>
                    <p className="text-blue-100 text-xl mb-10 leading-relaxed">
                        Don't wait to get the care you deserve. Book an appointment with our specialists today and take the first step towards a healthier tomorrow.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => handleProtectedAction('/patient-dashboard')}
                            className="bg-white text-primary-navy hover:bg-gray-100 font-bold py-4 px-10 rounded-md text-lg transition-colors shadow-lg"
                        >
                            Book Your Appointment Today
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-transparent text-white border-2 border-white/30 hover:bg-white/10 font-bold py-4 px-10 rounded-md text-lg transition-colors"
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            </section >

            {/* Footer */}
            {/* Professional Footer */}
            <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="w-8 h-8 text-primary-blue" />
                                <span className="text-2xl font-bold text-white tracking-tight">MediCare Plus</span>
                            </div>
                            <p className="text-sm leading-relaxed mb-6 text-slate-400">
                                Delivering world-class medical care with compassion and excellence. Your health is our primary mission and highest priority.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-blue hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-blue hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-blue hover:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
                            <ul className="space-y-3">
                                <li><Link to="/" className="hover:text-primary-blue transition-colors">About Us</Link></li>
                                <li><Link to="/hospitals" className="hover:text-primary-blue transition-colors">Find a Doctor</Link></li>
                                <li><Link to="/hospitals" className="hover:text-primary-blue transition-colors">Our Hospitals</Link></li>
                                <li><Link to="/hospitals" className="hover:text-primary-blue transition-colors">Departments</Link></li>
                                <li><Link to="/patient-dashboard" className="hover:text-primary-blue transition-colors">Patient Portal</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">Our Services</h4>
                            <ul className="space-y-3">
                                <li><Link to="/ambulance" className="hover:text-primary-blue transition-colors">Emergency Care 24/7</Link></li>
                                <li><Link to="/lab-tests" className="hover:text-primary-blue transition-colors">Laboratory Tests</Link></li>
                                <li><Link to="/ambulance" className="hover:text-primary-blue transition-colors">Ambulance Booking</Link></li>
                                <li><Link to="/hospitals" className="hover:text-primary-blue transition-colors">Insurance Information</Link></li>
                                <li><Link to="/" className="hover:text-primary-blue transition-colors">Online Pharmacy</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold text-lg mb-6">Contact Info</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-5 h-5 text-primary-blue flex-shrink-0 mt-0.5" />
                                    <span>123 Medical Center Blvd,<br />Healthville, NY 10001, USA</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <Phone className="w-5 h-5 text-primary-blue flex-shrink-0" />
                                    <span>+1 (800) 123-4567</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 flex items-center justify-center bg-primary-blue rounded-sm flex-shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <span>contact@medicareplus.com</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 pt-4">
                        <p>&copy; {new Date().getFullYear()} MediCare Plus. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default Home;
