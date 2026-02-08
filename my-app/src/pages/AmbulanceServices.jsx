import React from 'react';
import { Container, Button, Card, CardContent } from '@mui/material';
import { Phone, MapPin, Clock, Shield, Activity, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AmbulanceServices = () => {
    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Hero Section */}
            <div className="relative bg-red-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="container mx-auto px-4 py-20 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Truck size={64} className="mx-auto mb-6 text-white/90" />
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">24/7 Emergency Ambulance</h1>
                        <p className="text-xl md:text-2xl text-red-100 max-w-2xl mx-auto mb-10">
                            Rapid response critical care transport equipped with advanced life support systems.
                        </p>
                        <a
                            href="tel:112"
                            className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-red-50 transition-transform hover:scale-105 shadow-lg"
                        >
                            <Phone className="animate-pulse" /> Call Emergency: 112
                        </a>
                    </motion.div>
                </div>
            </div>

            <Container maxWidth="lg" className="mt-12">
                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {[
                        {
                            icon: <Clock size={32} className="text-red-600" />,
                            title: "Average Response 15 Min",
                            desc: "Our GPS-enabled fleet ensures the quickest route to your location."
                        },
                        {
                            icon: <Activity size={32} className="text-red-600" />,
                            title: "ICU on Wheels",
                            desc: "Fully equipped with ventilators, defibrillators, and monitoring systems."
                        },
                        {
                            icon: <Shield size={32} className="text-red-600" />,
                            title: "Paramedic Staff",
                            desc: "Accompanied by certified emergency technicians and critical care nurses."
                        }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                        >
                            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Service Types */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Types of Transport Services</h2>
                        <div className="space-y-6">
                            {[
                                { title: "Basic Life Support (BLS)", desc: "For non-life-threatening conditions requiring medical monitoring." },
                                { title: "Advanced Life Support (ALS)", desc: "For critical patients requiring cardiac monitoring and IV medication." },
                                { title: "Neonatal Transport", desc: "Specialized incubators and care for premature or ill newborns." },
                                { title: "Patient Transfer", desc: "Scheduled transport between home and hospital for checkups." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 bg-red-100 p-1 rounded-full h-fit">
                                        <Truck size={16} className="text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                                        <p className="text-slate-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                        <img
                            src="https://images.unsplash.com/photo-1588611910696-6246faa88a08?auto=format&fit=crop&q=80&w=800"
                            alt="Ambulance Interior"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* CTA */}
                <Card className="bg-slate-900 text-white rounded-3xl overflow-hidden">
                    <CardContent className="p-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Basic Transport?</h2>
                        <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                            For non-emergency appointments or hospital discharges, you can schedule a ride in advance through your dashboard.
                        </p>
                        <Button
                            variant="contained"
                            size="large"
                            component={Link}
                            to="/login"
                            className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 py-3 rounded-xl normal-case"
                        >
                            Login to Book Ride
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        </div>
    );
};

export default AmbulanceServices;
