const mongoose = require('mongoose');
const User = require('../models/User');
const connectToDatabase = require('../utils/db'); // Utility to connect to MongoDB

module.exports = async (req, res) => {
    await connectToDatabase();

    const { username } = req.body;
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

    res.status(200).json({ message: 'Mining started' });
};
