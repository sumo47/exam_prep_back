const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/google
// @desc    Authenticate user with Google
// @access  Public
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find or create user
        let user = await User.findOne({ googleId });

        if (!user) {
            user = await User.create({
                googleId,
                email,
                name,
                picture,
            });
        } else {
            // Update user info in case it changed
            user.name = name;
            user.picture = picture;
            await user.save();
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        res.json({
            token,
            user: {
                id: user._id,
                googleId: user.googleId,
                email: user.email,
                name: user.name,
                picture: user.picture,
                bio: user.bio,
                location: user.location,
                education: user.education,
            },
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ message: 'Server error during authentication' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            id: req.user._id,
            googleId: req.user.googleId,
            email: req.user.email,
            name: req.user.name,
            picture: req.user.picture,
            bio: req.user.bio,
            location: req.user.location,
            education: req.user.education,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
