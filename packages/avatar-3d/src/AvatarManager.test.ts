import { test } from "node:test";
import * as assert from "node:assert/strict";
import { AvatarManager } from "./AvatarManager";
import type { IdleMotionFrame, VrmExpressionPreset, VrmRenderer } from "./types";

interface RecordingRenderer extends VrmRenderer {
  loadedUrls: string[];
  expressions: Array<{ preset: VrmExpressionPreset; weight: number }>;
  idleFrames: IdleMotionFrame[];
  disposed: boolean;
}

function recordingRenderer(): RecordingRenderer {
  const renderer: RecordingRenderer = {
    loadedUrls: [],
    expressions: [],
    idleFrames: [],
    disposed: false,
    async loadModel(url: string) {
      renderer.loadedUrls.push(url);
    },
    setExpression(preset, weight) {
      renderer.expressions.push({ preset, weight });
    },
    applyIdleMotion(frame) {
      renderer.idleFrames.push(frame);
    },
    dispose() {
      renderer.disposed = true;
    },
  };
  return renderer;
}

test("loadAvatar loads the model and applies the current state's expression", async () => {
  const renderer = recordingRenderer();
  const manager = new AvatarManager(renderer);
  await manager.loadAvatar("model.vrm");

  assert.deepEqual(renderer.loadedUrls, ["model.vrm"]);
  assert.equal(manager.isModelLoaded, true);
  // 既定ステータス idle は relaxed 表情。
  assert.deepEqual(renderer.expressions, [{ preset: "relaxed", weight: 1 }]);
});

test("setState before load stores state but does not touch the renderer", () => {
  const renderer = recordingRenderer();
  const manager = new AvatarManager(renderer);
  manager.setState("goal_achieved");

  assert.equal(manager.getState(), "goal_achieved");
  assert.deepEqual(renderer.expressions, []);
});

test("setState after load applies the mapped expression", async () => {
  const renderer = recordingRenderer();
  const manager = new AvatarManager(renderer);
  await manager.loadAvatar("model.vrm");
  renderer.expressions.length = 0; // ロード時の適用をクリア

  manager.setState("goal_achieved");
  assert.deepEqual(renderer.expressions, [{ preset: "happy", weight: 1 }]);
});

test("tick does nothing until a model is loaded", () => {
  const renderer = recordingRenderer();
  const manager = new AvatarManager(renderer);
  manager.tick(1000);
  assert.equal(renderer.idleFrames.length, 0);
});

test("tick applies idle motion once a model is loaded", async () => {
  const renderer = recordingRenderer();
  const manager = new AvatarManager(renderer);
  await manager.loadAvatar("model.vrm");
  manager.tick(1000);
  assert.equal(renderer.idleFrames.length, 1);
  const frame = renderer.idleFrames[0];
  assert.ok(frame.breathPhase >= -1 && frame.breathPhase <= 1);
});

test("dispose releases the renderer and clears loaded state", async () => {
  const renderer = recordingRenderer();
  const manager = new AvatarManager(renderer);
  await manager.loadAvatar("model.vrm");
  manager.dispose();
  assert.equal(renderer.disposed, true);
  assert.equal(manager.isModelLoaded, false);
});
