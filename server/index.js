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
const accessRequestRoutes = require('./routes/accessRequests');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app); // Wrap Express with HTTP server for Socket.io

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5179", "http://localhost:5180", "https://medi-care-plus-gules.vercel.app"] : ["http://localhost:5173", "http://localhost:5179", "http://localhost:5180", "https://medi-care-plus-gules.vercel.app"],
  credentials: true
}));
app.use(express.json());

// Inject Socket.io into Request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital-app';
console.log("Attempting to connect to MongoDB at:", MONGODB_URI);
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use('/', authRoutes); // /login, /register
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
const hospitalRoutes = require('./routes/hospitals');
app.use('/api/hospitals', hospitalRoutes);
const seedRoutes = require('./routes/seed');
app.use('/api/seed', seedRoutes);

// --- SOCKET.IO REAL-TIME LOGIC ---
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5179", "http://localhost:5180", "https://medi-care-plus-gules.vercel.app"] : ["http://localhost:5173", "http://localhost:5179", "http://localhost:5180", "https://medi-care-plus-gules.vercel.app"], // Allow Frontend to connect from both ports
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // JOIN USER ROOM
  socket.on("join_room", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${socket.id} joined room: ${userId}`);
    }
  });

  // SEND MESSAGE
  socket.on("send_message", (data) => {
    // data: { senderId, receiverId, content, etc... }
    // This is often handled by API + broadcast, but purely socket chat is also Possible.
    // We rely on the API triggering the 'receive_message' event usually, 
    // but if we want socket-only:
    // io.to(data.receiverId).emit("receive_message", data);
  });

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server & Socket.io running on port ${PORT}`);
});