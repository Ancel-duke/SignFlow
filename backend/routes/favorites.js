const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Favorite = require('../models/Favorite');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// @route   POST /api/favorites
// @desc    Add a phrase to favorites
// @access  Private
router.post('/', authenticate, [
  body('text').trim().notEmpty().withMessage('Text is required'),
  body('category').optional().isIn(['common', 'greetings', 'questions', 'emergency', 'custom']),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, category, tags } = req.body;
    const translationId = uuidv4();

    // Check if favorite already exists
    const existingFavorite = await Favorite.findOne({
      userId: req.user._id,
      text: text.trim()
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'This phrase is already in your favorites' });
    }

    const favorite = new Favorite({
      userId: req.user._id,
      text: text.trim(),
      translationId,
      category: category || 'custom',
      tags: tags || []
    });

    await favorite.save();

    res.status(201).json({
      message: 'Favorite added successfully',
      favorite
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This phrase is already in your favorites' });
    }
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Server error adding favorite' });
  }
});

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { userId: req.user._id };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const favorites = await Favorite.find(query)
      .sort({ createdAt: -1 });

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Server error fetching favorites' });
  }
});

// @route   GET /api/favorites/:id
// @desc    Get a specific favorite
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ favorite });
  } catch (error) {
    console.error('Get favorite error:', error);
    res.status(500).json({ error: 'Server error fetching favorite' });
  }
});

// @route   PUT /api/favorites/:id
// @desc    Update a favorite
// @access  Private
router.put('/:id', authenticate, [
  body('category').optional().isIn(['common', 'greetings', 'questions', 'emergency', 'custom']),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, tags } = req.body;
    const updateData = {};

    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;

    const favorite = await Favorite.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updateData },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({
      message: 'Favorite updated successfully',
      favorite
    });
  } catch (error) {
    console.error('Update favorite error:', error);
    res.status(500).json({ error: 'Server error updating favorite' });
  }
});

// @route   DELETE /api/favorites/:id
// @desc    Delete a favorite
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Favorite deleted successfully' });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({ error: 'Server error deleting favorite' });
  }
});

// @route   POST /api/favorites/:id/use
// @desc    Increment usage count for a favorite
// @access  Private
router.post('/:id/use', authenticate, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Usage count updated', favorite });
  } catch (error) {
    console.error('Update usage error:', error);
    res.status(500).json({ error: 'Server error updating usage' });
  }
});

module.exports = router;
