import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

// Import New Dashboards
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import HospitalSearch from './pages/HospitalSearch';
import HospitalDetails from './pages/HospitalDetails';

function App() {
  return (
    <Router>
      {/* We only show Navbar on Home/Login/Signup. Dashboards have their own internal nav. */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private Dashboards */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Hospital Routes */}
        <Route path="/hospitals" element={<><Navbar /><HospitalSearch /></>} />
        <Route path="/hospitals/:id" element={<><Navbar /><HospitalDetails /></>} />
      </Routes>
    </Router>
  );
}

export default App;