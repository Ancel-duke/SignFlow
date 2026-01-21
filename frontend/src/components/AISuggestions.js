import React, { useState, useEffect } from 'react';
import './AISuggestions.css';

const COMMON_PHRASES = [
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
  'Have a nice day'
];

const AISuggestions = ({ onSelectSuggestion, userTranslations = [] }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [userTranslations]);

  const generateSuggestions = () => {
    setIsLoading(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      // Analyze user's translation patterns
      const userWords = userTranslations
        .flatMap(t => t.text?.toLowerCase().split(/\s+/) || [])
        .filter(w => w.length > 3);
      
      // Get most common words
      const wordFreq = {};
      userWords.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      
      const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([word]) => word);

      // Generate contextual suggestions
      const contextualSuggestions = [];
      
      // Suggest common phrases user hasn't used
      const unusedPhrases = COMMON_PHRASES.filter(
        phrase => !userTranslations.some(t => 
          t.text?.toLowerCase().includes(phrase.toLowerCase())
        )
      ).slice(0, 2);
      
      contextualSuggestions.push(...unusedPhrases.map(phrase => ({
        text: phrase,
        type: 'common',
        reason: 'Popular phrase you might find useful'
      })));

      // Suggest phrases with user's common words
      if (topWords.length > 0) {
        const wordBasedSuggestions = COMMON_PHRASES
          .filter(phrase => 
            topWords.some(word => phrase.toLowerCase().includes(word))
          )
          .slice(0, 2)
          .map(phrase => ({
            text: phrase,
            type: 'personalized',
            reason: `Contains words you frequently use`
          }));
        
        contextualSuggestions.push(...wordBasedSuggestions);
      }

      // Fill remaining slots with random suggestions
      while (contextualSuggestions.length < 4) {
        const randomPhrase = COMMON_PHRASES[
          Math.floor(Math.random() * COMMON_PHRASES.length)
        ];
        if (!contextualSuggestions.some(s => s.text === randomPhrase)) {
          contextualSuggestions.push({
            text: randomPhrase,
            type: 'discovery',
            reason: 'Try this phrase to expand your vocabulary'
          });
        }
      }

      setSuggestions(contextualSuggestions.slice(0, 4));
      setIsLoading(false);
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="ai-suggestions">
        <h3>AI Suggestions</h3>
        <div className="suggestions-loading">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Analyzing your patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-suggestions" role="region" aria-label="AI suggestions">
      <div className="suggestions-header">
        <h3>✨ AI Suggestions</h3>
        <button
          className="refresh-btn"
          onClick={generateSuggestions}
          aria-label="Refresh suggestions"
        >
          🔄
        </button>
      </div>
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`suggestion-item ${suggestion.type}`}
            onClick={() => onSelectSuggestion && onSelectSuggestion(suggestion.text)}
            role="button"
            tabIndex={0}
            aria-label={`Suggestion: ${suggestion.text}. ${suggestion.reason}`}
          >
            <div className="suggestion-text">{suggestion.text}</div>
            <div className="suggestion-reason">{suggestion.reason}</div>
            <div className="suggestion-badge">{suggestion.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISuggestions;
