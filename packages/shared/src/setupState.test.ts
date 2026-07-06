import { test } from "node:test";
import * as assert from "node:assert/strict";
import {
  initialSetupState,
  isStepComplete,
  nextIncompleteStep,
  isSetupComplete,
  markStepComplete,
  parseSetupState,
  SETUP_STEPS,
} from "./setupState";

test("initial state has no completed steps and is not complete", () => {
  const state = initialSetupState();
  assert.deepEqual(state.completedSteps, []);
  assert.equal(isSetupComplete(state), false);
});

test("nextIncompleteStep returns steps in SETUP_STEPS order", () => {
  let state = initialSetupState();
  assert.equal(nextIncompleteStep(state), "welcome");
  state = markStepComplete(state, "welcome");
  assert.equal(nextIncompleteStep(state), "avatar");
});

test("nextIncompleteStep skips already-completed steps regardless of insertion order", () => {
  let state = initialSetupState();
  // welcome を飛ばして avatar を先に完了させても、未完の welcome が最初に返る。
  state = markStepComplete(state, "avatar");
  assert.equal(nextIncompleteStep(state), "welcome");
});

test("markStepComplete is immutable and idempotent", () => {
  const state = initialSetupState();
  const next = markStepComplete(state, "welcome");
  assert.deepEqual(state.completedSteps, []); // 元は不変
  assert.deepEqual(next.completedSteps, ["welcome"]);

  const again = markStepComplete(next, "welcome");
  assert.deepEqual(again.completedSteps, ["welcome"]); // 重複追加しない
  assert.notEqual(again, next); // 新しいオブジェクトを返す
});

test("isSetupComplete is true only once every step is done", () => {
  let state = initialSetupState();
  for (const step of SETUP_STEPS) {
    assert.equal(isSetupComplete(state), false);
    state = markStepComplete(state, step);
  }
  assert.equal(isSetupComplete(state), true);
  assert.equal(nextIncompleteStep(state), null);
});

test("isStepComplete reflects completion", () => {
  const state = markStepComplete(initialSetupState(), "avatar");
  assert.equal(isStepComplete(state, "avatar"), true);
  assert.equal(isStepComplete(state, "welcome"), false);
});

test("parseSetupState falls back to initial for malformed input", () => {
  assert.deepEqual(parseSetupState(null).completedSteps, []);
  assert.deepEqual(parseSetupState("nope").completedSteps, []);
  assert.deepEqual(parseSetupState({}).completedSteps, []);
  assert.deepEqual(parseSetupState({ completedSteps: "x" }).completedSteps, []);
});

test("parseSetupState drops unknown step ids and de-duplicates", () => {
  const state = parseSetupState({ completedSteps: ["welcome", "bogus", "welcome", "avatar"] });
  assert.deepEqual(state.completedSteps, ["welcome", "avatar"]);
});
