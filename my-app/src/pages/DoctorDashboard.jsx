import React, { useState, useEffect, useMemo, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ChatWindow from '../components/ChatWindow';
import DoctorAnalytics from '../components/DoctorAnalytics';
import DoctorSettings from '../components/DoctorSettings';
import { CheckCircle, X, User, Calendar, Clock, FileText, Video, MessageSquare, AlertTriangle, Search, Filter, Activity, Bell } from 'lucide-react';
import io from 'socket.io-client';
import DoctorReports from '../components/DoctorReports';
import PatientDetails from '../components/PatientDetails';
import VideoCall from '../components/VideoCall';
import { Snackbar, Alert } from '@mui/material';
import { API_URL } from '../config';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [reportDialog, setReportDialog] = useState({ open: false, appointment: null });
  const [patientDetails, setPatientDetails] = useState({ open: false, patientId: null });
  const [videoCall, setVideoCall] = useState({ open: false, partnerId: null });
  const [activeChat, setActiveChat] = useState(false);
  const [chatPartner, setChatPartner] = useState(null);
  const [notify, setNotify] = useState({ open: false, msg: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week'
  const [appointmentView, setAppointmentView] = useState('active'); // 'active', 'today', 'completed'

  const user = JSON.parse(localStorage.getItem('user'));
  const socketRef = useRef(null);

  const startVideoCall = (patientId) => {
    setVideoCall({ open: true, partnerId: patientId });
  };

  // Computed stats from appointments
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === today);
    return {
      total: appointments.length,
      active: appointments.filter(a => a.status === 'approved').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      todayCount: todayAppts.length,
      todayActive: todayAppts.filter(a => a.status === 'approved').length,
      pendingReports: appointments.filter(a => a.status === 'approved' && (!a.doctorReport || Object.keys(a.doctorReport).length === 0)).length,
      emergencyCount: appointments.filter(a => a.status === 'approved' && a.isEmergency).length,
    };
  }, [appointments]);

  // Filter & search logic
  const filteredActive = useMemo(() => {
    let list = appointments.filter(a => a.status === 'approved');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        (a.patientId?.name || a.patientName || '').toLowerCase().includes(q) ||
        (a.symptoms || '').toLowerCase().includes(q)
      );
    }
    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      list = list.filter(a => new Date(a.date).toDateString() === today);
    } else if (dateFilter === 'week') {
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      list = list.filter(a => { const d = new Date(a.date); return d >= now && d <= weekEnd; });
    }
    return list;
  }, [appointments, searchQuery, dateFilter]);

  const filteredCompleted = useMemo(() => {
    let list = appointments.filter(a => a.status === 'completed');
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        (a.patientId?.name || a.patientName || '').toLowerCase().includes(q) ||
        (a.doctorReport?.diagnosis || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [appointments, searchQuery]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toDateString();
    return appointments.filter(a => new Date(a.date).toDateString() === today && a.status === 'approved');
  }, [appointments]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/appointments/my-appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const s = io(API_URL);
    socketRef.current = s;
    s.emit("join_room", user._id);

    s.on('new_appointment', (newAppt) => {
      try {
        const appointmentDoctorId = typeof newAppt.doctorId === 'object' ? newAppt.doctorId._id : newAppt.doctorId;
        if (appointmentDoctorId === user._id || String(appointmentDoctorId) === String(user._id)) {
          fetchAppointments();
          setNotify({ open: true, msg: '🔔 New appointment assigned to you!', type: 'info' });
          new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
        }
      } catch (error) {
        console.error('Error processing new appointment:', error);
      }
    });

    s.on(`notification_${user._id}`, (data) => {
      if (data.type === 'appointment_assigned') {
        fetchAppointments();
        setNotify({ open: true, msg: '📋 Admin has assigned a new appointment to you!', type: 'info' });
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
      }
    });

    return () => {
      s.off('new_appointment');
      s.off(`notification_${user._id}`);
      s.disconnect();
    };
  }, [user._id]);

  const handleReportSubmit = async (appointmentId, reportData) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/appointments/report/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reportData)
      });
      if (res.ok) {
        setNotify({ open: true, msg: 'Report submitted successfully!', type: 'success' });
        fetchAppointments();
      } else {
        setNotify({ open: true, msg: 'Failed to submit report', type: 'error' });
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setNotify({ open: true, msg: 'Error submitting report', type: 'error' });
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
          socket={socketRef.current}
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

      <Snackbar open={notify.open} autoHideDuration={4000} onClose={() => setNotify({ ...notify, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setNotify({ ...notify, open: false })} severity={notify.type} variant="filled" sx={{ width: '100%' }}>
          {notify.msg}
        </Alert>
      </Snackbar>

      <DashboardLayout title="Doctor's Console" userRole="doctor">
        {/* Tab Navigation */}
        <div className="overflow-x-auto mb-6">
          <div className="flex space-x-1 border-b border-gray-200 min-w-max">
            <button
              className={`pb-2 px-4 font-medium transition whitespace-nowrap ${activeTab === 'appointments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('appointments')}
            >
              <span className="flex items-center gap-1.5"><Calendar size={16} />Appointments</span>
            </button>
            <button
              className={`pb-2 px-4 font-medium transition whitespace-nowrap ${activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('analytics')}
            >
              <span className="flex items-center gap-1.5"><Activity size={16} />Analytics</span>
            </button>
            <button
              className={`pb-2 px-4 font-medium transition whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </div>

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <>
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm opacity-80">Today's Schedule</p>
                  <Calendar size={20} className="opacity-60" />
                </div>
                <h2 className="text-3xl font-bold">{stats.todayCount}</h2>
                <p className="text-xs opacity-70 mt-1">{stats.todayActive} active today</p>
              </div>
              <div className="bg-green-500 text-white p-5 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm opacity-80">Active Patients</p>
                  <User size={20} className="opacity-60" />
                </div>
                <h2 className="text-3xl font-bold">{stats.active}</h2>
                <p className="text-xs opacity-70 mt-1">{stats.pendingReports} report{stats.pendingReports !== 1 ? 's' : ''} pending</p>
              </div>
              <div className="bg-teal-500 text-white p-5 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm opacity-80">Completed</p>
                  <CheckCircle size={20} className="opacity-60" />
                </div>
                <h2 className="text-3xl font-bold">{stats.completed}</h2>
                <p className="text-xs opacity-70 mt-1">out of {stats.total} total</p>
              </div>
              {stats.emergencyCount > 0 ? (
                <div className="bg-red-500 text-white p-5 rounded-2xl shadow-lg animate-pulse">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm opacity-90 font-semibold">🚨 Emergency</p>
                    <AlertTriangle size={20} />
                  </div>
                  <h2 className="text-3xl font-bold">{stats.emergencyCount}</h2>
                  <p className="text-xs opacity-80 mt-1">need urgent attention</p>
                </div>
              ) : (
                <div className="bg-indigo-500 text-white p-5 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm opacity-80">All Time</p>
                    <Activity size={20} className="opacity-60" />
                  </div>
                  <h2 className="text-3xl font-bold">{stats.total}</h2>
                  <p className="text-xs opacity-70 mt-1">total appointments</p>
                </div>
              )}
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6">
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient name or symptoms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'today', 'week'].map(f => (
                    <button
                      key={f}
                      onClick={() => setDateFilter(f)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${dateFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {f === 'all' ? 'All' : f === 'today' ? 'Today' : 'This Week'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section Toggle */}
            <div className="flex gap-2 mb-4">
              {[
                { key: 'active', label: 'Active Patients', count: filteredActive.length, color: 'green' },
                { key: 'today', label: "Today's Schedule", count: todayAppointments.length, color: 'blue' },
                { key: 'completed', label: 'Completed', count: filteredCompleted.length, color: 'teal' },
              ].map(sec => (
                <button
                  key={sec.key}
                  onClick={() => setAppointmentView(sec.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${appointmentView === sec.key
                    ? `bg-${sec.color}-100 text-${sec.color}-700 border-2 border-${sec.color}-300`
                    : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'
                    }`}
                >
                  {sec.label}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${appointmentView === sec.key ? `bg-${sec.color}-200` : 'bg-gray-200'}`}>{sec.count}</span>
                </button>
              ))}
            </div>

            {/* TODAY'S SCHEDULE VIEW */}
            {appointmentView === 'today' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Clock className="text-blue-600" /> Today's Schedule — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                {todayAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No appointments scheduled for today.</p>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments
                      .sort((a, b) => (a.assignedTimeSlot || '').localeCompare(b.assignedTimeSlot || ''))
                      .map((appt, i) => (
                        <div key={appt._id} className={`p-4 rounded-xl border-2 flex flex-col md:flex-row md:items-center justify-between ${appt.isEmergency ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'}`}>
                          <div className="flex items-center gap-4 mb-3 md:mb-0">
                            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white font-bold ${appt.isEmergency ? 'bg-red-500' : 'bg-blue-600'}`}>
                              <span className="text-lg">{appt.assignedTimeSlot || '--'}</span>
                            </div>
                            <div>
                              <p className="font-bold text-lg">{appt.patientId?.name || appt.patientName || 'Unknown'}</p>
                              {appt.symptoms && <p className="text-sm text-gray-600 mt-0.5">💊 {appt.symptoms}</p>}
                              {appt.isEmergency && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-1">
                                  <AlertTriangle size={12} /> EMERGENCY
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {appt.patientId?._id && (
                              <>
                                <button onClick={() => startVideoCall(appt.patientId._id)} className="flex items-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition text-sm">
                                  <Video size={16} /> Call
                                </button>
                                <button onClick={() => startChat(appt.patientId)} className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition text-sm">
                                  <MessageSquare size={16} /> Chat
                                </button>
                              </>
                            )}
                            <button onClick={() => openReportDialog(appt)} className="flex items-center gap-1 px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition text-sm font-semibold">
                              <FileText size={16} /> Submit Report
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ACTIVE APPOINTMENTS */}
            {appointmentView === 'active' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Calendar className="text-blue-600" /> Active Patients
                  {searchQuery && <span className="text-sm font-normal text-gray-400 ml-2">showing results for "{searchQuery}"</span>}
                </h3>

                {filteredActive.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {searchQuery ? 'No patients match your search.' : 'No active appointments. Appointments assigned by admin will appear here.'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredActive.map((appt, i) => {
                      const hasReport = appt.doctorReport && Object.keys(appt.doctorReport).length > 0;
                      return (
                        <div key={appt._id} className={`p-4 rounded-xl border-2 ${appt.isEmergency ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-200'}`}>
                          <div className="flex flex-col md:flex-row md:items-start justify-between">
                            <div className="flex items-start gap-4 mb-3 md:mb-0">
                              <div className={`p-3 rounded-full font-bold ${appt.isEmergency ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                #{i + 1}
                              </div>
                              <div>
                                {appt.patientId && appt.patientId._id ? (
                                  <p
                                    className="font-bold text-lg cursor-pointer hover:underline text-blue-600"
                                    onClick={() => setPatientDetails({ open: true, patientId: appt.patientId._id })}
                                  >
                                    {appt.patientId.name || appt.patientName}
                                  </p>
                                ) : (
                                  <p className="font-bold text-lg text-gray-500 cursor-not-allowed">
                                    {appt.patientName || "Unknown Patient"} (Deleted)
                                  </p>
                                )}
                                {appt.patientId?.email && (
                                  <p className="text-xs text-gray-600">{appt.patientId.email}</p>
                                )}

                                {/* Symptoms & Emergency Badge */}
                                {appt.isEmergency && (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-1 mr-2">
                                    <AlertTriangle size={12} /> EMERGENCY
                                  </span>
                                )}
                                {appt.symptoms && (
                                  <p className="text-sm text-gray-700 mt-1 bg-gray-100 rounded-lg px-3 py-1.5 inline-block">
                                    💊 <span className="font-medium">Symptoms:</span> {appt.symptoms}
                                  </p>
                                )}

                                {/* Schedule Display */}
                                <div className="mt-2 inline-flex items-center gap-3 bg-white border border-green-300 rounded-lg px-3 py-1.5">
                                  <span className="flex items-center gap-1 text-sm font-bold text-green-800">
                                    <Calendar size={14} /> {new Date(appt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </span>
                                  {appt.assignedTimeSlot && (
                                    <span className="flex items-center gap-1 text-sm font-bold text-green-800">
                                      <Clock size={14} /> {appt.assignedTimeSlot}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-green-600 font-semibold mt-1">Assigned by Admin</p>
                              </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              {appt.patientId?._id && (
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
                              {!hasReport ? (
                                <button
                                  onClick={() => openReportDialog(appt)}
                                  className="flex items-center gap-1 px-4 py-2 bg-teal-500 text-white rounded-lg shadow hover:bg-teal-600 transition font-semibold"
                                >
                                  <FileText size={18} /> Submit Report & Complete
                                </button>
                              ) : (
                                <button
                                  onClick={() => openReportDialog(appt)}
                                  className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg shadow hover:bg-green-200 transition"
                                >
                                  <FileText size={18} /> View/Edit Report
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* COMPLETED APPOINTMENTS */}
            {appointmentView === 'completed' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="text-teal-600" /> Completed Checkups
                  {searchQuery && <span className="text-sm font-normal text-gray-400 ml-2">showing results for "{searchQuery}"</span>}
                </h3>
                {filteredCompleted.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">{searchQuery ? 'No completed appointments match your search.' : 'No completed checkups yet.'}</p>
                ) : (
                  <div className="space-y-3">
                    {filteredCompleted.map((appt) => (
                      <div key={appt._id} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-center gap-4 mb-3 md:mb-0">
                            <div className="p-3 rounded-full font-bold bg-teal-100 text-teal-600">
                              <CheckCircle size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-lg">{appt.patientId?.name || appt.patientName || 'Unknown Patient'}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} /> {new Date(appt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                {appt.assignedTimeSlot && ` at ${appt.assignedTimeSlot}`}
                              </p>
                              {/* Diagnosis preview & Severity */}
                              {appt.doctorReport?.diagnosis && (
                                <p className="text-sm text-gray-700 mt-1">
                                  <span className="font-semibold">Diagnosis:</span> {appt.doctorReport.diagnosis}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold uppercase text-teal-600">Checkup Completed</span>
                                {appt.doctorReport?.severity && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                    appt.doctorReport.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                    appt.doctorReport.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                                    appt.doctorReport.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {appt.doctorReport.severity}
                                  </span>
                                )}
                                {appt.doctorReport?.followUpDate && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    Follow-up: {new Date(appt.doctorReport.followUpDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => openReportDialog(appt)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg shadow hover:bg-blue-200 transition cursor-pointer"
                          >
                            <FileText size={18} />
                            <span className="text-sm font-medium">View Report</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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