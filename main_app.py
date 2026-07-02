```typescript
// apps/desktop/src/avatar/AvatarManager.ts
export class AvatarManager {
  position = { x: window.innerWidth - 100, y: window.innerHeight - 100 };
  topMost = true;

  load() {
    // Load saved position and settings
  }

  drag(position) {
    this.position = position;
    // Save position
  }

  saveSettings() {
    // Save settings locally
  }
}

// apps/desktop/src/avatar/AvatarState.ts
export enum AvatarState {
  Idle,
  Thinking,
  Learning,
  Working,
  Happy,
  Warning,
  Sleeping,
}

// apps/desktop/src/avatar/AvatarAnimation.ts
export class AvatarAnimation {
  play(state: AvatarState) {
    // Play corresponding animation for the state
  }

  loopAnimation(animation) {
    // Loop the animation naturally
  }
}

// apps/desktop/src/avatar/AvatarController.ts
export class AvatarController {
  state: AvatarState = AvatarState.Idle;

  setState(newState: AvatarState) {
    this.state = newState;
    // Trigger animation and speech bubble change
  }
}

// apps/desktop/src/avatar/AvatarSpeechBubble.ts
export class AvatarSpeechBubble {
  displayMessage(message: string) {
    // Show message in speech bubble
  }

  hide() {
    // Auto-hide bubble after certain time
  }
}

// apps/desktop/src/avatar/AvatarNotification.ts
export class AvatarNotification {
  trigger(event: string) {
    // Handle notification trigger based on event
  }
}

// apps/desktop/src/avatar/AvatarSettings.ts
export class AvatarSettings {
  size: number = 100;
  opacity: number = 1.0;
  animationSpeed: number = 1.0;
  speechBubbleOn: boolean = true;
  topMost: boolean = true;
  clickThrough: boolean = false;

  persist() {
    // Save settings locally
  }
}
```