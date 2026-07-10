import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import PageTransition from './PageTransition';

// ── Lazy-loaded Pages (Code Splitting) ─────────────────────────────────────
// Public pages loaded lazily to reduce initial bundle size
const Home              = lazy(() => import('../pages/Home'));
const Login             = lazy(() => import('../pages/Login'));
const Signup            = lazy(() => import('../pages/Signup'));
const ForgotPassword    = lazy(() => import('../pages/ForgotPassword'));
const Profile           = lazy(() => import('../pages/Profile'));
const HospitalSearch    = lazy(() => import('../pages/HospitalSearch'));
const HospitalDetails   = lazy(() => import('../pages/HospitalDetails'));
const Doctors           = lazy(() => import('../pages/Doctors'));
const DoctorDetails     = lazy(() => import('../pages/DoctorDetails'));
const AmbulanceServices = lazy(() => import('../pages/AmbulanceServices'));
const LabTests          = lazy(() => import('../pages/LabTests'));
const ProjectTeam       = lazy(() => import('../pages/ProjectTeam'));

// Dashboard pages — largest components, benefit most from lazy loading
const PatientDashboard     = lazy(() => import('../pages/PatientDashboard'));
const DoctorDashboard      = lazy(() => import('../pages/DoctorDashboard'));
const AdminDashboard       = lazy(() => import('../pages/AdminDashboard'));
const DriverDashboard      = lazy(() => import('../pages/DriverDashboard'));
const SuperAdminDashboard  = lazy(() => import('../pages/SuperAdminDashboard'));

// 404 page
const NotFound = lazy(() => import('../pages/NotFound'));

// ── Loading Fallback ──────────────────────────────────────────────────────────
const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
    </div>
);

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    {/* Public Routes with Navbar */}
                    <Route path="/"           element={<PageTransition><Navbar /><Home /></PageTransition>} />
                    <Route path="/hospitals"  element={<PageTransition><Navbar /><HospitalSearch /></PageTransition>} />
                    <Route path="/hospitals/:id" element={<PageTransition><Navbar /><HospitalDetails /></PageTransition>} />
                    <Route path="/doctors"    element={<PageTransition><Navbar /><Doctors /></PageTransition>} />
                    <Route path="/doctors/:id" element={<PageTransition><Navbar /><DoctorDetails /></PageTransition>} />
                    <Route path="/ambulance"  element={<PageTransition><Navbar /><AmbulanceServices /></PageTransition>} />
                    <Route path="/lab-tests"  element={<PageTransition><Navbar /><LabTests /></PageTransition>} />
                    <Route path="/team"       element={<PageTransition><Navbar /><ProjectTeam /></PageTransition>} />

                    {/* Auth Routes */}
                    <Route path="/login"           element={<PageTransition><Login /></PageTransition>} />
                    <Route path="/signup"          element={<PageTransition><Signup /></PageTransition>} />
                    <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />

                    {/* Private Dashboard Routes (no shared Navbar — each has its own layout) */}
                    <Route path="/patient-dashboard"    element={<PageTransition><PatientDashboard /></PageTransition>} />
                    <Route path="/doctor-dashboard"     element={<PageTransition><DoctorDashboard /></PageTransition>} />
                    <Route path="/admin-dashboard"      element={<PageTransition><AdminDashboard /></PageTransition>} />
                    <Route path="/driver-dashboard"     element={<PageTransition><DriverDashboard /></PageTransition>} />
                    <Route path="/super-admin-dashboard" element={<PageTransition><SuperAdminDashboard /></PageTransition>} />
                    <Route path="/profile"              element={<PageTransition><Profile /></PageTransition>} />

                    {/* 404 Catch-all */}
                    <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                </Routes>
            </AnimatePresence>
        </Suspense>
    );
};

export default AnimatedRoutes;
