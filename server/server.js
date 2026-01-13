import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

// Nuskaitome environment kintamuosius iš .env failo
dotenv.config();

const app = express();

// ========== MIDDLEWARE ==========
// CORS - leidžia frontend (iš kito porto) pasiekti mūsų API
app.use(cors());

// JSON parser - konvertuoja incoming request body į JSON
app.use(express.json());

// Logging middleware - rodo kiekvieno request'o informaciją
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ========== DATABASE CONNECTION ==========
// Connect to MongoDB using the MONGO_URI from .env
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the app' });
});

// Listen to requests
app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + process.env.PORT);
});
