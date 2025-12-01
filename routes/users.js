const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-googleId');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            bio: user.bio,
            location: user.location,
            education: user.education,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if user is updating their own profile
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        const { name, bio, location, education, picture } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, bio, location, education, picture },
            { new: true, runValidators: true }
        ).select('-googleId');

        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            bio: user.bio,
            location: user.location,
            education: user.education,
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
