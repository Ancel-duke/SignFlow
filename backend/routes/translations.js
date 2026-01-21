const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const Translation = require('../models/Translation');
const Analytics = require('../models/Analytics');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Helper function to generate animation sequence from text with variations
const generateAnimationSequence = (text, options = {}) => {
  const { tone = 'neutral', playbackSpeed = 'normal' } = options;
  const seed = Math.random() * 1000000;
  
  // Common phrases that should use special phrase-level animations
  const phrasePatterns = [
    { pattern: /how are you/i, animation: 'phrase_how_are_you', duration: 2.5 },
    { pattern: /thank you/i, animation: 'phrase_thank_you', duration: 1.8 },
    { pattern: /you're welcome/i, animation: 'phrase_welcome', duration: 2.0 },
    { pattern: /nice to meet you/i, animation: 'phrase_nice_to_meet', duration: 2.5 },
    { pattern: /good morning/i, animation: 'phrase_good_morning', duration: 2.0 },
    { pattern: /good afternoon/i, animation: 'phrase_good_afternoon', duration: 2.2 },
    { pattern: /good evening/i, animation: 'phrase_good_evening', duration: 2.2 },
    { pattern: /good night/i, animation: 'phrase_good_night', duration: 2.0 },
    { pattern: /see you later/i, animation: 'phrase_see_you_later', duration: 2.0 },
    { pattern: /have a nice day/i, animation: 'phrase_nice_day', duration: 2.5 },
    { pattern: /i love you/i, animation: 'phrase_i_love_you', duration: 2.0 },
    { pattern: /i'm sorry/i, animation: 'phrase_sorry', duration: 2.0 },
    { pattern: /excuse me/i, animation: 'phrase_excuse_me', duration: 1.8 },
    { pattern: /where is/i, animation: 'phrase_where_is', duration: 2.0 },
    { pattern: /what is/i, animation: 'phrase_what_is', duration: 2.0 },
    { pattern: /can you/i, animation: 'phrase_can_you', duration: 2.0 },
    { pattern: /i need/i, animation: 'phrase_i_need', duration: 1.8 },
    { pattern: /i want/i, animation: 'phrase_i_want', duration: 1.8 },
    { pattern: /please help/i, animation: 'phrase_please_help', duration: 2.0 },
    { pattern: /call 911/i, animation: 'phrase_emergency', duration: 2.5 }
  ];

  // Animation pools for individual words (multiple variations)
  const wordPools = {
    'hello': ['greet_hello_v1', 'greet_hello_v2', 'greet_hello_v3'],
    'hi': ['greet_hi_v1', 'greet_hi_v2'],
    'thank': ['express_thanks_v1', 'express_thanks_v2', 'express_thanks_v3'],
    'you': ['point_you_v1', 'point_you_v2'],
    'please': ['request_please_v1', 'request_please_v2'],
    'yes': ['confirm_yes_v1', 'confirm_yes_v2', 'confirm_yes_v3'],
    'no': ['deny_no_v1', 'deny_no_v2'],
    'help': ['request_help_v1', 'request_help_v2'],
    'water': ['noun_water_v1', 'noun_water_v2'],
    'food': ['noun_food_v1', 'noun_food_v2'],
    'bathroom': ['noun_bathroom_v1', 'noun_bathroom_v2'],
    'goodbye': ['greet_goodbye_v1', 'greet_goodbye_v2'],
    'how': ['question_how_v1', 'question_how_v2'],
    'what': ['question_what_v1', 'question_what_v2'],
    'where': ['question_where_v1', 'question_where_v2'],
    'when': ['question_when_v1', 'question_when_v2'],
    'why': ['question_why_v1', 'question_why_v2'],
    'default': ['sign_default_v1', 'sign_default_v2', 'sign_default_v3', 'sign_default_v4']
  };

  const getAnimationVariation = (word, wordSeed) => {
    const normalizedWord = word.toLowerCase().replace(/[.,!?]/g, '');
    const pool = wordPools[normalizedWord] || wordPools['default'];
    const index = Math.floor((wordSeed + normalizedWord.charCodeAt(0)) % pool.length);
    return pool[index];
  };

  // Check for phrase patterns first
  let remaining = text;
  const animations = [];
  let foundPhrase = false;

  for (const phrasePattern of phrasePatterns) {
    const match = remaining.match(phrasePattern.pattern);
    if (match) {
      const matchText = match[0];
      const index = remaining.indexOf(matchText);
      
      // Add words before phrase
      if (index > 0) {
        const before = remaining.substring(0, index).trim();
        if (before) {
          const words = before.split(/\s+/);
          words.forEach((word, wordIndex) => {
            const wordSeed = seed + wordIndex;
            animations.push(getAnimationVariation(word, wordSeed));
          });
        }
      }
      
      // Add phrase animation
      animations.push(phrasePattern.animation);
      foundPhrase = true;
      
      remaining = remaining.substring(index + matchText.length).trim();
      break;
    }
  }

  // If no phrase found or remaining text, process as words
  if (!foundPhrase || remaining) {
    const words = (foundPhrase ? remaining : text).toLowerCase().split(/\s+/).filter(w => w.length > 0);
    words.forEach((word, wordIndex) => {
      const wordSeed = seed + (foundPhrase ? 100 : 0) + wordIndex;
      animations.push(getAnimationVariation(word, wordSeed));
    });
  }
  
  return animations.length > 0 ? animations : ['sign_default_v1'];
};

// @route   POST /api/translations
// @desc    Create a new translation
// @access  Private/Public (optional auth)
router.post('/', optionalAuth, [
  body('text').trim().notEmpty().withMessage('Text is required').isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, tone = 'neutral', playbackSpeed = 'normal' } = req.body;
    const userId = req.user ? req.user._id : null;
    
    // Generate translation ID
    const translationId = uuidv4();
    
    // Generate animation sequence with variations
    const animationSequence = generateAnimationSequence(text, { tone, playbackSpeed });
    
    // Calculate duration based on sequence length and speed modifier
    const speedMultiplier = playbackSpeed === 'fast' ? 0.8 : playbackSpeed === 'slow' ? 1.2 : 1.0;
    const baseDuration = animationSequence.length * 0.8; // Average 0.8s per animation
    const duration = Math.max(2, baseDuration * speedMultiplier);

    // Create translation
    const translation = new Translation({
      userId,
      text,
      translationId,
      duration,
      animationSequence,
      status: 'completed'
    });

    await translation.save();

    // Update analytics if user is authenticated
    if (userId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await Analytics.findOneAndUpdate(
        { userId, date: today },
        {
          $inc: { translationsCount: 1 },
          $push: {
            mostUsedPhrases: {
              $each: [{ text, count: 1 }],
              $slice: 10
            }
          }
        },
        { upsert: true, new: true }
      );
    }

    // Broadcast to WebSocket clients
    if (req.app.locals.broadcastTranslation) {
      req.app.locals.broadcastTranslation({
        translationId,
        text,
        animationSequence,
        duration,
        userId: userId ? userId.toString() : 'guest'
      });
    }

    res.status(201).json({
      message: 'Translation created successfully',
      translation: {
        id: translation._id,
        translationId,
        text,
        duration,
        animationSequence,
        status: translation.status,
        createdAt: translation.createdAt
      }
    });
  } catch (error) {
    console.error('Create translation error:', error);
    res.status(500).json({ error: 'Server error creating translation' });
  }
});

// @route   GET /api/translations
// @desc    Get user's translation history
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const translations = await Translation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Translation.countDocuments({ userId: req.user._id });

    res.json({
      translations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({ error: 'Server error fetching translations' });
  }
});

// @route   GET /api/translations/:id
// @desc    Get a specific translation
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const translation = await Translation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!translation) {
      return res.status(404).json({ error: 'Translation not found' });
    }

    res.json({ translation });
  } catch (error) {
    console.error('Get translation error:', error);
    res.status(500).json({ error: 'Server error fetching translation' });
  }
});

// @route   DELETE /api/translations/:id
// @desc    Delete a translation
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const translation = await Translation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!translation) {
      return res.status(404).json({ error: 'Translation not found' });
    }

    res.json({ message: 'Translation deleted successfully' });
  } catch (error) {
    console.error('Delete translation error:', error);
    res.status(500).json({ error: 'Server error deleting translation' });
  }
});

module.exports = router;
