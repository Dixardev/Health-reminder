// api/startMining.js
const connectToDatabase = require('../utils/db');
const User = require('../models/User');

module.exports = async function handler(req, res) {
    if (req.method === 'POST') {
        const { username } = req.body;

        try {
            await connectToDatabase();

            const user = await User.findOne({ username });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if the user is currently mining
            if (user.isMining) {
                return res.status(400).json({ message: 'Mining already in progress' });
            }

            user.isMining = true;
            user.miningStartTime = new Date();
            await user.save();

            return res.status(200).json({
                message: 'Mining started',
                miningStartTime: user.miningStartTime,
                coinBalance: user.coinBalance
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error starting mining', error });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
