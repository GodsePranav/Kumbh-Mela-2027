/**
 * KumbhSmart Tourism – Express Server Entry Point
 * MERN Backend for User Module
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth.routes');
const userRoutes         = require('./routes/user.routes');
const placeRoutes        = require('./routes/place.routes');
const eventRoutes        = require('./routes/event.routes');
const tripRoutes         = require('./routes/trip.routes');
const notificationRoutes = require('./routes/notification.routes');
const emergencyRoutes    = require('./routes/emergency.routes');
const lostFoundRoutes    = require('./routes/lostFound.routes');
const aiRoutes           = require('./routes/ai.routes');
const mapRoutes          = require('./routes/map.routes');
const volunteerRoutes    = require('../../Volunteer/Backend/volunteer.routes.js');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8443',
    methods: ["GET", "POST"]
  }
});

// Socket.io Events Setup
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('trigger-sos', (data) => {
    // data expected: { userId, location: { lat, lng }, emergencyType }
    console.log(`🚨 SOS Triggered by user ${data.userId}`);
    // Broadcast to volunteers
    io.emit('sos-alert', data);
  });

  socket.on('acknowledge-sos', (data) => {
    // data expected: { alertId, volunteerId, volunteerName }
    console.log(`✅ SOS Acknowledged by ${data.volunteerName}`);
    io.emit('sos-acknowledged', data);
  });

  socket.on('resolve-sos', (data) => {
    // data expected: { alertId, volunteerId }
    console.log(`🏁 SOS Resolved: ${data.alertId}`);
    io.emit('sos-resolved', data);
  });

  // Step 3: Crowd Management - Geofence Broadcast
  socket.on('broadcast-geofence-alert', (data) => {
    // data expected: { center: { lat, lng }, radius, message, volunteerId }
    console.log(`⚠️ Geofence Alert from ${data.volunteerId}: ${data.message}`);
    io.emit('geofence-alert', data);
  });

  // Step 4: Live Chat - Request Assistance
  socket.on('request-assistance', (data) => {
    // data expected: { ticketId, userId, message, location }
    console.log(`🙋 Assistance requested by user ${data.userId}`);
    io.emit('assistance-requested', data);
  });

  // Step 4: Live Chat - Accept Assistance & Join Room
  socket.on('accept-assistance', (data) => {
    // data expected: { ticketId, volunteerId }
    console.log(`🤝 Ticket ${data.ticketId} accepted by ${data.volunteerId}`);
    socket.join(data.ticketId); 
    io.emit('assistance-accepted', data);
  });

  // Step 4: Live Chat - Messages
  socket.on('chat-message', (data) => {
    // data expected: { ticketId, sender, message, timestamp }
    io.to(data.ticketId).emit('chat-message', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});


// Connect to MongoDB
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8443',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── API Routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/users`,         userRoutes);
app.use(`${API}/places`,        placeRoutes);
app.use(`${API}/events`,        eventRoutes);
app.use(`${API}/trips`,         tripRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/emergency`,     emergencyRoutes);
app.use(`${API}/lost-found`,    lostFoundRoutes);
app.use(`${API}/ai`,            aiRoutes);
app.use(`${API}/map`,           mapRoutes);
app.use(`${API}/volunteers`,    volunteerRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'KumbhSmart API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 KumbhSmart API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}\n`);
});
