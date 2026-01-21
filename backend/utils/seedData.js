const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Translation = require('../models/Translation');
const Favorite = require('../models/Favorite');
const Analytics = require('../models/Analytics');
const { v4: uuidv4 } = require('uuid');

// Sample phrases for seeding
const samplePhrases = [
  'Hello, how are you?',
  'Thank you very much',
  'Please help me',
  'Where is the bathroom?',
  'I need water',
  'Good morning',
  'Nice to meet you',
  'What is your name?',
  'I am learning sign language',
  'Can you repeat that?',
  'I understand',
  'I do not understand',
  'Goodbye',
  'See you later',
  'Have a nice day',
  'Emergency',
  'Call 911',
  'I am lost',
  'I need help',
  'Excuse me'
];

const categories = ['common', 'greetings', 'questions', 'emergency', 'custom'];

// Generate animation sequence helper
const generateAnimationSequence = (text) => {
  const words = text.toLowerCase().split(' ');
  return words.map(word => {
    const clipMap = {
      'hello': 'greet_hello',
      'hi': 'greet_hi',
      'thank': 'express_thanks',
      'you': 'point_you',
      'please': 'request_please',
      'yes': 'confirm_yes',
      'no': 'deny_no',
      'help': 'request_help',
      'water': 'noun_water',
      'food': 'noun_food',
      'bathroom': 'noun_bathroom',
      'goodbye': 'greet_goodbye',
      'how': 'question_how',
      'what': 'question_what',
      'where': 'question_where',
      'when': 'question_when',
      'why': 'question_why'
    };
    
    for (const [key, value] of Object.entries(clipMap)) {
      if (word.includes(key)) {
        return value;
      }
    }
    return 'sign_default';
  });
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/signflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Translation.deleteMany({});
    await Favorite.deleteMany({});
    await Analytics.deleteMany({});

    // Create test users
    console.log('👤 Creating test users...');
    const users = [];
    
    for (let i = 1; i <= 3; i++) {
      const user = new User({
        username: `testuser${i}`,
        email: `test${i}@signflow.com`,
        password: 'password123',
        preferences: {
          highContrast: i === 2,
          fontSize: i === 3 ? 'large' : 'medium',
          avatarSpeed: 1.0
        }
      });
      await user.save();
      users.push(user);
      console.log(`   Created user: ${user.username}`);
    }

    // Create translations for each user
    console.log('📝 Creating translations...');
    for (const user of users) {
      const numTranslations = Math.floor(Math.random() * 15) + 10;
      
      for (let i = 0; i < numTranslations; i++) {
        const text = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
        const translation = new Translation({
          userId: user._id,
          text,
          translationId: uuidv4(),
          duration: Math.max(2, text.split(' ').length * 1.0 + 0.5),
          animationSequence: generateAnimationSequence(text),
          status: 'completed',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
        });
        await translation.save();
      }
      console.log(`   Created ${numTranslations} translations for ${user.username}`);
    }

    // Create favorites
    console.log('⭐ Creating favorites...');
    for (const user of users) {
      const numFavorites = Math.floor(Math.random() * 8) + 5;
      const usedPhrases = new Set();
      
      for (let i = 0; i < numFavorites; i++) {
        let text;
        do {
          text = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
        } while (usedPhrases.has(text));
        usedPhrases.add(text);

        const favorite = new Favorite({
          userId: user._id,
          text,
          translationId: uuidv4(),
          category: categories[Math.floor(Math.random() * categories.length)],
          tags: [],
          usageCount: Math.floor(Math.random() * 10),
          createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
        });
        await favorite.save();
      }
      console.log(`   Created ${numFavorites} favorites for ${user.username}`);
    }

    // Create analytics
    console.log('📊 Creating analytics...');
    for (const user of users) {
      const numDays = 30;
      
      for (let i = 0; i < numDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const translationsCount = Math.floor(Math.random() * 10);
        const sessionDuration = Math.floor(Math.random() * 60) + 5;

        const analytics = new Analytics({
          userId: user._id,
          date,
          translationsCount,
          favoritesCount: Math.floor(Math.random() * 3),
          sessionDuration,
          mostUsedPhrases: samplePhrases
            .slice(0, 5)
            .map(phrase => ({
              text: phrase,
              count: Math.floor(Math.random() * 5) + 1
            })),
          deviceType: ['desktop', 'tablet', 'mobile'][Math.floor(Math.random() * 3)]
        });
        await analytics.save();
      }
      console.log(`   Created ${numDays} days of analytics for ${user.username}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Test Users:');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - Password: password123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
