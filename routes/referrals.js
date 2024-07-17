const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route to get referrals for a user
router.get('/referrals/:username', async (req, res) => {
    console.log('Fetching referrals for:', req.params.username);

    try {
        const startTime = Date.now();

        const user = await User.findOne({ username: req.params.username })
            .populate('referrals', 'username coinBalance')
            .lean();

        const middleTime = Date.now();
        console.log('User fetched in', middleTime - startTime, 'ms');

        if (!user) {
            console.log('User not found:', req.params.username);
            return res.status(404).json({ message: 'User not found' });
        }

        const endTime = Date.now();
        console.log('Fetched user and referrals in', endTime - middleTime, 'ms');
        console.log('Total time:', endTime - startTime, 'ms');

        const referrals = user.referrals.map(referral => ({
            username: referral.username,
            earned: referral.coinBalance // Assuming `coinBalance` is the amount earned by the referral
        }));

        res.status(200).json(referrals);
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).json({ message: 'Error fetching referrals' });
    }
});

module.exports = router;
