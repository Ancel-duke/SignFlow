import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useLocation } from 'react-router-dom';
import SignAvatar from '../components/SignAvatar';
import LoginModal from '../components/LoginModal';
import RandomPhraseChallenge from '../components/RandomPhraseChallenge';
import { generateAnimationSequence } from '../utils/animationSystem';
import { checkEasterEgg } from '../utils/easterEggs';
import axios from 'axios';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const { user, guestLogin } = useAuth();
  const { lastTranslation, isConnected } = useWebSocket();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [animationSequence, setAnimationSequence] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [recentTranslations, setRecentTranslations] = useState([]);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [tone, setTone] = useState('neutral'); // 'casual', 'formal', 'neutral'
  // eslint-disable-next-line no-unused-vars
  const [playbackSpeed, setPlaybackSpeed] = useState('normal'); // 'fast', 'slow', 'normal'
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState([]);
  const [easterEgg, setEasterEgg] = useState(null);

  // Handle WebSocket translation updates
  useEffect(() => {
    if (lastTranslation) {
      // Generate animation sequence for WebSocket translation
      const animSequence = generateAnimationSequence(lastTranslation.text, {
        tone,
        speed: playbackSpeed
      });
      
      setAnimationSequence(animSequence);
      setCurrentTranslation(lastTranslation);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), animSequence.totalDuration * 1000);
    }
  }, [lastTranslation, tone, playbackSpeed]);

  // Initialize as guest if not logged in
  useEffect(() => {
    if (!user) {
      guestLogin();
    }
  }, [user, guestLogin]);

  // Handle navigation state (from dashboard suggestions/timeline)
  useEffect(() => {
    if (location.state?.suggestedText) {
      setInputText(location.state.suggestedText);
      // Trigger translation after a brief delay
      setTimeout(() => {
        const text = location.state.suggestedText;
        const animSequence = generateAnimationSequence(text, { tone, speed: playbackSpeed });
        setAnimationSequence(animSequence);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), animSequence.totalDuration * 1000);
      }, 100);
    } else if (location.state?.previewTranslation) {
      handleUseRecent(location.state.previewTranslation);
    }
  }, [location.state]);

  // Real-time word-by-word animation
  useEffect(() => {
    if (!realTimeMode || !inputText.trim()) {
      setCurrentWordIndex(-1);
      setWords([]);
      return;
    }

    const textWords = inputText.trim().split(/\s+/).filter(w => w.length > 0);
    setWords(textWords);

    // Debounce: animate last word after user stops typing
    const timer = setTimeout(() => {
      if (textWords.length > 0) {
        const lastWord = textWords[textWords.length - 1];
        const wordIndex = textWords.length - 1;
        setCurrentWordIndex(wordIndex);
        
        // Check for easter egg
        const egg = checkEasterEgg(lastWord);
        if (egg) {
          setEasterEgg(egg);
        }

        // Generate animation for just this word
        const wordSequence = generateAnimationSequence(lastWord, {
          tone,
          speed: playbackSpeed
        });
        
        setAnimationSequence(wordSequence);
        setIsAnimating(true);
        
        setTimeout(() => {
          setIsAnimating(false);
          setCurrentWordIndex(-1);
        }, wordSequence.totalDuration * 1000);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [inputText, realTimeMode, tone, playbackSpeed]);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const text = inputText.trim();
      
      // Generate enhanced animation sequence with variations
      const animSequence = generateAnimationSequence(text, {
        tone,
        speed: playbackSpeed
      });
      
      setAnimationSequence(animSequence);

      const response = await axios.post(`${API_URL}/translations`, {
        text,
        tone,
        playbackSpeed
      });

      const translation = response.data.translation;
      setCurrentTranslation(translation);
      setIsAnimating(true);
      
      // Stop animation after calculated duration
      setTimeout(() => {
        setIsAnimating(false);
      }, animSequence.totalDuration * 1000);

      // Add to recent translations
      setRecentTranslations(prev => [translation, ...prev].slice(0, 5));
      setInputText('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create translation');
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const handleUseRecent = (translation) => {
    setInputText(translation.text);
    
    // Generate new animation sequence (will be different each time)
    const animSequence = generateAnimationSequence(translation.text, {
      tone,
      speed: playbackSpeed
    });
    
    setAnimationSequence(animSequence);
    setCurrentTranslation(translation);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), animSequence.totalDuration * 1000);
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">SignFlow</h1>
        <p className="home-subtitle">
          Immersive text-to-sign language translation
        </p>
        {!user?.email && (
          <button
            className="login-prompt-btn"
            onClick={() => setShowLoginModal(true)}
            aria-label="Sign in to save your translations"
          >
            Sign in to save your translations
          </button>
        )}
      </div>

      <div className="translation-section">
        <div className="translation-input-container">
          <div className="input-wrapper">
            <label htmlFor="translation-input" className="sr-only">
              Enter text to translate
            </label>
            <div className="input-with-highlight">
              <textarea
                id="translation-input"
                className="translation-input"
                placeholder="Type your text here to see it translated into sign language..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                rows="3"
                aria-label="Text input for translation"
              />
              {realTimeMode && words.length > 0 && (
                <div className="word-highlights">
                  {words.map((word, index) => (
                    <span
                      key={index}
                      className={`word-highlight ${index === currentWordIndex ? 'active' : ''}`}
                      style={{
                        left: `${(index / words.length) * 100}%`,
                        width: `${(1 / words.length) * 100}%`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="realtime-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={realTimeMode}
                  onChange={(e) => setRealTimeMode(e.target.checked)}
                  aria-label="Enable real-time translation"
                />
                <span>Real-time mode (animate as you type)</span>
              </label>
            </div>
            <div className="input-actions">
              <span className="char-count" aria-live="polite">
                {inputText.length}/500
              </span>
              <button
                className="translate-btn"
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
                aria-label="Translate text"
              >
                {isLoading ? 'Translating...' : 'Translate'}
              </button>
            </div>
          </div>
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="avatar-section">
          <div className="animation-controls">
            <div className="control-group">
              <label htmlFor="tone-select">Tone:</label>
              <select
                id="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="control-select"
                aria-label="Select animation tone"
              >
                <option value="neutral">Neutral</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
              </select>
            </div>
            <div className="control-group">
              <label htmlFor="speed-select">Speed:</label>
              <select
                id="speed-select"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(e.target.value)}
                className="control-select"
                aria-label="Select animation speed"
              >
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
                <option value="slow">Slow</option>
              </select>
            </div>
          </div>
          <SignAvatar
            text={currentTranslation?.text || inputText || 'Ready to translate'}
            animationSequence={animationSequence}
            isAnimating={isAnimating}
            speed={user?.preferences?.avatarSpeed || 1.0}
            tone={tone}
            playbackSpeed={playbackSpeed}
            currentWord={currentWordIndex >= 0 ? words[currentWordIndex] : null}
          />
          {easterEgg && (
            <div className="easter-egg-notification">
              🎉 {easterEgg.description}!
            </div>
          )}
          {isConnected && (
            <div className="ws-status" aria-label="WebSocket connection status">
              <span className="ws-indicator"></span>
              Real-time updates active
            </div>
          )}
        </div>
      </div>

      {/* Random Phrase Challenge */}
      <RandomPhraseChallenge />

      {/* Recent Translations */}
      {recentTranslations.length > 0 && (
        <div className="recent-translations">
          <h2>Recent Translations</h2>
          <div className="recent-list">
            {recentTranslations.map((translation, index) => (
              <button
                key={index}
                className="recent-item"
                onClick={() => handleUseRecent(translation)}
                aria-label={`Use phrase: ${translation.text}`}
              >
                {translation.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default Home;
