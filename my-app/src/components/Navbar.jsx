import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
        <Activity size={28} />
        <span>MediCare Plus</span>
      </Link>

      {/* Top Right Buttons */}
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">
          Log In
        </Link>
        <Link to="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;