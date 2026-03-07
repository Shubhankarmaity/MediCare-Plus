import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Grid, List as ListIcon, Star, Calendar, Award, GraduationCap, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const Doctors = () => {
    const navigate = useNavigate();

    // State Management
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                // Fetch public doctors list from our existing endpoint
                const res = await fetch(`${API_URL}/api/doctors/public-preview`);
                if (!res.ok) throw new Error('Failed to fetch doctors data');
                const data = await res.json();
                setDoctors(data);
            } catch (err) {
                console.error('Error fetching doctors:', err);
                setError('Could not load our medical directory at this time. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    // Filter Logic
    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialization === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
    });

    // Extract unique specialties for the dropdown
    const uniqueSpecialties = ['All', ...new Set(doctors.map(d => d.specialization).filter(Boolean))];

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Page Header */}
            <div className="bg-[#0c2340] text-white py-16 border-b-4 border-blue-600">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Medical Directory</h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed">
                        Search our clinical network of board-certified physicians, surgeons, and healthcare specialists.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-12">

                {/* Search & Filter Controls */}
                <div className="bg-white rounded-sm border border-slate-300 p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search doctors by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium text-slate-800"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="p-2 bg-slate-100 text-slate-500 rounded-sm border border-slate-300 hidden sm:block">
                            <Filter className="w-5 h-5" />
                        </div>
                        <select
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                            className="w-full md:w-64 px-4 py-3 bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 cursor-pointer text-slate-800 font-bold"
                        >
                            {uniqueSpecialties.map((specialty, idx) => (
                                <option key={idx} value={specialty}>{specialty}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-600 font-bold uppercase tracking-widest text-sm">Accessing Directory...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-300 text-red-800 p-6 rounded-sm text-center">
                        <p className="font-bold">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-white text-red-700 border border-red-300 rounded-sm font-bold hover:bg-red-100 transition-colors uppercase text-sm tracking-wider"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="bg-white border border-slate-300 rounded-sm p-16 text-center shadow-none">
                        <div className="w-16 h-16 bg-slate-100 flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No matching specialists found</h3>
                        <p className="text-slate-600 max-w-md mx-auto">
                            The requested physician or specialty could not be located in the current directory filters.
                        </p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedSpecialty('All'); }}
                            className="mt-6 text-blue-700 font-bold hover:underline uppercase text-sm"
                        >
                            Reset Directory Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map(doctor => (
                            <div
                                key={doctor._id}
                                className="bg-white rounded-sm border border-slate-300 flex flex-col h-full relative"
                            >
                                {/* Colored Header Strip */}
                                <div className="h-1 bg-slate-300 w-full absolute top-0 left-0"></div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-start gap-5 mb-5">
                                        {/* Avatar / Photo */}
                                        <div className="w-16 h-16 bg-slate-100 border border-slate-300 flex-shrink-0 flex items-center justify-center rounded-sm">
                                            {doctor.profileImage ? (
                                                <img
                                                    src={doctor.profileImage}
                                                    alt={doctor.name}
                                                    className="w-full h-full object-cover rounded-sm"
                                                />
                                            ) : (
                                                <span className="text-xl font-bold text-slate-500">
                                                    {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        {/* Name & Specialization */}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                                {doctor.name}
                                            </h3>
                                            <div className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2 rounded-sm">
                                                {doctor.specialization || 'General'}
                                            </div>

                                            {doctor.qualification && (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                                    <GraduationCap className="w-3.5 h-3.5" />
                                                    <span className="line-clamp-1" title={doctor.qualification}>{doctor.qualification}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats / Details */}
                                    <div className="space-y-3 mb-6 flex-grow">
                                        {doctor.experience && (
                                            <div className="flex items-center gap-3 text-sm text-slate-700">
                                                <div className="w-7 h-7 bg-slate-100 flex items-center justify-center flex-shrink-0 rounded-sm">
                                                    <Award className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="font-bold">{doctor.experience} Years Clinical Exp.</span>
                                            </div>
                                        )}

                                        {doctor.hospitalName && (
                                            <div className="flex items-center gap-3 text-sm text-slate-700">
                                                <div className="w-7 h-7 bg-slate-100 flex items-center justify-center flex-shrink-0 rounded-sm">
                                                    <MapPin className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="font-bold line-clamp-1">{doctor.hospitalName}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer / CTA */}
                                    <div className="pt-4 border-t border-slate-200 mt-auto">
                                        <button
                                            onClick={() => navigate('/login')} // Update to booking flow later
                                            className="w-full py-2.5 bg-slate-50 hover:bg-blue-700 text-slate-900 hover:text-white border border-slate-300 hover:border-blue-700 font-bold transition-colors flex items-center justify-center gap-2 rounded-sm uppercase tracking-wide text-sm"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Book Appointment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Doctors;
