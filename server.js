const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectToDatabase = require('./utils/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectToDatabase().then(() => console.log('MongoDB connected'));

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
const referralRoutes = require('./routes/referrals');
app.use('/api', referralRoutes);



const User = require('./models/User');

app.post('/api/startMining', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isMining) return res.status(400).json({ message: 'Mining already in progress' });

        user.isMining = true;
        user.miningStartTime = new Date();
        await user.save();

        res.status(200).json({ miningStartTime: user.miningStartTime, coinBalance: user.coinBalance });
    } catch {
        res.status(500).json({ message: 'Error starting mining' });
    }
});

app.post('/api/miningStatus', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const currentTime = Date.now();
        const miningEndTime = new Date(user.miningStartTime).getTime() + (2 * 60 * 60 * 1000);

        if (user.isMining && currentTime >= miningEndTime) {
            user.coinBalance += 15000;
            user.isMining = false;
            user.miningStartTime = null;
            await user.save();
            return res.status(200).json({ miningComplete: true, coinBalance: user.coinBalance });
        }

        res.status(200).json({ miningStartTime: user.miningStartTime, coinBalance: user.coinBalance });
    } catch {
        res.status(500).json({ message: 'Error retrieving mining status' });
    }
});

 ['friends', 'tasks', 'market', 'softie', 'more', 'upgrades', 'login', 'register', 'join-softcoin'].forEach(file => {
    app.get(`/${file}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', `${file}.html`));
   });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ message: 'Internal server error.' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
