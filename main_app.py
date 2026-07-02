```typescript
// apps/desktop/src/avatar/Avatar.tsx
import React, { useState, useEffect } from 'react';
import { AvatarOverlay } from './AvatarOverlay';
import { AvatarController } from './AvatarController';
import { AvatarState, Emotion } from './AvatarState';

const Avatar: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [emotion, setEmotion] = useState<Emotion>('idle');

  useEffect(() => {
    // Load and persist position, emotion, etc.
  }, []);

  return (
    <AvatarOverlay position={position} onDrag={setPosition}>
      <AvatarController emotion={emotion} onEmotionChange={setEmotion} />
    </AvatarOverlay>
  );
};

export default Avatar;

// apps/desktop/src/avatar/AvatarBubble.tsx
import React from 'react';

const AvatarBubble: React.FC<{ message: string }> = ({ message }) => {
  return <div className="avatar-bubble">{message}</div>;
};

export default AvatarBubble;

// apps/desktop/src/avatar/AvatarState.ts
type Emotion = 'idle' | 'happy' | 'thinking' | 'working' | 'sleeping' | 'celebrating' | 'loading' | 'error';

interface AvatarStateOptions {
  position: { x: number; y: number };
  scale: number;
  transparency: number;
  currentEmotion: Emotion;
  animationEnabled: boolean;
}

class AvatarState {
  options: AvatarStateOptions;

  constructor(options: AvatarStateOptions) {
    this.options = options;
  }
}

export { AvatarState, Emotion };

// apps/desktop/src/avatar/AvatarEmotion.ts
import { Emotion } from './AvatarState';

class AvatarEmotion {
  currentEmotion: Emotion;

  constructor(initialEmotion: Emotion = 'idle') {
    this.currentEmotion = initialEmotion;
  }

  transitionTo(emotion: Emotion) {
    this.currentEmotion = emotion;
  }
}

export default AvatarEmotion;

// apps/desktop/src/avatar/AvatarController.ts
import React, { useState } from 'react';
import AvatarBubble from './AvatarBubble';
import { Emotion } from './AvatarState';

const AvatarController: React.FC<{ emotion: Emotion, onEmotionChange: (emotion: Emotion) => void }> = ({ emotion, onEmotionChange }) => {
  const [isBubbleOpen, setBubbleOpen] = useState(false);

  const handleClick = () => setBubbleOpen(!isBubbleOpen);
  const handleDoubleClick = () => {/* Open Dashboard */};
  const handleRightClick = () => {/* Open context menu */};

  return (
    <div 
      className="avatar-controller" 
      onClick={handleClick} 
      onDoubleClick={handleDoubleClick} 
      onContextMenu={handleRightClick}>
      {isBubbleOpen && <AvatarBubble message={`Current emotion: ${emotion}`} />}
    </div>
  );
};

export { AvatarController };

// apps/desktop/src/avatar/AvatarOverlay.tsx
import React from 'react';

const AvatarOverlay: React.FC<{ position: { x: number, y: number }, onDrag: (position: { x: number, y: number }) => void }> = ({ children, position, onDrag }) => {
  const handleDrag = (event: React.DragEvent) => {
    onDrag({ x: event.clientX, y: event.clientY });
  };

  return (
    <div 
      className="avatar-overlay" 
      style={{ left: position.x, top: position.y }} 
      draggable 
      onDragEnd={handleDrag}>
      {children}
    </div>
  );
};

export { AvatarOverlay };
```