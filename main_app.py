```typescript
// File: apps/desktop/src/avatar/design/avatarDesignTokens.ts
export const designTokens = {
  size: {
    small: '32px',
    medium: '64px',
    large: '128px',
  },
  scale: 1.0,
  colors: {
    primary: '#FFD700',
    secondary: '#FFD123',
  },
  borderRadius: '8px',
  shadows: '0 4px 8px rgba(0, 0, 0, 0.1)',
  motionSpeed: '0.5s',
  bubbleSpacing: '12px',
  emotionalAccents: {
    idle: '#B0BEC5',
    happy: '#FFF176',
    thinking: '#FF8A65',
  }
};

// File: apps/desktop/src/avatar/design/avatarPalette.ts
export const avatarPalette = {
  body: '#FFD700',
  eyes: '#000000',
  mouth: '#333333',
  membrane: '#FFD123',
  tail: '#FFBB33',
  ears: '#FFCC44',
};

// File: apps/desktop/src/avatar/design/avatarEmotionMap.ts
export const avatarEmotionMap = {
  idle: {
    face: 'neutral',
    eyes: 'open',
    mouth: 'closed',
    pose: 'standing',
    motionSpeed: '0.5s',
    bubbleTone: '#B0BEC5',
  },
  happy: {
    face: 'smile',
    eyes: 'open',
    mouth: 'wide',
    pose: 'jumping',
    motionSpeed: '0.8s',
    bubbleTone: '#FFF176',
  },
  // Definitions for other emotions...
};

// File: apps/desktop/src/avatar/design/avatarPoseMap.ts
export const avatarPoseMap = {
  standing: {
    glidingMembrane: 'neutral',
  },
  jumping: {
    glidingMembrane: 'extended',
  },
  // Definitions for other poses...
};

// File: apps/desktop/src/avatar/design/avatarTheme.ts
export const avatarTheme = {
  businessFriendly: {
    demeanor: 'calm and inviting',
  },
  approachable: {
    demeanor: 'friendly and casual',
  },
};

// Tests and Documentation placeholders...

// File: apps/desktop/assets/avatar/musasabi/idle.svg
// Placeholder SVG content

// File: apps/desktop/assets/avatar/musasabi/happy.svg
// Placeholder SVG content

// Additional SVG files for other emotions and modes...
```
