// api/startMining.js

const mongoose = require('mongoose');
const User = require('../models/User');
const connectToDatabase = require('../utils/db'); // Adjusted path

module.exports = async (req, res) => {
    try {
        await connectToDatabase();

        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isMining) {
            return res.status(400).json({ message: 'Mining already in progress' });
        }

        user.isMining = true;
        user.miningStartTime = new Date();
        await user.save();

        res.status(200).json({ message: 'Mining started', miningStartTime: user.miningStartTime.toISOString() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
