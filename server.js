const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectToDatabase = require('./utils/db');
const User = require('./models/User');
const redisClient = require('./cache');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectToDatabase().then(() => console.log('MongoDB connected'));

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const cache = async (req, res, next) => {
    const { username } = req.body || req.params;

    if (!username) return next();

    try {
        const cachedData = await redisClient.get(username);
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }
        next();
    } catch (error) {
        console.error('Redis error:', error);
        next();
    }
};

app.get('/api/referrals/:username', cache, async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username }).populate('referrals');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const referrals = user.referrals.map(ref => ({
            username: ref.username,
            coinBalance: ref.coinBalance
        }));

        const referralBonus = user.referrals.length * 50000;
        const miningRewards = referrals.reduce((acc, ref) => acc + ref.coinBalance * 0.2, 0);
        const totalEarnings = referralBonus + miningRewards;

        const response = { referrals, totalEarnings };
        await redisClient.set(username, JSON.stringify(response), 'EX', 3600);

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

        res.status(200).json({
            miningStartTime: user.miningStartTime,
            coinBalance: user.coinBalance,
            level: user.level,
            miningSessionCount: user.miningSessionCount || 0
        });
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
        const rewardIntervals = [2, 3, 4, 5, 6].map(h => h * 60 * 60 * 1000);
        const rewards = [15000, 30000, 60000, 120000, 240000];
        const miningEndTime = new Date(user.miningStartTime).getTime() + rewardIntervals[user.level - 1];

        if (user.isMining && currentTime >= miningEndTime) {
            user.coinBalance += rewards[user.level - 1];
            user.isMining = false;
            user.miningStartTime = null;
            user.miningSessionCount = (user.miningSessionCount || 0) + 1;
            await user.save();

            return res.status(200).json({
                miningComplete: true,
                coinBalance: user.coinBalance,
                miningSessionCount: user.miningSessionCount,
                level: user.level
            });
        }

        res.status(200).json({
            miningStartTime: user.miningStartTime,
            coinBalance: user.coinBalance,
            level: user.level,
            miningSessionCount: user.miningSessionCount || 0
        });
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

app.post('/api/updateBalance', async (req, res) => {
    const { username, reward } = req.body;

    // Log the request payload
    console.log(`Update Balance Request: username=${username}, reward=${reward}`);

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        user.coinBalance += reward;
        await user.save();

        console.log('Balance updated successfully');
        res.status(200).json({ message: 'Balance updated' });
    } catch (error) {
        // Log the error details
        console.error('Error updating balance:', error);
        res.status(500).json({ message: 'Error updating balance' });
    }
});

app.get('/api/miningSessionCount/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ miningSessionCount: user.miningSessionCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching mining session count' });
    }
});

app.get('/api/referralCount/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ referralCount: user.referralCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching referral count' });
    }
});

// Add API endpoint to check task status
app.get('/api/taskStatus/:username/:taskId', async (req, res) => {
    const { username, taskId } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const claimedTasks = user.claimedTasks || [];
        const claimed = claimedTasks.includes(taskId);

        res.status(200).json({ claimed });
    } catch (error) {
        res.status(500).json({ message: 'Error checking task status' });
    }
});

// Add API endpoint to claim a task
app.post('/api/claimTask', async (req, res) => {
    const { username, taskId, reward } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const claimedTasks = user.claimedTasks || [];
        if (claimedTasks.includes(taskId)) {
            return res.status(400).json({ message: 'Task already claimed' });
        }

        user.coinBalance += reward;
        claimedTasks.push(taskId);
        user.claimedTasks = claimedTasks;
        await user.save();

        res.status(200).json({ message: 'Task claimed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error claiming task' });
    }
});

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ message: 'Internal server error.' });
});

const routes = ['friends', 'tasks', 'market', 'softie', 'more', 'upgrades', 'login', 'register', 'join-softcoin', 'goals'];
routes.forEach(route => {
    app.get(`/${route}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', `${route}.html`));
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
