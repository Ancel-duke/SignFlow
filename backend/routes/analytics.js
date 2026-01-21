const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const Translation = require('../models/Translation');
const Favorite = require('../models/Favorite');

// @route   GET /api/analytics
// @desc    Get user analytics
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const analytics = await Analytics.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calculate totals
    const totals = {
      translations: analytics.reduce((sum, a) => sum + (a.translationsCount || 0), 0),
      favorites: analytics.reduce((sum, a) => sum + (a.favoritesCount || 0), 0),
      sessionTime: analytics.reduce((sum, a) => sum + (a.sessionDuration || 0), 0)
    };

    res.json({
      analytics,
      totals,
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
});

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const [totalTranslations, totalFavorites, recentTranslations, topPhrases] = await Promise.all([
      Translation.countDocuments({ userId: req.user._id }),
      Favorite.countDocuments({ userId: req.user._id }),
      Translation.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(10),
      Analytics.aggregate([
        { $match: { userId: req.user._id } },
        { $unwind: '$mostUsedPhrases' },
        { $group: {
          _id: '$mostUsedPhrases.text',
          count: { $sum: '$mostUsedPhrases.count' }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Get last 30 days activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Analytics.find({
      userId: req.user._id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    res.json({
      totalTranslations,
      totalFavorites,
      recentTranslations,
      topPhrases,
      recentActivity
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
});

// @route   POST /api/analytics/session
// @desc    Record session data
// @access  Private
router.post('/session', authenticate, [
  require('express-validator').body('duration').isNumeric(),
  require('express-validator').body('deviceType').optional().isIn(['desktop', 'tablet', 'mobile'])
], async (req, res) => {
  try {
    const { duration, deviceType } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.findOneAndUpdate(
      { userId: req.user._id, date: today },
      {
        $inc: { sessionDuration: duration || 0 },
        $set: { deviceType: deviceType || 'desktop' }
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Session data recorded' });
  } catch (error) {
    console.error('Record session error:', error);
    res.status(500).json({ error: 'Server error recording session' });
  }
});

module.exports = router;
