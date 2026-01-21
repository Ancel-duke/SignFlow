import React, { useState } from 'react';
import { generateAnimationSequence } from '../utils/animationSystem';
import './TranslationTimeline.css';

const TranslationTimeline = ({ translations, onPreview }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!translations || translations.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No translations yet. Start translating to see your timeline!</p>
      </div>
    );
  }

  return (
    <div className="translation-timeline" role="region" aria-label="Translation timeline">
      <h3>Translation Timeline</h3>
      <div className="timeline-container">
        {translations.map((translation, index) => {
          const date = new Date(translation.createdAt);
          const isToday = date.toDateString() === new Date().toDateString();
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={translation._id || index}
              className={`timeline-item ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onPreview && onPreview(translation)}
              role="button"
              tabIndex={0}
              aria-label={`Translation from ${isToday ? 'today' : date.toLocaleDateString()}: ${translation.text}`}
            >
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-date">
                  {isToday ? 'Today' : date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="timeline-text">{translation.text}</div>
                {isHovered && (
                  <div className="timeline-preview">
                    <p className="preview-text">{translation.text}</p>
                    <button 
                      className="preview-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview && onPreview(translation);
                      }}
                    >
                      Preview Animation
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranslationTimeline;
