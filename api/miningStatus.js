const connectToDatabase = require('../utils/db');
const User = require('../models/User');

module.exports = async function handler(req, res) {
    if (req.method === 'POST') {
        const { username } = req.body;
        console.log('Received request with username:', username);

        try {
            await connectToDatabase();
            console.log('Database connected');

            const user = await User.findOne({ username });
            console.log('User found:', user);

            if (!user) {
                console.log('User not found');
                return res.status(404).json({ message: 'User not found' });
            }

            const currentTime = new Date().getTime();
            const miningEndTime = new Date(user.miningStartTime).getTime() + (2 * 60 * 60 * 1000); // 2 hours in milliseconds
            console.log('Current time:', currentTime);
            console.log('Mining end time:', miningEndTime);

            if (user.isMining && currentTime >= miningEndTime) {
                user.coinBalance += 15000; // Add the mined coins to the user's balance
                user.isMining = false;
                user.miningStartTime = null;
                await user.save();
                console.log('Mining complete, user balance updated:', user.coinBalance);

                return res.status(200).json({
                    message: 'Mining complete!',
                    miningComplete: true,
                    coinBalance: user.coinBalance
                });
            } else if (user.isMining) {
                console.log('Mining in progress');
                return res.status(200).json({
                    message: 'Mining in progress...',
                    miningStartTime: user.miningStartTime,
                    coinBalance: user.coinBalance
                });
            } else {
                console.log('Mining not started');
                return res.status(200).json({
                    message: 'Mining not started',
                    miningStartTime: null,
                    coinBalance: user.coinBalance
                });
            }
        } catch (error) {
            console.error('Error retrieving mining status:', error);
            return res.status(500).json({ message: 'Error retrieving mining status', error });
        }
    } else {
        console.log('Method not allowed');
        res.status(405).json({ message: 'Method not allowed' });
    }
};
