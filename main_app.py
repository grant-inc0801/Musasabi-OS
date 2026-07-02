```typescript
// apps/desktop/src/avatar/vrm/VRMAvatar.ts
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm';

export class VRMAvatar {
  private vrm: VRM | null = null;

  async load(url: string) {
    const loader = new VRMLoaderPlugin();
    this.vrm = await loader.loadAsync(url);
  }

  getVrm() {
    return this.vrm;
  }
}

// apps/desktop/src/avatar/vrm/VRMLoader.ts
import { VRM, VRMLoader } from '@pixiv/three-vrm';

export const loadVRM = async (url: string): Promise<VRM> => {
  const loader = new VRMLoader();
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
};

// apps/desktop/src/avatar/vrm/VRMAnimationController.ts
import { AnimationMixer } from 'three';

export class VRMAnimationController {
  private mixer: AnimationMixer;

  constructor(object: THREE.Object3D) {
    this.mixer = new AnimationMixer(object);
  }

  play(animationAction: THREE.AnimationAction) {
    animationAction.play();
  }

  stopAll() {
    this.mixer.stopAllAction();
  }

  update(delta: number) {
    this.mixer.update(delta);
  }
}

// apps/desktop/src/avatar/vrm/VRMEmotionController.ts
interface EmotionEvent {
  type: string;
}

export class VRMEmotionController {
  applyEmotion(event: EmotionEvent) {
    switch(event.type) {
      case 'Happy': // Logic for happy emotion
        break;
      case 'Thinking': // Logic for thinking emotion
        break;
    }
  }
}

// apps/desktop/src/avatar/vrm/VRMCameraController.ts
import { PerspectiveCamera, Vector3 } from 'three';

export class VRMCameraController {
  private camera: PerspectiveCamera;

  constructor(camera: PerspectiveCamera) {
    this.camera = camera;
  }

  setView(viewType: string) {
    switch(viewType) {
      case 'Front':
        this.camera.position.set(0, 1, 5);
        this.camera.lookAt(new Vector3(0, 1, 0));
        break;
      case 'Side':
        this.camera.position.set(5, 1, 0);
        this.camera.lookAt(new Vector3(0, 1, 0));
        break;
    }
  }
}

// apps/desktop/src/avatar/vrm/VRMPhysicsController.ts
export class VRMPhysicsController {
  enablePhysics(enable: boolean) {
    if (enable) {
      // Enable physics
    } else {
      // Disable physics
    }
  }
}

// apps/desktop/src/avatar/vrm/VRMStateMachine.ts
export class VRMStateMachine {
  private state: string = 'Idle';

  changeState(newState: string) {
    console.log(`Changing state from ${this.state} to ${newState}`);
    this.state = newState;
  }

  getState() {
    return this.state;
  }
}

// apps/desktop/src/avatar/vrm/index.ts
export * from './VRMAvatar';
export * from './VRMLoader';
export * from './VRMAnimationController';
export * from './VRMEmotionController';
export * from './VRMCameraController';
export * from './VRMPhysicsController';
export * from './VRMStateMachine';
```