// api/miningStatus.js

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

        const miningStartTime = user.miningStartTime ? user.miningStartTime.toISOString() : null;
        const message = user.isMining ? "Mining in progress..." : "Mining not started";

        res.status(200).json({ coinBalance: user.coinBalance, miningStartTime, message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
