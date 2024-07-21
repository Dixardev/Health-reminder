const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectToDatabase = require('./utils/db');
const User = require('./models/User');
const auth = require('./routes/auth');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectToDatabase().then(() => console.log('MongoDB connected'));

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));

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
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving mining status' });
    }
});

app.get('/api/referrals/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).populate('referrals');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const referrals = user.referrals.map(ref => ({
            username: ref.username,
            coinBalance: ref.coinBalance
        }));

        const referralBonus = user.referrals.length * 50000; // 50,000 SFT for each referred friend
        const miningRewards = referrals.reduce((acc, ref) => acc + ref.coinBalance * 0.2, 0); // 20% mining rewards
        const totalEarnings = referralBonus + miningRewards;

        res.status(200).json({ referrals, totalEarnings });
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).json({ message: 'Error fetching referrals' });
    }
});

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ message: 'Internal server error.' });
});

['friends', 'tasks', 'market', 'softie', 'more', 'upgrades', 'login', 'register', 'join-softcoin'].forEach(file => {
    app.get(`/${file}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', `${file}.html`));
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
