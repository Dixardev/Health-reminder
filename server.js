const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const redisClient = require('./redisClient');
const authRoutes = require('./routes/auth');
const startMining = require('./api/startMining');
const miningStatus = require('./api/miningStatus');
const referralRoutes = require('./routes/referrals');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection setup with caching
let cachedDb = null;
async function connectToDatabase(uri) {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await mongoose.connect(uri);
  cachedDb = client.connection.db;
  return cachedDb;
}
connectToDatabase(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/api/startMining', startMining);
app.post('/api/miningStatus', miningStatus);
app.use('/api/auth', authRoutes);
app.use('/api', referralRoutes);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const htmlFiles = [
  'friends',
  'tasks',
  'market',
  'softie',
  'more',
  'upgrades',
  'login',
  'register'
];

htmlFiles.forEach(file => {
  app.get(`/${file}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${file}.html`));
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ message: 'Internal server error.' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
