const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/signflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Atlas connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const translationRoutes = require('./routes/translations');
const favoriteRoutes = require('./routes/favorites');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connection handling
const activeConnections = new Map();

wss.on('connection', (ws, req) => {
  const userId = req.url.split('userId=')[1] || 'anonymous';
  
  // Remove any existing connection for this user
  if (activeConnections.has(userId)) {
    const oldWs = activeConnections.get(userId);
    if (oldWs.readyState === WebSocket.OPEN) {
      oldWs.close(1000, 'Replaced by new connection');
    }
    activeConnections.delete(userId);
  }
  
  activeConnections.set(userId, ws);
  console.log(`✅ WebSocket connected: ${userId} (Total: ${activeConnections.size})`);

  // Send ping to keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000); // Ping every 30 seconds

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // Only log if it's not a pong response
      if (data.type !== 'pong') {
        console.log('📨 WebSocket message received:', data);
      }
    } catch (error) {
      console.error('❌ WebSocket message error:', error);
    }
  });

  ws.on('pong', () => {
    // Connection is alive
  });

  ws.on('close', (code, reason) => {
    clearInterval(pingInterval);
    activeConnections.delete(userId);
    console.log(`❌ WebSocket disconnected: ${userId} (Code: ${code}, Reason: ${reason || 'none'})`);
  });

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${userId}:`, error.message);
  });
});

// Broadcast translation update to all connected clients
const broadcastTranslation = (translationData) => {
  const message = JSON.stringify({
    type: 'translation_update',
    data: translationData
  });
  
  activeConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
};

// Export broadcast function for use in routes
app.locals.broadcastTranslation = broadcastTranslation;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 SignFlow backend server running on port ${PORT}`);
});

module.exports = { app, server, wss, broadcastTranslation };
