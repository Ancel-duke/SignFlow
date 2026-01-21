// Easter Egg Phrases - Special animations for fun phrases
export const EASTER_EGG_PHRASES = [
  {
    patterns: [/hello world/i, /hi there/i, /hey/i],
    name: 'wave',
    description: 'Friendly wave animation',
    specialAnimation: 'easter_wave'
  },
  {
    patterns: [/i love you/i, /love/i, /heart/i],
    name: 'heart',
    description: 'Heart gesture animation',
    specialAnimation: 'easter_heart'
  },
  {
    patterns: [/dance/i, /party/i, /celebrate/i],
    name: 'dance',
    description: 'Celebration dance',
    specialAnimation: 'easter_dance'
  },
  {
    patterns: [/thank you so much/i, /thanks a lot/i],
    name: 'grateful',
    description: 'Extra grateful gesture',
    specialAnimation: 'easter_grateful'
  },
  {
    patterns: [/amazing/i, /awesome/i, /wow/i],
    name: 'excited',
    description: 'Excited reaction',
    specialAnimation: 'easter_excited'
  },
  {
    patterns: [/good night/i, /sleep well/i],
    name: 'sleepy',
    description: 'Sleepy gesture',
    specialAnimation: 'easter_sleepy'
  }
];

export const checkEasterEgg = (text) => {
  for (const egg of EASTER_EGG_PHRASES) {
    for (const pattern of egg.patterns) {
      if (pattern.test(text)) {
        return egg;
      }
    }
  }
  return null;
};
