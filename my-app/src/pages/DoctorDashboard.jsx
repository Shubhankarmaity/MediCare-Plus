import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ChatWindow from '../components/ChatWindow';
import DoctorAnalytics from '../components/DoctorAnalytics';
import DoctorSettings from '../components/DoctorSettings';
import { CheckCircle, X, User, Calendar, Clock, FileText, Video, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';
import DoctorReports from '../components/DoctorReports';
import PatientDetails from '../components/PatientDetails';
import VideoCall from '../components/VideoCall';
import { API_URL } from '../config';

const socket = io(API_URL); // Connect to server

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ today: 0, checked: 0 });
  const [reportDialog, setReportDialog] = useState({ open: false, appointment: null });
  const [patientDetails, setPatientDetails] = useState({ open: false, patientId: null });
  const [videoCall, setVideoCall] = useState({ open: false, partnerId: null });
  const [activeChat, setActiveChat] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching doctor appointments...');

      const res = await fetch(`${API_URL}/api/appointments/my-appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Check if response is ok before parsing JSON
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      console.log('Received appointments:', data.length);
      console.log('Appointments data:', data);

      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setAppointments(data);
        setStats({
          today: data.length,
          checked: data.filter(a => a.status !== 'pending').length
        });
      } else {
        console.error('Expected array but received:', data);
        setAppointments([]);
        setStats({ today: 0, checked: 0 });
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      // Set empty state on error
      setAppointments([]);
      setStats({ today: 0, checked: 0 });
    }
  };

  useEffect(() => {
    const initializeAppointments = async () => {
      try {
        await fetchAppointments();
      } catch (error) {
        console.error('Error initializing appointments:', error);
      }
    };
    initializeAppointments();

    const user = JSON.parse(localStorage.getItem('user'));
    socket.emit("join_room", user._id);

    // Real-time Listener
    socket.on('new_appointment', (newAppt) => {
      try {
        console.log('Received new appointment:', newAppt);
        console.log('Current doctor ID:', user._id);
        console.log('Appointment doctor ID:', newAppt.doctorId);

        // Convert both to string for comparison
        const appointmentDoctorId = typeof newAppt.doctorId === 'object' ? newAppt.doctorId._id : newAppt.doctorId;

        // Only update if this appointment is for the logged-in doctor
        if (appointmentDoctorId === user._id || appointmentDoctorId.toString() === user._id.toString()) {
          console.log('Appointment matched! Adding to list');
          setAppointments(prev => [newAppt, ...prev]);
          setStats(prev => ({ ...prev, today: prev.today + 1 }));
          // Play notification sound
          new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(e => console.log(e));
          alert(`New Patient Booking: ${newAppt.patientId?.name || newAppt.patientName || "Unknown Patient"}`);
        } else {
          console.log('Appointment not for this doctor, ignoring');
        }
      } catch (error) {
        console.error('Error processing new appointment:', error);
      }
    });

    return () => {
      socket.off('new_appointment');
    };
  }, []);

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/appointments/status/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchAppointments(); // Refresh list
  };

  const handleReportSubmit = async (appointmentId, reportData) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/appointments/report/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reportData)
      });

      if (res.ok) {
        alert('Report submitted successfully!');
        fetchAppointments(); // Refresh list to show updated report status
      } else {
        alert('Failed to submit report');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Error submitting report');
    }
  };

  const openReportDialog = (appointment) => {
    setReportDialog({ open: true, appointment });
  };

  const startChat = (patient) => {
    setChatPartner(patient);
    setActiveChat(true);
  };

  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <>
      {videoCall.open && (
        <VideoCall
          socket={socket}
          user={user}
          partnerId={videoCall.partnerId}
          isInitiator={true}
          onEnd={() => setVideoCall({ open: false, partnerId: null })}
        />
      )}

      {activeChat && chatPartner && (
        <ChatWindow
          currentUser={{ id: user._id, name: user.name }}
          chatPartner={chatPartner}
          onClose={() => {
            setActiveChat(false);
            setChatPartner(null);
          }}
        />
      )}

      <DashboardLayout title="Doctor's Console" userRole="doctor">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            className={`pb-2 px-4 font-medium transition ${activeTab === 'appointments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
          <button
            className={`pb-2 px-4 font-medium transition ${activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`pb-2 px-4 font-medium transition ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition">
                <p className="opacity-80">Today's Appointments</p>
                <h2 className="text-4xl font-bold">{stats.today}</h2>
              </div>
              <div className="bg-teal-500 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition">
                <p className="opacity-80">Patients Checked</p>
                <h2 className="text-4xl font-bold">{stats.checked}</h2>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Calendar className="text-blue-600" /> Upcoming Patients
              </h3>

              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments yet.</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-2">Total Appointments: {appointments.length}</p>
                  {appointments.map((appt, i) => {
                    return (
                      <div key={appt._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition">
                        <div className="flex items-center gap-4 mb-3 md:mb-0">
                          <div className={`p-3 rounded-full font-bold ${appt.status === 'pending' ? 'bg-orange-100 text-orange-600' : appt.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            #{i + 1}
                          </div>
                          <div>
                            {appt.patientId && appt.patientId._id ? (
                              <p
                                className="font-bold text-lg cursor-pointer hover:underline text-blue-600"
                                onClick={() => {
                                  if (appt.patientId && appt.patientId._id) {
                                    setPatientDetails({ open: true, patientId: appt.patientId._id });
                                  }
                                }}
                              >
                                {appt.patientId.name || appt.patientName}
                              </p>
                            ) : (
                              <p className="font-bold text-lg text-gray-500 cursor-not-allowed" title="Patient account may have been deleted">
                                {appt.patientName || "Unknown Patient"} (Deleted)
                              </p>
                            )}
                            {appt.patientId?.email && (
                              <p className="text-xs text-gray-600">{appt.patientId.email}</p>
                            )}
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} /> {new Date(appt.date).toLocaleString()}
                            </p>
                            <span className={`text-xs font-bold uppercase ${appt.status === 'pending' ? 'text-orange-500' : appt.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                              {appt.status}
                            </span>
                          </div>
                        </div>

                        {appt.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(appt._id, 'approved')}
                              className="flex items-center gap-1 px-4 py-2 bg-white text-green-600 rounded-lg shadow hover:bg-green-600 hover:text-white transition"
                            >
                              <CheckCircle size={18} /> Accept
                            </button>
                            <button
                              onClick={() => updateStatus(appt._id, 'rejected')}
                              className="flex items-center gap-1 px-4 py-2 bg-white text-red-500 rounded-lg shadow hover:bg-red-500 hover:text-white transition"
                            >
                              <X size={18} /> Decline
                            </button>
                          </div>
                        )}

                        {(() => {
                          const showReportButton = appt.status === 'approved' && (!appt.doctorReport || Object.keys(appt.doctorReport).length === 0);
                          const isApproved = appt.status === 'approved';

                          return (
                            <div className="flex gap-2">
                              {isApproved && (
                                <>
                                  <button
                                    onClick={() => startVideoCall(appt.patientId._id)}
                                    className="flex items-center gap-1 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg shadow hover:bg-indigo-600 hover:text-white transition"
                                    title="Start Video Consultation"
                                  >
                                    <Video size={18} /> Call
                                  </button>
                                  <button
                                    onClick={() => startChat(appt.patientId)}
                                    className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg shadow hover:bg-blue-600 hover:text-white transition"
                                    title="Chat with Patient"
                                  >
                                    <MessageSquare size={18} /> Chat
                                  </button>
                                </>
                              )}

                              {showReportButton && (
                                <button
                                  onClick={() => openReportDialog(appt)}
                                  className="flex items-center gap-1 px-4 py-2 bg-white text-teal-600 rounded-lg shadow hover:bg-teal-600 hover:text-white transition"
                                >
                                  <FileText size={18} /> Submit Report
                                </button>
                              )}
                            </div>
                          );
                        })()}

                        {appt.doctorReport && (
                          <button
                            onClick={() => openReportDialog(appt)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg shadow hover:bg-green-200 transition cursor-pointer"
                          >
                            <FileText size={18} />
                            <span className="text-sm font-medium">Report Submitted - Click to View/Edit</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <DoctorAnalytics appointments={appointments} />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <DoctorSettings />
        )}

      </DashboardLayout>

      <DoctorReports
        open={reportDialog.open}
        onClose={() => setReportDialog({ open: false, appointment: null })}
        appointment={reportDialog.appointment}
        onSubmit={handleReportSubmit}
      />

      <PatientDetails
        open={patientDetails.open}
        onClose={() => setPatientDetails({ open: false, patientId: null })}
        patientId={patientDetails.patientId}
      />
    </>
  );
};

export default DoctorDashboard;