# SignFlow 🌟

<div align="center">

![SignFlow Logo](https://img.shields.io/badge/SignFlow-Assistive%20Tech-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)

**A professional, immersive text-to-sign language translation platform**

*Inspired by assistive technology platforms like Signvrse*

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack) • [Demo](#-demo)

</div>

---

## 📖 Overview

SignFlow is a full-stack web application that provides real-time text-to-sign language translation with an interactive 3D avatar. Built with modern web technologies, it offers an immersive experience for learning and using sign language, complete with analytics, user profiles, and AI-powered suggestions.

### 🎯 Key Highlights

- **Real-Time Translation**: Word-by-word animation as you type (no submit button needed!)
- **3D Avatar with Micro-Expressions**: Eye blinks, head nods, and natural body movements
- **Advanced Animation System**: Varied animations ensure repeated phrases look different each time
- **Interactive Dashboard**: Timeline with hover previews and AI-powered suggestions
- **Full Accessibility**: High contrast mode, font size controls, and complete ARIA support
- **Easter Eggs**: Discover special animations with fun phrases!

---

## ✨ Features

### 🎬 Core Functionality

#### Real-Time Translation
- **Live Typing Mode**: Animations trigger as you type (500ms debounce)
- **Word Highlighting**: Visual indicator shows which word is currently being signed
- **No Submit Required**: Real-time mode eliminates need for submit button
- **Multi-User Support**: WebSocket broadcasting for simultaneous multi-user experiences

#### 3D Avatar System
- **Micro-Expressions**: 
  - Natural eye blinks every 3-5 seconds
  - Subtle head nods during signing
  - Body shifts when idle
  - Dynamic facial expressions
- **Interactive Hover Effects**: 
  - Info tooltips explaining gestures
  - Hand highlighting on hover
  - Smooth animation transitions
- **Varied Animations**: 
  - Multiple animation variations per word
  - Seed-based selection for natural differences
  - Phrase-level animations for common phrases
  - Tone and speed modifiers (casual, formal, fast, slow)

#### Advanced Animation System
- **Phrase Detection**: Recognizes common phrases like "How are you?" and uses special animations
- **Animation Pools**: Each word has multiple variations (v1, v2, v3, etc.)
- **Dynamic Parameters**: Speed, position, and expression variations per animation
- **Easter Eggs**: Special animations for fun phrases (try "hello world", "I love you", or "dance"!)

### 👤 User Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Guest Mode**: Try the platform without creating an account
- **Translation History**: View and manage all past translations
- **Favorite Phrases**: Save frequently used phrases for quick access
- **Interactive Timeline**: Hover over past translations to preview animations
- **AI-Powered Suggestions**: Personalized phrase recommendations based on usage patterns
- **Random Phrase Challenge**: Interactive learning feature with random phrases
- **Analytics Dashboard**: Comprehensive charts and statistics

### 🎨 UI/UX Features

- **Split-Screen Layout**: Text input on one side, 3D avatar on the other
- **Animated Background**: Subtle gradient animation responsive to activity
- **Glow Effects**: Avatar container glows during animations
- **Smooth Transitions**: All UI elements have polished transitions
- **Professional Design**: Neutral color palette (soft grays, muted blues)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### ♿ Accessibility Features

- **High Contrast Mode**: Toggle for better visibility
- **Font Size Controls**: Small, medium, and large options
- **ARIA Labels**: Complete screen reader support
- **Keyboard Navigation**: Fully accessible keyboard controls
- **Focus Indicators**: Clear visual focus states
- **WCAG Compliant**: Meets accessibility standards

### 📊 Analytics & Insights

- **Translation Activity Charts**: Line charts showing activity over time
- **Session Duration Tracking**: Bar charts for session analytics
- **Most Used Phrases**: Pie charts with phrase breakdowns
- **Interactive Timeline**: Click to preview past translations
- **AI Suggestions**: Contextual recommendations based on patterns

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Ancel-duke/SignFlow.git
cd SignFlow
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/signflow?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

(Optional) Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

Start the frontend development server:

```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

#### 4. Seed Database (Optional)

To populate the database with test data:

```bash
cd backend
npm run seed
```

This creates 3 test users:
- **testuser1** / test1@signflow.com / password123
- **testuser2** / test2@signflow.com / password123
- **testuser3** / test3@signflow.com / password123

---

## 📚 Documentation

### API Endpoints

#### Authentication

```
POST   /api/auth/register    - Register a new user
POST   /api/auth/login       - Login user
POST   /api/auth/guest       - Create guest session
```

#### Translations

```
POST   /api/translations           - Create a new translation
GET    /api/translations           - Get user's translation history
GET    /api/translations/:id       - Get a specific translation
DELETE /api/translations/:id       - Delete a translation
```

#### Favorites

```
POST   /api/favorites              - Add a phrase to favorites
GET    /api/favorites              - Get user's favorites
GET    /api/favorites/:id          - Get a specific favorite
PUT    /api/favorites/:id          - Update a favorite
DELETE /api/favorites/:id         - Delete a favorite
POST   /api/favorites/:id/use     - Increment usage count
```

#### Analytics

```
GET    /api/analytics/dashboard   - Get dashboard statistics
GET    /api/analytics             - Get analytics data
POST   /api/analytics/session     - Record session data
```

#### Users

```
GET    /api/users/profile         - Get user profile
PUT    /api/users/profile         - Update user profile
GET    /api/users/stats           - Get user statistics
```

### WebSocket Events

The application uses WebSocket for real-time communication:

- **Connection**: `ws://localhost:5000?userId=<userId>`
- **Translation Update**: Broadcasts to all connected clients when a translation is created
- **Message Format**:
  ```json
  {
    "type": "translation_update",
    "data": {
      "translationId": "uuid",
      "text": "Hello world",
      "animationSequence": ["greet_hello_v1", "sign_default_v2"],
      "duration": 2.5,
      "userId": "user_id"
    }
  }
  ```

### Database Schema

#### Users Collection
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  preferences: {
    highContrast: Boolean,
    fontSize: String,
    avatarSpeed: Number
  },
  createdAt: Date,
  lastLogin: Date
}
```

#### Translations Collection
```javascript
{
  userId: ObjectId (ref: User),
  text: String (required, max 500 chars),
  translationId: String (unique),
  duration: Number,
  animationSequence: [String],
  status: String (enum: pending, processing, completed, failed),
  createdAt: Date
}
```

#### Favorites Collection
```javascript
{
  userId: ObjectId (ref: User),
  text: String (required, max 500 chars),
  translationId: String,
  category: String (enum: common, greetings, questions, emergency, custom),
  tags: [String],
  usageCount: Number,
  createdAt: Date
}
```

#### Analytics Collection
```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  translationsCount: Number,
  favoritesCount: Number,
  sessionDuration: Number (minutes),
  mostUsedPhrases: [{
    text: String,
    count: Number
  }],
  deviceType: String (enum: desktop, tablet, mobile)
}
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI library
- **React Router 6** - Client-side routing
- **React Three Fiber** - 3D graphics and animations
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Framer Motion** - Animation library
- **WebSocket API** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express 4.18** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose 8.0** - ODM for MongoDB
- **WebSocket (ws)** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Development Tools
- **Nodemon** - Development server auto-reload
- **dotenv** - Environment variable management

