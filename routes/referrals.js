const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/referrals/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).populate('referrals', 'username coinBalance');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ referrals: user.referrals });
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).json({ message: 'Error fetching referrals' });
    }
});

module.exports = router;

