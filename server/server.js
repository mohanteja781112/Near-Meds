import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pharmacyRoutes from './routes/pharmacyRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allowing all origins for prototype
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected via socket:', socket.id);
  
  socket.on('join_hospital_room', () => {
    socket.join('hospitals');
    console.log(`Socket ${socket.id} joined 'hospitals' room`);
  });


  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to our router
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());


// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB at ' + (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nearmeds'));
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nearmeds', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds to avoid hanging
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not exit process, so the server can still start and we can see the error
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/hospital', hospitalRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('NearMeds API is running...');
});

// Start Server
const startServer = async () => {
  // Start listening first so we know the server process is active
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  // Then try to connect to DB
  await connectDB();
};

startServer();
