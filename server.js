const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const User = require('./models/User');  // Import the User model

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable if set, otherwise default to 3000

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
    origin: 'https://softcoin.world', // Allow requests from your Vercel domain
    credentials: true
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
