import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { CheckCircle, X, User } from 'lucide-react';

const DoctorDashboard = () => {
  return (
    <DashboardLayout title="Doctor's Console" userRole="doctor">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="opacity-80">Today's Appointments</p>
          <h2 className="text-4xl font-bold">12</h2>
        </div>
        <div className="bg-teal-500 text-white p-6 rounded-2xl shadow-lg">
          <p className="opacity-80">Patients Checked</p>
          <h2 className="text-4xl font-bold">5</h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="font-bold text-lg mb-6">Upcoming Patients</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 font-bold">#{i}</div>
                <div>
                  <p className="font-bold">Patient Name</p>
                  <p className="text-xs text-gray-500">Fever & Cold • 10:30 AM</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white text-green-600 rounded-lg shadow hover:bg-green-50"><CheckCircle size={20}/></button>
                <button className="p-2 bg-white text-red-500 rounded-lg shadow hover:bg-red-50"><X size={20}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;