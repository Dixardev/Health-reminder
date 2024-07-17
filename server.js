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

// Middleware to verify JWT token and check session in Redis
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        try {
            const userData = await redisClient.get(`auth_${token}`);

            if (!userData) {
                return res.status(401).json({ message: 'Session expired. Please log in again.' });
            }

            req.user = JSON.parse(userData);
            next();
        } catch (error) {
            console.error('Redis error:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    });
};

// Routes
app.post('/api/startMining', verifyToken, startMining);
app.post('/api/miningStatus', verifyToken, miningStatus);
app.use('/api/auth', authRoutes);
app.use('/api', verifyToken, referralRoutes);

// Serve HTML files
const htmlFiles = [
  'index',
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

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
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
