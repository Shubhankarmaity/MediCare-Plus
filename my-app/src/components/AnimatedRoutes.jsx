import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import PageTransition from './PageTransition';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import Profile from '../pages/Profile';
import PatientDashboard from '../pages/PatientDashboard';
import DoctorDashboard from '../pages/DoctorDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import DriverDashboard from '../pages/DriverDashboard';
import HospitalSearch from '../pages/HospitalSearch';
import HospitalDetails from '../pages/HospitalDetails';
import DoctorDetails from '../pages/DoctorDetails';
import AmbulanceServices from '../pages/AmbulanceServices';
import LabTests from '../pages/LabTests';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import ProjectTeam from '../pages/ProjectTeam';

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Routes with Navbar */}
                <Route path="/" element={<PageTransition><Navbar /><Home /></PageTransition>} />
                <Route path="/hospitals" element={<PageTransition><Navbar /><HospitalSearch /></PageTransition>} />
                <Route path="/hospitals/:id" element={<PageTransition><Navbar /><HospitalDetails /></PageTransition>} />
                <Route path="/doctors/:id" element={<PageTransition><Navbar /><DoctorDetails /></PageTransition>} />
                <Route path="/ambulance" element={<PageTransition><Navbar /><AmbulanceServices /></PageTransition>} />
                <Route path="/lab-tests" element={<PageTransition><Navbar /><LabTests /></PageTransition>} />

                {/* Auth Routes */}
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
                <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />

                {/* Private Dashboards (No Navbar, internal nav usually) */}
                <Route path="/patient-dashboard" element={<PageTransition><PatientDashboard /></PageTransition>} />
                <Route path="/doctor-dashboard" element={<PageTransition><DoctorDashboard /></PageTransition>} />
                <Route path="/admin-dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
                <Route path="/driver-dashboard" element={<PageTransition><DriverDashboard /></PageTransition>} />
                <Route path="/super-admin-dashboard" element={<PageTransition><SuperAdminDashboard /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                <Route path="/team" element={<PageTransition><ProjectTeam /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
