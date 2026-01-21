const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  translationsCount: {
    type: Number,
    default: 0
  },
  favoritesCount: {
    type: Number,
    default: 0
  },
  sessionDuration: {
    type: Number, // Duration in minutes
    default: 0
  },
  mostUsedPhrases: {
    type: [{
      text: String,
      count: Number
    }],
    default: []
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'tablet', 'mobile'],
    default: 'desktop'
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
analyticsSchema.index({ userId: 1, date: -1 });
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ userId: 1, createdAt: -1 });

// Compound index for user analytics over time
analyticsSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
