const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path according to your project structure
const redisClient = require('../cache'); // Import Redis client

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

router.post('/login', async (req, res) => {
    const { usernameEmail, password } = req.body;

    try {
        // Check Redis cache first
        const cachedUser = await redisClient.get(usernameEmail);
        if (cachedUser) {
            const user = JSON.parse(cachedUser);
            if (await bcrypt.compare(password, user.password)) {
                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                return res.status(200).json({ message: 'Login successful', token, username: user.username });
            } else {
                return res.status(400).json({ message: 'Invalid username/email or password' });
            }
        }

        // If not cached, proceed with database query
        const user = await User.findOne({ $or: [{ username: usernameEmail }, { email: usernameEmail }] });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid username/email or password' });
        }

        // Cache user data
        await redisClient.set(usernameEmail, JSON.stringify(user), 'EX', 60 * 60); // Cache for 1 hour

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token, username: user.username });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Error logging in user' });
    }
});

module.exports = router;
