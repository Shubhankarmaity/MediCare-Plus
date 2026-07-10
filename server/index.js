const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const { Server } = require('socket.io');
require('dotenv').config();

const logger = require('./utils/logger');

// ── Crash fast if critical env vars are missing ─────────────────────────────
if (!process.env.JWT_SECRET) {
    logger.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
    process.exit(1);
}
if (!process.env.MONGODB_URI) {
    logger.error('FATAL: MONGODB_URI environment variable is not set. Refusing to start.');
    process.exit(1);
}

// ── Import Routes ─────────────────────────────────────────────────────────────
const authRoutes           = require('./routes/auth');
const doctorRoutes         = require('./routes/doctors');
const appointmentRoutes    = require('./routes/appointments');
const adminRoutes          = require('./routes/admin');
const ambulanceRoutes      = require('./routes/ambulance');
const accessRequestRoutes  = require('./routes/accessRequests');
const messageRoutes        = require('./routes/messages');
const notificationRoutes   = require('./routes/notifications');
const superAdminRoutes     = require('./routes/superAdmin');
const hospitalRoutes       = require('./routes/hospitals');
const vitalsRoutes         = require('./routes/vitals');
const paymentRoutes        = require('./routes/payments');
const chatbotRoutes        = require('./routes/chatbot');
const healthSummaryRoutes  = require('./routes/healthSummary');
const seedRoutes           = require('./routes/seed');
// Debug routes only loaded in non-production environments
const debugRoutes = process.env.NODE_ENV !== 'production'
    ? require('./routes/debug')
    : null;

const app = express();
const server = http.createServer(app);

// ── Socket.io Initialization (declared BEFORE middleware that uses `io`) ─────
const allowedOrigins = process.env.CLIENT_URL
    ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5179', 'http://localhost:5180', 'https://medi-care-plus-gules.vercel.app']
    : ['http://localhost:5173', 'http://localhost:5179', 'http://localhost:5180', 'https://medi-care-plus-gules.vercel.app'];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(helmet({
    crossOriginEmbedderPolicy: false,   // Allow embedding (needed for some frontend assets)
    contentSecurityPolicy: false,        // CSP managed separately or by frontend framework
}));
app.use(compression());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inject Socket.io instance into every request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/health-summary', healthSummaryRoutes);
app.use('/api/seed', seedRoutes);

// Debug routes only in non-production
if (debugRoutes) {
    app.use('/api/debug', debugRoutes);
    logger.warn('⚠️  Debug routes are ACTIVE (NODE_ENV is not production).');
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// ── Socket.io Real-Time Logic ─────────────────────────────────────────────────
io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // User joins their own private room (identified by MongoDB _id)
    socket.on('join_room', (userId) => {
        if (userId) {
            socket.join(userId);
            logger.debug(`Socket ${socket.id} joined room: ${userId}`);
        }
    });

    // Driver joins a shared 'drivers' room for receiving SOS alerts
    socket.on('join_drivers_room', () => {
        socket.join('drivers');
        logger.debug(`Socket ${socket.id} joined drivers room`);
    });

    // Driver sends location update — only notify the specific patient, not everyone
    socket.on('send_location', (data) => {
        // data = { lat, lng, driverId, patientId }
        logger.debug(`Location update from driver ${data.driverId}`);
        if (data.patientId) {
            // Send only to the requesting patient
            io.to(data.patientId).emit('receive_location', data);
        } else {
            // Fallback: broadcast only to drivers room (for admin monitoring)
            io.to('drivers').emit('receive_location', data);
        }
    });

    // SOS / Ambulance alert — only dispatched to drivers room, not all clients
    socket.on('sos_alert', (data) => {
        logger.info(`SOS alert received from patient ${data.patientId || 'unknown'}`);
        io.to('drivers').emit('dispatch_ambulance', data);
    });

    socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });

    // ── Video Call Signaling ──────────────────────────────────────────────────
    socket.on('callUser', ({ userToCall, signalData, from, name }) => {
        logger.debug(`Call initiated by ${from} to ${userToCall}`);
        io.to(userToCall).emit('callUser', { signal: signalData, from, name });
    });

    socket.on('answerCall', (data) => {
        logger.debug(`Call answered, signaling back to ${data.to}`);
        io.to(data.to).emit('callAccepted', data.signal);
    });

    socket.on('ice-candidate', ({ target, candidate }) => {
        io.to(target).emit('ice-candidate', candidate);
    });

    socket.on('endCall', ({ to }) => {
        logger.debug(`Call ended for ${to}`);
        io.to(to).emit('callEnded');
    });
});

// ── Database & Server Startup ─────────────────────────────────────────────────
const startServer = async () => {
    try {
        logger.info(`Connecting to MongoDB...`);
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        logger.info('✅ MongoDB Connected');

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            logger.info(`🚀 Server & Socket.io running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
            
            // Ping ML recommendation service every 10 minutes to keep it warm (Render free tier wakes up on traffic)
            const axios = require('axios');
            const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
            
            // Immediate warm-up ping
            axios.get(mlUrl).catch(() => {});
            
            // Recurring ping
            setInterval(() => {
                axios.get(mlUrl)
                    .then(() => logger.debug('ML Service keep-alive ping successful'))
                    .catch(err => logger.debug(`ML Service keep-alive ping: ${err.message}`));
            }, 10 * 60 * 1000);
        });
    } catch (err) {
        logger.error(`❌ MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    }
};

startServer();