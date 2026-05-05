const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const matchRoutes = require('./routes/matchRoutes');
const playerRoutes = require('./routes/playerRoutes');

const app = express();

// ✅ Middleware
app.use(cors({
  origin: '*', // allow all for now (you can restrict later)
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Routes
app.use('/api/matches', matchRoutes);
app.use('/api/players', playerRoutes);

// ✅ Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ❌ REMOVE local Mongo fallback in production
// (Render will provide MONGO_URI via env)

// ✅ Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

// ✅ Health check route (VERY IMPORTANT for Render)
app.get('/', (req, res) => {
  res.send('CricTrack Backend Running ✅');
});