const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectToDatabase = require('./utils/db');
const User = require('./models/User');
const redisClient = require('./cache'); // Import Redis client
const authRoutes = require('./routes/auth'); // Import authentication routes

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectToDatabase().then(() => console.log('MongoDB connected'));

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Use authentication routes
app.use('/api/auth', authRoutes);

// Cache middleware
const cache = async (req, res, next) => {
    const { username } = req.body || req.params; // Use req.params for GET requests

    if (!username) {
        // If username is not defined, skip caching
        return next();
    }

    try {
        console.log('Checking cache for:', username); // Debugging
        const cachedData = await redisClient.get(username);

        if (cachedData) {
            console.log('Cache hit:', username); // Debugging
            return res.status(200).json(JSON.parse(cachedData));
        }

        console.log('Cache miss:', username); // Debugging
        next();
    } catch (error) {
        console.error('Redis error:', error);
        next();
    }
};

// Apply cache middleware to referral endpoint
app.get('/api/referrals/:username', cache, async (req, res) => {
    const { username } = req.params;

    try {
        console.log('Fetching referrals for:', username); // Debugging
        const user = await User.findOne({ username }).populate('referrals');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const referrals = user.referrals.map(ref => ({
            username: ref.username,
            coinBalance: ref.coinBalance
        }));

        const referralBonus = user.referrals.length * 50000; // 50,000 SFT for each referred friend
        const miningRewards = referrals.reduce((acc, ref) => acc + ref.coinBalance * 0.2, 0); // 20% mining rewards
        const totalEarnings = referralBonus + miningRewards;

        const response = { referrals, totalEarnings };
        await redisClient.set(username, JSON.stringify(response), 'EX', 60 * 60); // Cache for 1 hour

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).json({ message: 'Error fetching referrals' });
    }
});

app.post('/api/startMining', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isMining) return res.status(400).json({ message: 'Mining already in progress' });

        user.isMining = true;
        user.miningStartTime = new Date();
        await user.save();

        res.status(200).json({ miningStartTime: user.miningStartTime, coinBalance: user.coinBalance, level: user.level });
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
        const rewardIntervals = [2 * 60 * 60 * 1000, 3 * 60 * 60 * 1000, 4 * 60 * 60 * 1000, 5 * 60 * 60 * 1000, 6 * 60 * 60 * 1000];
        const rewards = [15000, 30000, 60000, 120000, 240000];
        const miningEndTime = new Date(user.miningStartTime).getTime() + rewardIntervals[user.level - 1];

        if (user.isMining && currentTime >= miningEndTime) {
            user.coinBalance += rewards[user.level - 1];
            user.isMining = false;
            user.miningStartTime = null;
            user.miningSessionCount += 1;
            await user.save();
            return res.status(200).json({ miningComplete: true, coinBalance: user.coinBalance, miningSessionCount: user.miningSessionCount, level: user.level });
        }

        res.status(200).json({ miningStartTime: user.miningStartTime, coinBalance: user.coinBalance, miningSessionCount: user.miningSessionCount, level: user.level });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving mining status' });
    }
});

app.post('/api/upgradeLevel', async (req, res) => {
    const { username, level } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (level !== user.level + 1) return res.status(400).json({ message: 'Cannot skip levels' });

        const upgradeCosts = [0, 100000, 500000, 2000000, 10000000];
        if (user.coinBalance < upgradeCosts[level - 1]) return res.status(400).json({ message: 'Insufficient balance' });

        user.coinBalance -= upgradeCosts[level - 1];
        user.level = level;
        await user.save();

        res.status(200).json({ success: true, level: user.level, coinBalance: user.coinBalance });
    } catch (error) {
        res.status(500).json({ message: 'Error upgrading level' });
    }
});

app.get('/api/miningSessionCount/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ miningSessionCount: user.miningSessionCount });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving mining session count' });
    }
});

// Endpoint to claim task reward
app.post('/api/claimTaskReward', async (req, res) => {
    const { username, taskId, reward } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the task is already completed
        if (user.completedTasks && user.completedTasks.includes(taskId)) {
            return res.status(400).json({ message: 'Task already completed' });
        }

        // Add the reward to the user's balance
        user.coinBalance += reward;
        user.completedTasks = user.completedTasks || [];
        user.completedTasks.push(taskId);
        await user.save();

        res.status(200).json({ success: true, newBalance: user.coinBalance });
    } catch (error) {
        res.status(500).json({ message: 'Error claiming task reward' });
    }
});

// Endpoint to claim daily check-in bonus
app.post('/api/claimCheckInBonus', async (req, res) => {
    const { username, reward } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Add the reward to the user's balance
        user.coinBalance += reward;
        await user.save();

        res.status(200).json({ success: true, newBalance: user.coinBalance });
    } catch (error) {
        res.status(500).json({ message: 'Error claiming daily check-in bonus' });
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
