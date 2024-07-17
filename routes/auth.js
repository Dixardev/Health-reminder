// auth.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust the path according to your project structure
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User registration endpoint
router.post('/register', async (req, res) => {
    const { fullName, username, email, password, referralUsername } = req.body;

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    try {
        const existingUser = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (existingEmail) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let referrer = null;
        if (referralUsername) {
            referrer = await User.findOne({ username: referralUsername });
        }

        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
            referralUsername,
            referredBy: referrer ? referrer._id : null,
            coinBalance: 50000 // Initial bonus for the referred friend
        });

        await newUser.save();

        if (referrer) {
            referrer.referrals.push(newUser._id);
            referrer.coinBalance += 50000; // Bonus for the referrer
            await referrer.save();
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});


// User login endpoint
router.post('/login', async (req, res) => {
    console.log('Login attempt:', req.body);

    const { usernameEmail, password } = req.body;

    try {
        const user = await User.findOne({ $or: [{ username: usernameEmail }, { email: usernameEmail }] });

        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log('Invalid password');
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('Login successful');
        res.status(200).json({ message: 'Login successful', token, username: user.username });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in user' });
    }
});

// Add this to auth.js or create a new file, e.g., referral.js

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
