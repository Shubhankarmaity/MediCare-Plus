import React from 'react';
import { Container, Button, Card, CardContent, Chip } from '@mui/material';
import { Microscope, FlaskConical, Dna, Activity, Clock, ShieldCheck, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LabTests = () => {
    const packages = [
        {
            title: "Basic Health Checkup",
            price: "$59",
            tests: ["Complete Blood Count", "Blood Sugar Fasting", "Liver Function Test", "Kidney Function Test"],
            icon: <Activity size={32} className="text-teal-600" />,
            popular: false
        },
        {
            title: "Comprehensive Body Profile",
            price: "$149",
            tests: ["All Basic Tests", "Thyroid Profile", "Vitamin D & B12", "Lipid Profile (Cholesterol)", "Urine Analysis"],
            icon: <ShieldCheck size={32} className="text-teal-600" />,
            popular: true
        },
        {
            title: "Diabetes Care Package",
            price: "$89",
            tests: ["HbA1c", "Average Blood Glucose", "Insulin Fasting", "Kidney Screen"],
            icon: <FlaskConical size={32} className="text-teal-600" />,
            popular: false
        }
    ];

    const commonTests = [
        { name: "RT-PCR Covid-19", time: "24 Hours" },
        { name: "Thyroid Profile (T3, T4, TSH)", time: "12 Hours" },
        { name: "Hemoglobin (Hb)", time: "6 Hours" },
        { name: "Lipid Profile", time: "12 Hours" },
        { name: "Liver Function Test", time: "12 Hours" },
        { name: "Vitamin D Total", time: "24 Hours" }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Hero Section */}
            <div className="relative bg-teal-700 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <motion.div
                            className="md:w-1/2"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-teal-600/50 px-4 py-2 rounded-full mb-6 border border-teal-500/30">
                                <Microscope size={20} className="text-teal-200" />
                                <span className="font-semibold text-teal-50">NABL Accredited Labs</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">Accurate Diagnostics, Delivered.</h1>
                            <p className="text-xl text-teal-100 mb-8 leading-relaxed">
                                State-of-the-art pathology services with home sample collection options. Get accurate reports delivered directly to your phone.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    variant="contained"
                                    size="large"
                                    component={Link}
                                    to="/login"
                                    className="bg-white text-teal-800 hover:bg-teal-50 font-bold px-8 py-3 rounded-xl normal-case"
                                >
                                    Book a Test
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    className="border-white text-white hover:bg-white/10 font-bold px-8 py-3 rounded-xl normal-case"
                                >
                                    View Reports
                                </Button>
                            </div>
                        </motion.div>
                        <motion.div
                            className="md:w-1/2 relative"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800"
                                alt="Modern Laboratory"
                                className="rounded-3xl shadow-2xl border-4 border-white/20"
                            />
                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full">
                                        <Clock className="text-green-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">Fast Reports</p>
                                        <p className="text-xs text-slate-500">Within 24 Hours</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <Container maxWidth="lg" className="mt-16">
                {/* Popular Packages */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Preventive Health Packages</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">Regular screenings can help detect health issues early. Choose from our curated wellness packages.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {packages.map((pkg, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className={`bg-white rounded-2xl overflow-hidden border ${pkg.popular ? 'border-teal-500 shadow-xl scale-105' : 'border-slate-100 shadow-sm'} relative`}
                        >
                            {pkg.popular && (
                                <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                    MOST POPULAR
                                </div>
                            )}
                            <div className="p-8">
                                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                                    {pkg.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.title}</h3>
                                <div className="flex items-end gap-1 mb-6">
                                    <span className="text-3xl font-bold text-teal-600">{pkg.price}</span>
                                    <span className="text-slate-400 text-sm mb-1">/ person</span>
                                </div>
                                <div className="space-y-3 mb-8">
                                    {pkg.tests.map((test, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle size={16} className="text-teal-500 mt-0.5 shrink-0" />
                                            <span>{test}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant={pkg.popular ? "contained" : "outlined"}
                                    fullWidth
                                    component={Link}
                                    to="/login"
                                    className={`py-3 font-bold rounded-xl normal-case ${pkg.popular ? 'bg-teal-600 hover:bg-teal-700' : 'border-slate-300 text-slate-700'}`}
                                >
                                    Choose Package
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Common Single Tests */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                        <Dna className="text-teal-600" /> Common Diagnostic Tests
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {commonTests.map((test, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-teal-50 hover:border-teal-100 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <FlaskConical size={20} className="text-slate-400 group-hover:text-teal-600" />
                                    <span className="font-medium text-slate-700 group-hover:text-teal-900">{test.name}</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                                    {test.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default LabTests;
