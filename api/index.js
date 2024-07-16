const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const User = require('../models/User');  // Adjusted the path

// Load environment variables from .env file
dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);


const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB using the connection string from the .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://www.softcoin.world'],
    credentials: true
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));  // Adjusted the path

// Serve index.html as the default page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));  // Adjusted the path
});

// Routes
const authRoutes = require('../routes/auth');  // Adjusted the path
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;  // Export the app for serverless function compatibility
