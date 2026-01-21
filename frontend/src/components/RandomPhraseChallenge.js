import React, { useState, useEffect } from 'react';
import SignAvatar from './SignAvatar';
import { generateAnimationSequence } from '../utils/animationSystem';
import './RandomPhraseChallenge.css';

const challengePhrases = [
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

const RandomPhraseChallenge = () => {
  const [currentPhrase, setCurrentPhrase] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [animationSequence, setAnimationSequence] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const generateRandomPhrase = () => {
    const randomIndex = Math.floor(Math.random() * challengePhrases.length);
    const phrase = challengePhrases[randomIndex];
    setCurrentPhrase(phrase);
    setShowAnswer(false);
    
    // Generate animation sequence with variations (different each time)
    const animSequence = generateAnimationSequence(phrase, {
      tone: 'neutral',
      speed: 'normal'
    });
    
    setAnimationSequence(animSequence);
    setIsAnimating(true);
    
    // Stop animation after calculated duration
    setTimeout(() => {
      setIsAnimating(false);
    }, animSequence.totalDuration * 1000);
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextChallenge = () => {
    generateRandomPhrase();
    setScore(prev => prev + 1);
  };

  useEffect(() => {
    generateRandomPhrase();
  }, []);

  if (!currentPhrase) return null;

  return (
    <div className="random-challenge" role="region" aria-label="Random Phrase Challenge">
      <div className="challenge-header">
        <h2>Random Phrase Challenge</h2>
        <div className="challenge-score">
          <span>Score: {score}</span>
        </div>
      </div>
      
      <div className="challenge-content">
        <div className="challenge-avatar">
          <SignAvatar
            text={showAnswer ? currentPhrase : 'Watch the signing...'}
            animationSequence={animationSequence}
            isAnimating={isAnimating}
            tone="neutral"
            playbackSpeed="normal"
          />
        </div>
        
        <div className="challenge-actions">
          {!showAnswer ? (
            <button
              className="reveal-btn"
              onClick={handleRevealAnswer}
              aria-label="Reveal answer"
            >
              Reveal Answer
            </button>
          ) : (
            <div className="challenge-answer">
              <p className="answer-text">{currentPhrase}</p>
              <button
                className="next-btn"
                onClick={handleNextChallenge}
                aria-label="Next challenge"
              >
                Next Challenge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RandomPhraseChallenge;
