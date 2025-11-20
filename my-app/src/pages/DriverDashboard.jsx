import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Navigation, Power } from 'lucide-react';

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <DashboardLayout title="Ambulance Driver" userRole="driver">
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`w-48 h-48 rounded-full border-8 flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${isOnline ? 'bg-red-600 border-red-400 scale-110' : 'bg-slate-800 border-slate-600'}`}
        >
          <Power size={48} className="text-white mb-2" />
          <span className="text-white font-bold text-xl">{isOnline ? "ONLINE" : "OFFLINE"}</span>
        </button>

        <div className={`px-6 py-2 rounded-full font-mono font-bold ${isOnline ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
          {isOnline ? "GPS SIGNAL: ACTIVE - BROADCASTING" : "GPS SIGNAL: DISCONNECTED"}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;