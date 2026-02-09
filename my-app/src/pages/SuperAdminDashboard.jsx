import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
    Grid, Paper, Typography, Table, TableBody, TableCell,
    TableHead, TableRow, Chip, Avatar, CircularProgress, IconButton, Button, Box, Tabs, Tab,
    Card, CardContent, CardActionArea, Rating
} from '@mui/material';
import {
    RefreshCw, Trash2, ArrowLeft, Building2, Stethoscope, Users, User, MapPin,
    Phone, Mail, Bed, Activity, Siren, Star
} from 'lucide-react';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

// Import local images
import cityHospitalImg from '../assets/images/city hospital.avif';
import hospital2Img from '../assets/images/hospital2.avif';
import hospital3Img from '../assets/images/hospital3.avif';
import hospital4Img from '../assets/images/hospital4.avif';

const hospitalImages = [cityHospitalImg, hospital2Img, hospital3Img, hospital4Img];

// Helper to determine which image to show
const resolveHospitalImage = (hospital, index) => {
    if (!hospital) return hospitalImages[0];

    const name = hospital.name.toLowerCase();

    // Priority 1: Match known names to local assets (Consistency with Home.jsx)
    if (name.includes('city general')) return cityHospitalImg;
    if (name.includes('metropolitan')) return hospital4Img;
    if (name.includes('sunrise')) return hospital2Img;
    if (name.includes('green valley') || name.includes('st. mary')) return hospital3Img;

    // Priority 2: Use DB image if valid URL (and not a placeholder/broken one if we could detect that, but we assume valid for now)
    if (hospital.image && hospital.image.length > 10) return hospital.image;

    // Priority 3: Fallback to round-robin
    return hospitalImages[index % hospitalImages.length];
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Navigation State
    const [view, setView] = useState('hospitals'); // 'hospitals' | 'hospital_detail'
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [hospitalData, setHospitalData] = useState(null); // { doctors: [], patients: [], admin: {} }
    const [hospitalTabValue, setHospitalTabValue] = useState(0); // 0: Doctors, 1: Patients

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const statsRes = await fetch(`${API_URL}/api/super-admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (statsRes.ok) setStats(await statsRes.json());

            const hospitalsRes = await fetch(`${API_URL}/api/super-admin/hospitals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (hospitalsRes.ok) setHospitals(await hospitalsRes.json());

        } catch (err) {
            console.error("Error fetching super admin data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchHospitalDetails = async (hospitalId) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/super-admin/hospital/${hospitalId}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedHospital(data.hospital);
                setHospitalData(data);
                setView('hospital_detail');
            }
        } catch (err) {
            console.error("Error fetching hospital details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to DELETE this user? This action cannot be undone.")) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/super-admin/user/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("User deleted successfully");
                if (view === 'hospital_detail') {
                    fetchHospitalDetails(selectedHospital._id); // Refresh detail view
                } else {
                    fetchData();
                }
            } else {
                alert("Failed to delete user");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteHospital = async (id) => {
        if (!window.confirm("Are you sure you want to DELETE this hospital? This will unlink all associated data.")) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/super-admin/hospital/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Hospital deleted successfully");
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };



    console.log("Rendering SuperAdminDashboard. View:", view);

    if (loading && !stats && !selectedHospital && view === 'hospitals') return (
        <div className="flex justify-center items-center h-screen">
            <CircularProgress size={60} thickness={4} />
        </div>
    );

    return (
        <DashboardLayout title="Super Admin Portal" userRole="super-admin">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    {view === 'hospital_detail' && (
                        <IconButton onClick={() => { setView('hospitals'); setSelectedHospital(null); }}>
                            <ArrowLeft />
                        </IconButton>
                    )}
                    <Typography variant="h4" fontWeight="bold" className="text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        {view === 'hospital_detail' ? selectedHospital?.name : 'Global Overview'}
                    </Typography>
                </div>

                <IconButton
                    onClick={view === 'hospital_detail' ? () => fetchHospitalDetails(selectedHospital._id) : fetchData}
                    color="primary"
                    sx={{ bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: '#f3f4f6', transform: 'rotate(180deg)', transition: '0.5s' } }}
                >
                    <RefreshCw />
                </IconButton>
            </div>

            <AnimatePresence mode="wait">

                {/* VIEW: HOSPITALS LIST & STATS */}
                {view === 'hospitals' && (
                    <motion.div
                        key="hospitals-view"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    >
                        {/* Global Statistics Cards */}
                        {stats ? (
                            <Grid container spacing={3} mb={5}>
                                {[
                                    { label: 'Total Hospitals', count: stats.totalHospitals, icon: Building2, from: 'from-blue-500', to: 'to-blue-700' },
                                    { label: 'Total Doctors', count: stats.totalDoctors, icon: Stethoscope, from: 'from-emerald-500', to: 'to-emerald-700' },
                                    { label: 'Total Patients', count: stats.totalPatients, icon: User, from: 'from-rose-500', to: 'to-rose-700' },
                                    { label: 'Total Drivers', count: stats.totalDrivers, icon: Users, from: 'from-amber-500', to: 'to-amber-700' }
                                ].map((stat, index) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Paper
                                                elevation={6}
                                                className={`bg-gradient-to-br ${stat.from} ${stat.to} text-white p-6 rounded-2xl relative overflow-hidden`}
                                            >
                                                <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={10}>
                                                    <div>
                                                        <Typography variant="subtitle2" sx={{ opacity: 0.9, fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</Typography>
                                                        <Typography variant="h3" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{stat.count}</Typography>
                                                    </div>
                                                    <stat.icon size={48} className="opacity-80 drop-shadow-lg" />
                                                </Box>

                                                {/* Decorative bubbles */}
                                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
                                                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-5 rounded-full blur-xl" />
                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography color="error" mb={4}>Failed to load statistics.</Typography>
                        )}

                        {/* Hospitals Grid */}
                        <Typography variant="h5" mb={3} fontWeight="bold" className="text-gray-700 border-l-4 border-indigo-500 pl-3">
                            All Registered Hospitals
                        </Typography>

                        {hospitals.length > 0 ? (
                            <Grid container spacing={3}>
                                {hospitals.map((hospital, index) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={hospital._id}>
                                        <motion.div variants={itemVariants} layoutId={`hospital-${hospital._id}`} whileHover={{ y: -8 }}>
                                            <Card sx={{
                                                borderRadius: 4,
                                                boxShadow: 4,
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                overflow: 'visible',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': { boxShadow: 12 }
                                            }}>
                                                <CardActionArea onClick={() => fetchHospitalDetails(hospital._id)} sx={{ flexGrow: 1, borderRadius: 4, overflow: 'hidden' }}>
                                                    <div className="relative h-56 overflow-hidden">
                                                        <img
                                                            src={resolveHospitalImage(hospital, index)}
                                                            alt={hospital.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                                                            <Typography variant="h6" fontWeight="bold" className="text-white drop-shadow-md" noWrap>{hospital.name}</Typography>
                                                        </div>
                                                        <div className="absolute top-3 right-3">
                                                            <Chip
                                                                label={hospital.city}
                                                                color="primary"
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                                    color: '#1e40af',
                                                                    fontWeight: 'bold',
                                                                    backdropFilter: 'blur(4px)'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <CardContent>
                                                        <Box display="flex" alignItems="center" gap={1} color="text.secondary" mb={2}>
                                                            <MapPin size={16} className="text-red-500" />
                                                            <Typography variant="body2" noWrap>{hospital.address}</Typography>
                                                        </Box>
                                                        <Box display="flex" gap={1} flexWrap="wrap">
                                                            <Chip icon={<Star size={14} />} label={hospital.rating || 4.5} size="small" variant="outlined" sx={{ borderColor: '#f59e0b', color: '#b45309' }} />
                                                            <Chip
                                                                icon={<Bed size={14} />}
                                                                label={`${hospital.availableBeds}/${hospital.totalBeds} Beds`}
                                                                size="small"
                                                                variant="soft"
                                                                color={hospital.availableBeds > 0 ? "success" : "error"}
                                                                sx={{ bgcolor: hospital.availableBeds > 0 ? '#dcfce7' : '#fee2e2' }}
                                                            />
                                                        </Box>
                                                    </CardContent>
                                                </CardActionArea>
                                                <div className="p-2 flex justify-end border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteHospital(hospital._id); }}>
                                                        <Trash2 size={18} />
                                                    </IconButton>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box textAlign="center" py={10}>
                                <Typography variant="h6" color="text.secondary">No hospitals found.</Typography>
                                <Button variant="contained" onClick={fetchData} sx={{ mt: 2 }}>Retry</Button>
                            </Box>
                        )}
                    </motion.div>
                )}

                {/* VIEW: HOSPITAL DETAILS */}
                {view === 'hospital_detail' && selectedHospital && hospitalData && (
                    <motion.div
                        key="detail-view"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                    >
                        {/* Hospital Banner & Info */}
                        <Paper sx={{ borderRadius: 4, overflow: 'hidden', mb: 4, boxShadow: 6 }}>
                            <div className="h-64 relative bg-gray-900">
                                <img
                                    src={resolveHospitalImage(selectedHospital, hospitals.findIndex(h => h._id === selectedHospital._id))}
                                    alt={selectedHospital.name}
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                        <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
                                            {selectedHospital.name}
                                        </h1>
                                        <div className="flex flex-wrap gap-4 text-sm opacity-90 font-medium">
                                            <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm"><MapPin size={16} className="text-red-400" /> {selectedHospital.address}, {selectedHospital.city}</span>
                                            <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm"><Phone size={16} className="text-green-400" /> {selectedHospital.phone}</span>
                                            {selectedHospital.email && <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm"><Mail size={16} className="text-blue-400" /> {selectedHospital.email}</span>}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            <Box p={4}>
                                <Grid container spacing={4}>
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom className="text-indigo-900 border-b-2 border-indigo-100 pb-1 inline-block">About Hospital</Typography>
                                        <Typography paragraph color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                            {selectedHospital.description || "No description provided for this hospital."}
                                        </Typography>

                                        <Typography variant="h6" fontWeight="bold" gutterBottom mt={3} mb={2} className="text-indigo-900">Facilities & Status</Typography>
                                        <div className="flex flex-wrap gap-3">
                                            <Chip icon={<Activity size={18} />} label={selectedHospital.icuAvailable ? "ICU Available" : "No ICU"} color={selectedHospital.icuAvailable ? "success" : "default"} variant="filled" />
                                            <Chip icon={<Siren size={18} />} label={selectedHospital.emergencyServices ? "Emergency 24/7" : "No Emergency"} color={selectedHospital.emergencyServices ? "error" : "default"} variant="filled" />
                                            <Chip icon={<Bed size={18} />} label={`${selectedHospital.availableBeds} / ${selectedHospital.totalBeds} Beds Available`} color="primary" variant="outlined" />
                                            <Chip icon={<Star size={18} />} label={`${selectedHospital.rating} Rating`} color="warning" variant="outlined" />
                                        </div>

                                        <Box mt={4} p={3} bgcolor="#f8fafc" borderRadius={3} border={1} borderColor="#e2e8f0">
                                            <Typography variant="subtitle2" color="text.secondary" mb={1}>Managed By Administrator:</Typography>
                                            <div className="flex items-center gap-3">
                                                <Avatar sx={{ bgcolor: '#4f46e5', width: 48, height: 48 }}>{hospitalData.admin?.name?.[0] || 'A'}</Avatar>
                                                <div>
                                                    <Typography fontWeight="bold" variant="subtitle1">{hospitalData.admin?.name || 'Unassigned'}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{hospitalData.admin?.email}</Typography>
                                                </div>
                                            </div>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Paper elevation={0} sx={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', p: 3, borderRadius: 3, border: '1px solid #bae6fd' }}>
                                            <Typography variant="h6" fontWeight="bold" mb={2} className="text-sky-900">Quick Insight</Typography>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-sky-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Stethoscope size={24} /></div>
                                                        <div>
                                                            <span className="font-medium text-gray-900 block">Total Doctors</span>
                                                            <span className="text-xs text-gray-500">Registered</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-2xl font-bold text-blue-700">{hospitalData.doctors?.length || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><User size={24} /></div>
                                                        <div>
                                                            <span className="font-medium text-gray-900 block">Active Patients</span>
                                                            <span className="text-xs text-gray-500">Currently admitted</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-2xl font-bold text-orange-700">{hospitalData.patients?.length || 0}</span>
                                                </div>
                                            </div>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>

                        {/* TABS SECTION */}
                        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f1f5f9' }}>
                                <Tabs
                                    value={hospitalTabValue}
                                    onChange={(e, v) => setHospitalTabValue(v)}
                                    textColor="primary"
                                    indicatorColor="primary"
                                    sx={{ px: 2 }}
                                >
                                    <Tab label={`Doctors (${hospitalData.doctors?.length || 0})`} icon={<Stethoscope size={18} />} iconPosition="start" />
                                    <Tab label={`Patients (${hospitalData.patients?.length || 0})`} icon={<User size={18} />} iconPosition="start" />
                                </Tabs>
                            </Box>

                            <Box p={0}>
                                {/* DOCTORS TAB */}
                                {hospitalTabValue === 0 && (
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {hospitalData.doctors && hospitalData.doctors.length > 0 ? (
                                                hospitalData.doctors.map((doc) => (
                                                    <TableRow key={doc._id} hover>
                                                        <TableCell>
                                                            <Box display="flex" alignItems="center" gap={2}>
                                                                <Avatar src={doc.image || ''} sx={{ bgcolor: '#0ea5e9', width: 40, height: 40 }}>{doc.name[0]}</Avatar>
                                                                <div>
                                                                    <Typography fontWeight="600" variant="body1">{doc.name}</Typography>
                                                                    <Typography variant="caption" className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{doc.specialization || 'General'}</Typography>
                                                                </div>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" className="flex items-center gap-1"><Mail size={14} className="text-gray-400" /> {doc.email}</Typography>
                                                            <Typography variant="caption" color="text.secondary" className="flex items-center gap-1"><Phone size={14} className="text-gray-400" /> {doc.doctorPhone || 'N/A'}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={doc.isApproved ? "Active" : "Pending"}
                                                                color={doc.isApproved ? "success" : "warning"}
                                                                size="small"
                                                                variant={doc.isApproved ? "filled" : "outlined"}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                size="small"
                                                                color="error"
                                                                startIcon={<Trash2 size={16} />}
                                                                onClick={() => handleDeleteUser(doc._id)}
                                                                sx={{ borderRadius: 2 }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        <Box py={8} display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                                                            <div className="bg-gray-100 p-4 rounded-full mb-2">
                                                                <Stethoscope size={32} className="text-gray-400" />
                                                            </div>
                                                            <Typography variant="subtitle1" fontWeight="medium">No doctors found</Typography>
                                                            <Typography variant="body2">This hospital hasn't registered any doctors yet.</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}

                                {/* PATIENTS TAB */}
                                {hospitalTabValue === 1 && (
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Demographics</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {hospitalData.patients && hospitalData.patients.length > 0 ? (
                                                hospitalData.patients.map((pat) => (
                                                    <TableRow key={pat._id} hover>
                                                        <TableCell>
                                                            <Box display="flex" alignItems="center" gap={2}>
                                                                <Avatar sx={{ bgcolor: '#f97316', width: 40, height: 40 }}>{pat.name[0]}</Avatar>
                                                                <Typography fontWeight="600" variant="body1">{pat.name}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" className="flex items-center gap-1"><Mail size={14} className="text-gray-400" /> {pat.email}</Typography>
                                                            <Typography variant="caption" color="text.secondary" className="flex items-center gap-1"><Phone size={14} className="text-gray-400" /> {pat.phone || 'N/A'}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box display="flex" gap={1}>
                                                                <Chip label={`${pat.age} yrs`} size="small" variant="outlined" />
                                                                <Chip label={pat.gender} size="small" variant="outlined" color="info" />
                                                                {pat.bloodGroup && <Chip label={pat.bloodGroup} size="small" variant="filled" color="error" />}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                size="small"
                                                                color="error"
                                                                startIcon={<Trash2 size={16} />}
                                                                onClick={() => handleDeleteUser(pat._id)}
                                                                sx={{ borderRadius: 2 }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        <Box py={8} display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                                                            <div className="bg-gray-100 p-4 rounded-full mb-2">
                                                                <User size={32} className="text-gray-400" />
                                                            </div>
                                                            <Typography variant="subtitle1" fontWeight="medium">No patients found</Typography>
                                                            <Typography variant="body2">No patients are currently linked to this hospital.</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </Box>
                        </Paper>
                    </motion.div>
                )}

            </AnimatePresence>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
