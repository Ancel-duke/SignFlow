const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  text: {
    type: String,
    required: [true, 'Text to translate is required'],
    trim: true,
    maxlength: [500, 'Text cannot exceed 500 characters']
  },
  translationId: {
    type: String,
    unique: true,
    required: true
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  animationSequence: {
    type: [String], // Array of animation clip names
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for optimized queries
translationSchema.index({ userId: 1, createdAt: -1 });
translationSchema.index({ createdAt: -1 });
translationSchema.index({ status: 1 });

// Virtual for formatted date
translationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

module.exports = mongoose.model('Translation', translationSchema);
