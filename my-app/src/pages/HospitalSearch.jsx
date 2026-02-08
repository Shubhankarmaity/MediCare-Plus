import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, TextField, Button, InputAdornment, Chip } from '@mui/material';
import { Search, MapPin, Phone, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

import cityGeneralImg from '../assets/images/city hospital.avif';
import metropolitanImg from '../assets/images/hospital2.avif';
import greenValleyImg from '../assets/images/hospital3.avif';

const HospitalSearch = () => {
    const [hospitals, setHospitals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/hospitals`);
            const data = await response.json();

            // Map API data to local images for consistency
            const mappedData = data.map(hospital => {
                // Normalize name for matching
                const name = hospital.name.toLowerCase();

                if (name.includes('city general')) {
                    return { ...hospital, image: cityGeneralImg };
                } else if (name.includes('metropolitan')) {
                    return { ...hospital, image: metropolitanImg };
                } else if (name.includes('green valley')) {
                    return { ...hospital, image: greenValleyImg };
                } else if (name.includes('sunrise')) {
                    return { ...hospital, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" };
                }
                return hospital;
            });

            setHospitals(mappedData);
        } catch (error) {
            console.error('Error fetching hospitals:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHospitals = hospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-blue-600 text-white py-12 mb-8">
                <Container maxWidth="lg">
                    <Typography variant="h3" className="font-bold mb-4">Find a Network Hospital</Typography>
                    <Typography variant="h6" className="opacity-90 mb-8">
                        Access world-class healthcare facilities near you.
                    </Typography>

                    <div className="max-w-2xl bg-white rounded-lg p-2 flex shadow-lg">
                        <TextField
                            fullWidth
                            placeholder="Search by hospital name or city..."
                            variant="standard"
                            InputProps={{
                                disableUnderline: true,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search className="text-gray-400 ml-2" />
                                    </InputAdornment>
                                ),
                                className: "px-4 py-2"
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            className="bg-blue-600 hover:bg-blue-700 normal-case px-8 rounded-md"
                            onClick={() => { }} // Real-time filtering used instead
                        >
                            Search
                        </Button>
                    </div>
                </Container>
            </div>

            <Container maxWidth="lg">
                {loading ? (
                    <Typography>Loading hospitals...</Typography>
                ) : (
                    <Grid container spacing={4}>
                        {filteredHospitals.map((hospital) => (
                            <Grid item xs={12} md={6} lg={4} key={hospital._id}>
                                <Card className="h-full hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden cursor-pointer" component={Link} to={`/hospitals/${hospital._id}`} style={{ textDecoration: 'none' }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={hospital.image}
                                        alt={hospital.name}
                                        className="h-48 object-cover"
                                    />
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <Typography variant="h6" className="font-bold text-gray-800 leading-tight mb-1">
                                                {hospital.name}
                                            </Typography>
                                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-sm font-bold">
                                                <Star size={14} className="mr-1 fill-current" />
                                                {hospital.rating}
                                            </div>
                                        </div>

                                        <div className="flex items-center text-gray-600 mb-4 text-sm">
                                            <MapPin size={16} className="mr-1 flex-shrink-0" />
                                            {hospital.city}, {hospital.address}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {hospital.facilities.slice(0, 3).map((facility, idx) => (
                                                <Chip key={idx} label={facility} size="small" className="bg-blue-50 text-blue-700 text-xs" />
                                            ))}
                                            {hospital.facilities.length > 3 && (
                                                <Chip label={`+${hospital.facilities.length - 3} more`} size="small" className="bg-gray-100 text-gray-600 text-xs" />
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-100">
                                            <span className={`font-medium ${hospital.availableBeds > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {hospital.availableBeds > 0 ? `${hospital.availableBeds} Beds Available` : 'No Beds Available'}
                                            </span>
                                            <span className="text-blue-600 font-medium">View Details →</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {filteredHospitals.length === 0 && (
                            <div className="w-full text-center py-12">
                                <Typography className="text-gray-500">No hospitals found matching your search.</Typography>
                            </div>
                        )}
                    </Grid>
                )}
            </Container>
        </div>
    );
};

export default HospitalSearch;