---

## 🎮 Usage Guide

### Basic Translation

1. **Type in the input box** - Start typing your text
2. **Enable Real-Time Mode** - Toggle "Real-time mode" for word-by-word animation
3. **Watch the Avatar** - See the 3D avatar sign your text in real-time
4. **Adjust Settings** - Use tone and speed controls for different animation styles

### Using Favorites

1. **Save a Phrase** - After translating, add it to favorites
2. **Access Favorites** - Go to Profile page to see all favorites
3. **Quick Use** - Click on a favorite to translate it instantly

### Dashboard Analytics

1. **View Statistics** - See total translations, favorites, and session time
2. **Explore Charts** - Interactive charts show your activity patterns
3. **Timeline** - Hover over timeline items to preview past translations
4. **AI Suggestions** - Get personalized phrase recommendations

### Easter Eggs

Try these phrases for special animations:
- "Hello World" or "Hi there" → Friendly wave
- "I love you" or "Love" → Heart gesture
- "Dance" or "Party" → Celebration dance
- "Thank you so much" → Extra grateful gesture
- "Amazing" or "Awesome" → Excited reaction
- "Good night" → Sleepy gesture

---

## 🏗️ Project Structure

```
SignFlow/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Translation.js       # Translation schema
│   │   ├── Favorite.js          # Favorite schema
│   │   └── Analytics.js         # Analytics schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User routes
│   │   ├── translations.js     # Translation routes
│   │   ├── favorites.js         # Favorite routes
│   │   └── analytics.js        # Analytics routes
│   ├── utils/
│   │   └── seedData.js          # Database seeding
│   ├── server.js                # Express server & WebSocket
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navigation
│   │   │   ├── SignAvatar.js    # 3D avatar component
│   │   │   ├── LoginModal.js   # Auth modal
│   │   │   ├── RandomPhraseChallenge.js
│   │   │   ├── TranslationTimeline.js
│   │   │   └── AISuggestions.js
│   │   ├── context/
│   │   │   ├── AuthContext.js   # Auth state
│   │   │   ├── AccessibilityContext.js
│   │   │   └── WebSocketContext.js
│   │   ├── pages/
│   │   │   ├── Home.js          # Main translation page
│   │   │   ├── Dashboard.js    # Analytics dashboard
│   │   │   └── Profile.js      # User profile
│   │   ├── utils/
│   │   │   ├── animationSystem.js  # Animation logic
│   │   │   └── easterEggs.js      # Easter egg detection
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── README.md                    # This file
└── .gitignore
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=your-mongodb-atlas-connection-string
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-min-32-chars
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `backend/.env`

---

## 🧪 Testing

### Test Users (from seed data)

After running `npm run seed` in the backend directory:

- **Username**: testuser1, **Email**: test1@signflow.com, **Password**: password123
- **Username**: testuser2, **Email**: test2@signflow.com, **Password**: password123
- **Username**: testuser3, **Email**: test3@signflow.com, **Password**: password123

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Guest mode functionality
- [ ] Real-time translation typing
- [ ] Avatar animations and micro-expressions
- [ ] Favorite phrases management
- [ ] Dashboard analytics
- [ ] Timeline interactions
- [ ] AI suggestions
- [ ] Accessibility features
- [ ] Easter egg phrases
- [ ] WebSocket real-time updates

---

## 🚀 Deployment

### Backend Deployment

1. Set environment variables on your hosting platform (Heroku, Railway, Render, etc.)
2. Ensure MongoDB Atlas allows connections from your server IP
3. Update `CORS_ORIGIN` to your frontend URL
4. Deploy using your platform's Node.js buildpack

### Frontend Deployment

1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to your hosting service (Vercel, Netlify, etc.)
3. Update API URLs in environment variables

### Recommended Platforms

- **Backend**: Railway, Render, Heroku, or AWS
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Database**: MongoDB Atlas (already cloud-hosted)

---

## 🤝 Contributing

Contributions are welcome! This is a portfolio project, but suggestions and improvements are appreciated.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Inspired by assistive technology platforms like Signvrse
- Built with modern web technologies for accessibility and performance
- Designed with user experience and accessibility as top priorities

---

## 📧 Contact & Support

- **GitHub**: [@Ancel-duke](https://github.com/Ancel-duke)
- **Repository**: [SignFlow](https://github.com/Ancel-duke/SignFlow)
- **Issues**: [GitHub Issues](https://github.com/Ancel-duke/SignFlow/issues)

---

## 🎯 Future Enhancements

Potential features for future development:

- [ ] Voice input support
- [ ] Video recording of translations
- [ ] Multiple avatar options
- [ ] Sign language learning modules
- [ ] Community features and sharing
- [ ] Mobile app version
- [ ] Advanced AI for gesture recognition
- [ ] Multi-language support

---

<div align="center">

**Built with ❤️ for accessibility and assistive technology**

⭐ Star this repo if you find it helpful!

</div>
