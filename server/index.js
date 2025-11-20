const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();


// Import Routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const ambulanceRoutes = require('./routes/ambulance');

const app = express();
const server = http.createServer(app); // Wrap Express with HTTP server for Socket.io

// Middleware
app.use(cors());
app.use(express.json());

// Database
mongoose.connect('mongodb://127.0.0.1:27017/hospital-app')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use('/', authRoutes); // /login, /register
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ambulance', ambulanceRoutes);

// --- SOCKET.IO REAL-TIME LOGIC ---
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow Frontend to connect
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. Driver sends location update
  socket.on("send_location", (data) => {
    // data = { lat: 40.7128, lng: -74.0060, driverId: '123' }
    console.log("Location Update:", data);
    
    // Broadcast to everyone (or specific patients)
    io.emit("receive_location", data);
  });

  // 2. Ambulance Request (SOS)
  socket.on("sos_alert", (data) => {
    console.log("SOS Received!", data);
    io.emit("dispatch_ambulance", data); // Alert all drivers
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server & Socket.io running on port ${PORT}`);
});