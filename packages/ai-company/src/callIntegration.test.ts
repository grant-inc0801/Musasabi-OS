import { test } from "node:test";
import * as assert from "node:assert/strict";
import { AUTOCALL_GATES } from "@musasabi/call-training";
import {
  initialCallProgress,
  hasPassedTestCriteria,
  allowedCallModes,
  recommendedCallMode,
  stateDuringCall,
} from "./callIntegration";

test("initial progress allows learning mode only", () => {
  const progress = initialCallProgress("MUSA-105");
  assert.deepEqual(allowedCallModes(progress), ["learning"]);
  assert.equal(recommendedCallMode(progress), "learning");
});

test("completing learning unlocks test mode", () => {
  const progress = { ...initialCallProgress("MUSA-103"), learningCompleted: true };
  assert.deepEqual(allowedCallModes(progress), ["learning", "test"]);
  assert.equal(recommendedCallMode(progress), "test");
});

test("autocall stays locked without all safety gates, even after passing tests", () => {
  const progress = {
    ...initialCallProgress("MUSA-102"),
    learningCompleted: true,
    passedTestCalls: 3,
  };
  assert.equal(hasPassedTestCriteria(progress), true);
  // ゲート未充足(現フェーズの実状態)では autocall は含まれない。
  assert.deepEqual(allowedCallModes(progress, []), ["learning", "test"]);
});

test("autocall unlocks only with passed criteria AND every safety gate", () => {
  const passed = {
    ...initialCallProgress("MUSA-102"),
    learningCompleted: true,
    passedTestCalls: 3,
  };
  assert.deepEqual(allowedCallModes(passed, AUTOCALL_GATES), ["learning", "test", "autocall"]);
  // 合格していなければ全ゲート充足でも autocall は不可。
  const notPassed = { ...initialCallProgress("MUSA-105"), learningCompleted: true };
  assert.deepEqual(allowedCallModes(notPassed, AUTOCALL_GATES), ["learning", "test"]);
});

test("stateDuringCall maps mode and session to employee state", () => {
  assert.equal(stateDuringCall("test", true), "on_call");
  assert.equal(stateDuringCall("learning", false), "training");
  assert.equal(stateDuringCall("test", false), "training");
  assert.equal(stateDuringCall("autocall", false), "working");
});
