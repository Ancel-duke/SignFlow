const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  text: {
    type: String,
    required: [true, 'Text is required'],
    trim: true,
    maxlength: [500, 'Text cannot exceed 500 characters']
  },
  translationId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['common', 'greetings', 'questions', 'emergency', 'custom'],
    default: 'custom'
  },
  tags: {
    type: [String],
    default: []
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
favoriteSchema.index({ userId: 1, createdAt: -1 });
favoriteSchema.index({ userId: 1, category: 1 });
favoriteSchema.index({ text: 'text' }); // Text search index

// Prevent duplicate favorites
favoriteSchema.index({ userId: 1, text: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
