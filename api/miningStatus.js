const User = require('../models/User');
const redisClient = require('../redisClient');

module.exports = async function handler(req, res) {
    if (req.method === 'POST') {
        const { username } = req.body;

        try {
            const cacheKey = `miningStatus:${username}`;
            redisClient.get(cacheKey, async (err, cachedData) => {
                if (err) {
                    console.error('Redis error:', err);
                    return res.status(500).json({ message: 'Error retrieving mining status' });
                }

                if (cachedData) {
                    const data = JSON.parse(cachedData);
                    return res.status(200).json({
                        message: 'Mining status from cache',
                        miningStartTime: data.miningStartTime,
                        coinBalance: data.coinBalance
                    });
                } else {
                    const user = await User.findOne({ username });

                    if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                    }

                    const currentTime = Date.now();
                    const miningEndTime = new Date(user.miningStartTime).getTime() + (2 * 60 * 60 * 1000);

                    if (user.isMining && currentTime >= miningEndTime) {
                        user.coinBalance += 15000;
                        user.isMining = false;
                        user.miningStartTime = null;
                        await user.save();

                        redisClient.setex(cacheKey, cacheTTL, JSON.stringify({
                            miningStartTime: null,
                            coinBalance: user.coinBalance
                        }));

                        return res.status(200).json({
                            message: 'Mining complete!',
                            miningComplete: true,
                            coinBalance: user.coinBalance
                        });
                    } else if (user.isMining) {
                        redisClient.setex(cacheKey, cacheTTL, JSON.stringify({
                            miningStartTime: user.miningStartTime,
                            coinBalance: user.coinBalance
                        }));

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
                }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error retrieving mining status', error });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
