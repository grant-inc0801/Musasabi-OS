```typescript
// apps/desktop/src/avatar/emotion/EmotionEngine.ts
class EmotionEngine {
  private currentState: string;

  constructor() {
    this.currentState = 'Idle';
  }

  public transitionTo(newState: string) {
    // Implement smooth transition logic here
  }

  public getCurrentState() {
    return this.currentState;
  }
}

export default EmotionEngine;

// apps/desktop/src/avatar/emotion/EmotionState.ts
export enum EmotionState {
  Idle,
  Happy,
  Excited,
  Thinking,
  Learning,
  Working,
  Calling,
  Listening,
  Celebrating,
  Sleeping,
  Warning,
  Error,
}

// apps/desktop/src/avatar/emotion/EmotionTransition.ts
import { EmotionState } from './EmotionState';

class EmotionTransition {
  public static transitionRules: {[key: string]: EmotionState[]} = {
    [EmotionState.Idle]: [
      EmotionState.Happy,
      EmotionState.Thinking,
      EmotionState.Learning,
    ],
    // Add other rules
  };

  public static canTransition(current: EmotionState, target: EmotionState): boolean {
    return this.transitionRules[current]?.includes(target) || false;
  }
}

export default EmotionTransition;

// apps/desktop/src/avatar/emotion/AnimationController.ts
class AnimationController {
  public playAnimation(state: EmotionState) {
    switch(state) {
      case EmotionState.Happy:
        this.playHappyAnimation();
        break;
      case EmotionState.Thinking:
        this.playThinkingAnimation();
        break;
      // Add other cases
    }
  }

  private playHappyAnimation() {
    // Implement happy animation sequence
  }

  private playThinkingAnimation() {
    // Implement thinking animation sequence
  }
}

export default AnimationController;

// apps/desktop/src/avatar/emotion/AnimationScheduler.ts
import EmotionEngine from './EmotionEngine';

class AnimationScheduler {
  private engine: EmotionEngine;
  private queue: any[] = [];

  constructor(engine: EmotionEngine) {
    this.engine = engine;
  }

  public addAnimationToQueue(animation: string) {
    this.queue.push(animation);
    // Maintain prioritization here
  }

  public executeQueue() {
    while(this.queue.length > 0) {
      const animation = this.queue.shift();
      // Execute animation
    }
  }
}

export default AnimationScheduler;

// apps/desktop/src/avatar/emotion/IdleController.ts
class IdleController {
  public performRandomIdleAction() {
    const actions = [
      () => this.blink(),
      () => this.breathe(),
      // Add other idle actions
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    randomAction();
  }

  private blink() {
    // Blink animation code
  }

  private breathe() {
    // Breathe animation code
  }
}

export default IdleController;
```