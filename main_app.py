```typescript
// File: apps/desktop/src/avatar/live2d/Live2DController.ts
export class Live2DController {
  // Implementation for controlling Live2D avatar
  start() {
    // Start the Live2D animations
  }
}

// File: apps/desktop/src/avatar/live2d/MotionController.ts
export class MotionController {
  queueMotion(motion: string, priority: number) {
    // Queue a motion with specified priority
  }
}

// File: apps/desktop/src/avatar/live2d/MotionScheduler.ts
export class MotionScheduler {
  scheduleIdleMotions() {
    // Schedule idle motions at random intervals
  }
}

// File: apps/desktop/src/avatar/live2d/EyeTracking.ts
export class EyeTracking {
  trackCursor(cursorPosition: { x: number, y: number }) {
    // Control avatar eyes to track cursor position
  }
}

// File: apps/desktop/src/avatar/live2d/HeadTracking.ts
export class HeadTracking {
  tiltHead(direction: string) {
    // Tilt head based on direction
  }
}

// File: apps/desktop/src/avatar/live2d/TailPhysics.ts
export class TailPhysics {
  simulateSwing() {
    // Simulate tail swinging
  }
}

// File: apps/desktop/src/avatar/live2d/WingController.ts
export class WingController {
  flapWings() {
    // Control wing flapping
  }
}

// File: apps/desktop/src/avatar/live2d/IdleMotion.ts
export class IdleMotion {
  performRandomIdleMotion() {
    // Perform a random idle motion
  }
}

// File: apps/desktop/src/avatar/live2d/ClickReaction.ts
export class ClickReaction {
  onMouseClick() {
    // Handle click interaction and show reaction
  }
}

// Implementation for cursor interaction, click and drag reaction, performance goals, and testing would follow similar patterns
```