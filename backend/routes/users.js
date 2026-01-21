const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
  body('username').optional().trim().isLength({ min: 3 }),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, preferences } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (preferences) {
      updateData.preferences = {
        ...req.user.preferences,
        ...preferences
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const Translation = require('../models/Translation');
    const Favorite = require('../models/Favorite');
    const Analytics = require('../models/Analytics');

    const [translationsCount, favoritesCount, recentAnalytics] = await Promise.all([
      Translation.countDocuments({ userId: req.user._id }),
      Favorite.countDocuments({ userId: req.user._id }),
      Analytics.find({ userId: req.user._id })
        .sort({ date: -1 })
        .limit(30)
    ]);

    const totalSessionTime = recentAnalytics.reduce((sum, a) => sum + (a.sessionDuration || 0), 0);

    res.json({
      translationsCount,
      favoritesCount,
      totalSessionTime,
      recentActivity: recentAnalytics
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

module.exports = router;
