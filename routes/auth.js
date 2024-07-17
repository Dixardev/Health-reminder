const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redisClient = require('../redisClient'); // Import Redis client
const User = require('../models/User');

// User registration endpoint
router.post('/register', async (req, res) => {
    const { fullName, username, email, password, referralUsername } = req.body;

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
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
            referralUsername
        });

        await newUser.save();

        if (referralUsername) {
            const referrer = await User.findOne({ username: referralUsername });
            if (referrer) {
                referrer.referrals.push(newUser._id);
                await referrer.save();
                await updateReferralBonuses(referrer, 1); // Ensure you implement this function
            }
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// User login endpoint
router.post('/login', async (req, res) => {
    const { usernameEmail, password } = req.body;

    try {
        const user = await User.findOne({ $or: [{ username: usernameEmail }, { email: usernameEmail }] });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Store token in Redis
        await redisClient.set(`auth_${token}`, JSON.stringify(user), 'EX', 3600);

        res.status(200).json({ message: 'Login successful', token, username: user.username });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in user' });
    }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        try {
            // Check token in Redis
            const userData = await redisClient.get(`auth_${token}`);

            if (!userData) {
                return res.status(401).json({ message: 'Session expired. Please log in again.' });
            }

            req.user = JSON.parse(userData);
            next();
        } catch (error) {
            console.error('Redis error:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    });
};

module.exports = router;
