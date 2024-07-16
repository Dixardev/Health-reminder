const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust the path according to your project structure
const { ObjectId } = mongoose.Types; // Import ObjectId

// Route to start mining
router.post('/start-mining', async (req, res) => {
    const { userId } = req.body;

    console.log('Starting mining for user:', userId); // Log user ID

    try {
        // Convert userId to ObjectId
        const objectId = ObjectId(userId);

        // Find the user by _id
        const user = await User.findOne({ _id: objectId });

        if (!user) {
            console.error('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Start mining logic (update user mining status, start time, etc.)
        user.isMining = true;
        user.miningStartTime = new Date();
        await user.save();

        console.log('Mining started for user:', userId); // Log success
        res.status(200).json({ message: 'Mining started' });
    } catch (err) {
        console.error('Error starting mining:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to check mining status
router.get('/mining-status/:userId', async (req, res) => {
    const { userId } = req.params;

    console.log('Fetching mining status for user:', userId); // Log user ID

    try {
        // Convert userId to ObjectId
        const objectId = ObjectId(userId);

        // Find the user by _id
        const user = await User.findOne({ _id: objectId });

        if (!user) {
            console.error('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user mining status and coin balance
        res.status(200).json({
            coinBalance: user.coinBalance,
            isMining: user.isMining,
            miningStartTime: user.miningStartTime
        });
    } catch (err) {
        console.error('Error fetching mining status:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
