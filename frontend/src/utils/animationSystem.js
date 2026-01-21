// Animation System for Sign Language Translation
// Provides varied, natural-looking animations with phrase detection and variations

// Common phrases that should use special phrase-level animations
const PHRASE_PATTERNS = [
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

// Animation pools for individual words (multiple variations per word)
const WORD_ANIMATION_POOLS = {
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

// Generate a random seed for this translation to ensure variations
const generateSeed = () => Math.random() * 1000000;

// Get animation variation based on word and seed
const getAnimationVariation = (word, seed) => {
  const normalizedWord = word.toLowerCase().replace(/[.,!?]/g, '');
  const pool = WORD_ANIMATION_POOLS[normalizedWord] || WORD_ANIMATION_POOLS['default'];
  
  // Use seed to consistently select variation, but add randomness
  const index = Math.floor((seed + normalizedWord.charCodeAt(0)) % pool.length);
  return pool[index];
};

// Generate variation parameters for natural differences
const generateVariationParams = (seed, baseSpeed = 1.0, tone = 'neutral') => {
  // Use seed to create consistent but varied parameters
  const speedVariation = 0.8 + (seed % 40) / 100; // 0.8 to 1.2
  const handPositionVariation = (seed % 20 - 10) / 100; // -0.1 to 0.1
  const expressionVariation = (seed % 15) / 100; // 0 to 0.15
  
  // Apply tone modifiers
  let speedMultiplier = baseSpeed;
  if (tone === 'fast' || tone === 'casual') {
    speedMultiplier *= 1.2;
  } else if (tone === 'slow' || tone === 'formal') {
    speedMultiplier *= 0.8;
  }
  
  return {
    speed: speedMultiplier * speedVariation,
    handPositionOffset: handPositionVariation,
    expressionIntensity: expressionVariation,
    armSwingAmplitude: 0.4 + (seed % 20) / 100, // 0.4 to 0.6
    bodyMovement: (seed % 10) / 100 // 0 to 0.1
  };
};

// Split text into words and phrases intelligently
const parseText = (text) => {
  const normalized = text.trim();
  const segments = [];
  let remaining = normalized;
  
  // First, check for phrase patterns
  for (const phrasePattern of PHRASE_PATTERNS) {
    const match = remaining.match(phrasePattern.pattern);
    if (match) {
      const matchText = match[0];
      const index = remaining.indexOf(matchText);
      
      // Add text before phrase
      if (index > 0) {
        const before = remaining.substring(0, index).trim();
        if (before) {
          segments.push({ type: 'words', text: before });
        }
      }
      
      // Add phrase
      segments.push({
        type: 'phrase',
        text: matchText,
        animation: phrasePattern.animation,
        duration: phrasePattern.duration
      });
      
      // Update remaining
      remaining = remaining.substring(index + matchText.length).trim();
    }
  }
  
  // Add remaining words
  if (remaining) {
    segments.push({ type: 'words', text: remaining });
  }
  
  // If no phrases found, treat entire text as words
  if (segments.length === 0) {
    segments.push({ type: 'words', text: normalized });
  }
  
  return segments;
};

// Main function to generate animation sequence with variations
export const generateAnimationSequence = (text, options = {}) => {
  const {
    tone = 'neutral', // 'casual', 'formal', 'neutral'
    speed = 'normal', // 'fast', 'slow', 'normal'
    seed = generateSeed()
  } = options;
  
  const segments = parseText(text);
  const animationSequence = [];
  const variationParams = generateVariationParams(seed, 
    speed === 'fast' ? 1.2 : speed === 'slow' ? 0.8 : 1.0,
    tone
  );
  
  segments.forEach((segment, index) => {
    if (segment.type === 'phrase') {
      // Use phrase-level animation
      animationSequence.push({
        type: 'phrase',
        animation: segment.animation,
        duration: segment.duration * variationParams.speed,
        variation: {
          ...variationParams,
          seed: seed + index
        }
      });
    } else {
      // Split into words and get variations
      const words = segment.text.split(/\s+/).filter(w => w.length > 0);
      words.forEach((word, wordIndex) => {
        const wordSeed = seed + index * 100 + wordIndex;
        const animation = getAnimationVariation(word, wordSeed);
        const wordVariation = generateVariationParams(wordSeed, variationParams.speed, tone);
        
        animationSequence.push({
          type: 'word',
          animation,
          word,
          duration: (0.8 + word.length * 0.1) * wordVariation.speed,
          variation: {
            ...wordVariation,
            seed: wordSeed
          }
        });
      });
    }
  });
  
  return {
    sequence: animationSequence,
    totalDuration: animationSequence.reduce((sum, item) => sum + item.duration, 0),
    variationParams
  };
};

// Get animation parameters for a specific frame
export const getAnimationParams = (animationItem, timeProgress) => {
  const { variation, duration } = animationItem;
  const normalizedTime = timeProgress / duration;
  
  // Create smooth, varied motion based on animation type
  const baseFrequency = 2 + variation.armSwingAmplitude * 2;
  const phase = normalizedTime * Math.PI * 2 * baseFrequency;
  
  return {
    leftArmRotation: Math.sin(phase) * (0.5 + variation.handPositionOffset),
    rightArmRotation: -Math.sin(phase + 0.3) * (0.5 + variation.handPositionOffset),
    bodyRotation: Math.sin(phase * 0.5) * 0.3 * variation.bodyMovement,
    bodyVertical: Math.sin(phase * 2) * 0.1 * variation.bodyMovement,
    handPosition: {
      left: variation.handPositionOffset + Math.sin(phase) * 0.1,
      right: -variation.handPositionOffset + Math.sin(phase + 0.5) * 0.1
    },
    expression: Math.sin(phase * 0.8) * variation.expressionIntensity,
    speed: variation.speed
  };
};
