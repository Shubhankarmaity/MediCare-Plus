import React from 'react';
import { Ambulance, User, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 px-6 text-center rounded-b-[3rem] shadow-2xl mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Healthcare at Your Fingertips</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
          Book appointments, track ambulances in real-time, and manage your medical history securely.
        </p>
        <Link to="/signup" className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition transform inline-block">
          Get Started Now
        </Link>
      </header>

      {/* Features Overview */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 pb-20">
        <FeatureCard 
          icon={<Ambulance size={40} className="text-red-500" />}
          title="Emergency Ambulance"
          desc="Real-time GPS tracking of ambulances with estimated arrival times."
        />
        <FeatureCard 
          icon={<User size={40} className="text-blue-500" />}
          title="Top Specialists"
          desc="Access to over 500+ certified doctors across various specializations."
        />
        <FeatureCard 
          icon={<Shield size={40} className="text-green-500" />}
          title="Secure Data"
          desc="Your medical history is encrypted and only accessible by authorized personnel."
        />
      </div>
    </div>
  );
};

// Helper Component for Cards
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition border border-slate-100 text-center">
    <div className="bg-slate-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

export default Home;