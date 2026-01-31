import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Grid, Card, CardContent, Button, Typography, Chip, Divider } from '@mui/material';
import { MapPin, Phone, Mail, CheckCircle, AlertCircle, Bed, Activity, Clock } from 'lucide-react';
import { API_URL } from '../config';

const HospitalDetails = () => {
    const { id } = useParams();
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHospital = async () => {
            try {
                const response = await fetch(`${API_URL}/api/hospitals/${id}`);
                const data = await response.json();
                setHospital(data);
            } catch (error) {
                console.error('Error fetching hospital details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHospital();
    }, [id]);

    if (loading) return <div className="p-12 text-center">Loading details...</div>;
    if (!hospital) return <div className="p-12 text-center">Hospital not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Banner */}
            <div className="relative h-64 md:h-80 w-full bg-blue-900">
                <img
                    src={hospital.image}
                    alt={hospital.name}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex items-end">
                    <Container maxWidth="lg" className="pb-8">
                        <Typography variant="h2" className="text-white font-bold mb-2 text-3xl md:text-5xl">{hospital.name}</Typography>
                        <div className="flex items-center text-white/90">
                            <MapPin size={18} className="mr-2" />
                            <Typography>{hospital.address}, {hospital.city}</Typography>
                        </div>
                    </Container>
                </div>
            </div>

            <Container maxWidth="lg" className="mt-8">
                <Grid container spacing={4}>
                    {/* Left Column: Main Info */}
                    <Grid item xs={12} md={8}>
                        <Card className="mb-6 rounded-xl shadow-sm border border-gray-100">
                            <CardContent className="p-6">
                                <Typography variant="h5" className="font-bold mb-4">About the Hospital</Typography>
                                <Typography className="text-gray-600 mb-6 leading-relaxed">
                                    {hospital.description}
                                </Typography>

                                <Typography variant="h6" className="font-bold mb-3">Facilities & Services</Typography>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {hospital.facilities.map((fac, idx) => (
                                        <Chip key={idx} icon={<CheckCircle size={14} />} label={fac} className="bg-blue-50 text-blue-800" />
                                    ))}
                                </div>

                                <Divider className="my-6" />

                                <Typography variant="h6" className="font-bold mb-3">Resource Availability</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={6} sm={4}>
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                                            <Bed className="text-green-600 mx-auto mb-2" size={24} />
                                            <div className="text-2xl font-bold text-green-700">{hospital.availableBeds}</div>
                                            <div className="text-xs text-green-800 uppercase font-semibold">Beds Available</div>
                                            <div className="text-xs text-gray-500 mt-1">out of {hospital.totalBeds} total</div>
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <div className={`p-4 rounded-lg border text-center ${hospital.icuAvailable ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
                                            <Activity className={`${hospital.icuAvailable ? 'text-indigo-600' : 'text-red-500'} mx-auto mb-2`} size={24} />
                                            <div className={`text-lg font-bold ${hospital.icuAvailable ? 'text-indigo-700' : 'text-red-700'}`}>
                                                {hospital.icuAvailable ? 'Available' : 'Full'}
                                            </div>
                                            <div className="text-xs text-gray-600 uppercase font-semibold">ICU Status</div>
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <div className={`p-4 rounded-lg border text-center ${hospital.emergencyServices ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                                            <AlertCircle className={`${hospital.emergencyServices ? 'text-red-600' : 'text-gray-500'} mx-auto mb-2`} size={24} />
                                            <div className={`text-lg font-bold ${hospital.emergencyServices ? 'text-red-700' : 'text-gray-700'}`}>
                                                {hospital.emergencyServices ? '24/7' : 'Limited'}
                                            </div>
                                            <div className="text-xs text-gray-600 uppercase font-semibold">Emergency Services</div>
                                        </div>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column: Contact & Actions */}
                    <Grid item xs={12} md={4}>
                        <Card className="rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <CardContent className="p-6">
                                <Typography variant="h6" className="font-bold mb-4">Contact Information</Typography>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center text-gray-600">
                                        <Phone size={18} className="mr-3 text-blue-600" />
                                        <span>{hospital.phone}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Mail size={18} className="mr-3 text-blue-600" />
                                        <span>{hospital.email}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Clock size={18} className="mr-3 text-blue-600" />
                                        <span>Open 24 Hours</span>
                                    </div>
                                </div>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mb-3"
                                    component={Link}
                                    to="/login" // Redirect to login for booking, assuming user must be logged in
                                >
                                    Book Appointment
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                >
                                    Request Ambulance
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default HospitalDetails;
