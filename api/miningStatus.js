// api/miningStatus.js
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

            const currentTime = new Date().getTime();
            const miningEndTime = new Date(user.miningStartTime).getTime() + (2 * 60 * 60 * 1000); // 2 hours in milliseconds

            if (user.isMining && currentTime >= miningEndTime) {
                user.coinBalance += 15000; // Add the mined coins to the user's balance
                user.isMining = false;
                user.miningStartTime = null;
                await user.save();

                return res.status(200).json({
                    message: 'Mining complete!',
                    miningComplete: true,
                    coinBalance: user.coinBalance
                });
            } else if (user.isMining) {
                return res.status(200).json({
                    message: 'Mining in progress...',
                    miningStartTime: user.miningStartTime,
                    coinBalance: user.coinBalance
                });
            } else {
                return res.status(200).json({
                    message: 'Mining not started',
                    miningStartTime: null,
                    coinBalance: user.coinBalance
                });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Error retrieving mining status', error });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
