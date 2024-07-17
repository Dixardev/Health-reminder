// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB using the connection string from the .env file
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

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://www.softcoin.world'],
  credentials: true
}));

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the main index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Favicon route (if you have a favicon.ico in the public directory)
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Auth Middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes
const authRoutes = require('./routes/auth');
const startMining = require('./api/startMining');
const miningStatus = require('./api/miningStatus');
const referralRoutes = require('./routes/referrals');

// Route to start mining
app.post('/api/startMining', authenticateToken, startMining);

app.post('/api/miningStatus', authenticateToken, miningStatus);

app.use('/api/auth', authRoutes);
app.use('/api', authenticateToken, referralRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
