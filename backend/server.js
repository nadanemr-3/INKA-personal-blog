const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Do not advertise the framework in response headers
app.disable('x-powered-by');

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
      origin === process.env.CORS_ORIGIN
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'INKA API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`INKA backend server is running on port ${PORT}`);

  // Verify database connectivity on startup
  try {
    await db.query('SELECT 1');
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
});

