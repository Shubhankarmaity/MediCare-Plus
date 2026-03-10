import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, TextField, Button, InputAdornment, Chip } from '@mui/material';
import { Search, MapPin, Phone, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { resolveHospitalImage } from '../utils/hospitalImages';

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

            // Map API data to local images
            const mappedData = data.map((hospital, idx) => {
                return { ...hospital, image: resolveHospitalImage(hospital, idx) };
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
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-[#0c2340] text-white py-12 md:py-16 mb-8 border-b-4 border-blue-600">
                <Container maxWidth="lg">
                    <Typography variant="h4" className="font-bold mb-3 text-3xl md:text-4xl tracking-tight">Hospital Directory</Typography>
                    <Typography variant="body1" className="text-slate-300 mb-8 md:mb-10 text-lg md:text-xl max-w-2xl">
                        Search our integrated network of clinical facilities and specialized healthcare centers.
                    </Typography>

                    <div className="max-w-2xl bg-white rounded-sm p-1.5 flex shadow-md border border-slate-300">
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
                            className="bg-blue-700 hover:bg-blue-800 normal-case px-6 md:px-8 rounded-sm font-bold tracking-wide whitespace-nowrap shadow-none"
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
                                <Card className="h-full hover:bg-slate-50 transition-colors duration-300 rounded-sm overflow-hidden border border-slate-300 shadow-none flex flex-col" component={Link} to={`/hospitals/${hospital._id}`} style={{ textDecoration: 'none' }}>
                                    <div className="h-1 bg-slate-300 w-full relative"></div>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={hospital.image}
                                        alt={hospital.name}
                                        className="h-48 object-cover border-b border-slate-200"
                                    />
                                    <CardContent className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-3">
                                            <Typography variant="h6" className="font-bold text-slate-900 leading-tight mb-1">
                                                {hospital.name}
                                            </Typography>
                                            <div className="flex items-center bg-slate-100 px-2 py-1 rounded-sm text-slate-700 text-xs font-bold border border-slate-300">
                                                <Star size={12} className="mr-1 fill-current" />
                                                {hospital.rating}
                                            </div>
                                        </div>

                                        <div className="flex items-center text-slate-600 mb-5 text-sm font-medium">
                                            <MapPin size={16} className="mr-1.5 flex-shrink-0 text-slate-400" />
                                            {hospital.city}, {hospital.address}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6 flex-grow">
                                            {hospital.facilities.slice(0, 3).map((facility, idx) => (
                                                <Chip key={idx} label={facility} size="small" className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-sm tracking-wide" />
                                            ))}
                                            {hospital.facilities.length > 3 && (
                                                <Chip label={`+${hospital.facilities.length - 3} MORE`} size="small" className="bg-slate-200 text-slate-800 text-xs font-bold rounded-sm tracking-widest" />
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-200 mt-auto">
                                            <span className={`font-bold uppercase tracking-wider text-xs ${hospital.availableBeds > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                {hospital.availableBeds > 0 ? `${hospital.availableBeds} Clinical Beds` : 'Capacity Reached'}
                                            </span>
                                            <span className="text-blue-700 font-bold uppercase text-xs tracking-wider flex items-center">
                                                Facility Details <span className="ml-1">→</span>
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {filteredHospitals.length === 0 && (
                            <div className="w-full text-center py-16 bg-white border border-slate-300 rounded-sm mt-4">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <Typography className="text-slate-600 font-bold">No clinical facilities located matching current parameters.</Typography>
                            </div>
                        )}
                    </Grid>
                )}
            </Container>
        </div>
    );
};

export default HospitalSearch;
