import { test } from "node:test";
import * as assert from "node:assert/strict";
import { computeIdleMotion, DEFAULT_IDLE_MOTION_CONFIG } from "./idleMotion";

test("breathPhase starts at 0 at t=0 and stays within [-1, 1]", () => {
  assert.equal(computeIdleMotion(0).breathPhase, 0);
  for (let t = 0; t <= 8000; t += 137) {
    const { breathPhase } = computeIdleMotion(t);
    assert.ok(breathPhase >= -1 && breathPhase <= 1);
  }
});

test("breathPhase completes one cycle per breathPeriodMs", () => {
  const period = DEFAULT_IDLE_MOTION_CONFIG.breathPeriodMs;
  // 1周期後は再び ~0 に戻る(浮動小数の誤差を許容)。
  assert.ok(Math.abs(computeIdleMotion(period).breathPhase) < 1e-9);
  // 1/4周期で最大(吸い込み)に達する。
  assert.ok(computeIdleMotion(period / 4).breathPhase > 0.999);
});

test("blink is 0 outside the blink window", () => {
  // 既定: blinkPeriod 5000ms, duration 150ms。窓外(例: 1000ms)は開いている。
  assert.equal(computeIdleMotion(1000).blink, 0);
});

test("blink peaks at 1 in the middle of the blink window", () => {
  // duration 150ms の中央(75ms)で完全に閉じる。
  assert.ok(Math.abs(computeIdleMotion(75).blink - 1) < 1e-9);
});

test("blink recurs every blinkPeriodMs", () => {
  const period = DEFAULT_IDLE_MOTION_CONFIG.blinkPeriodMs;
  // 次の周期の同じ位相でも同じ瞬きが起きる。
  assert.equal(computeIdleMotion(75).blink, computeIdleMotion(period + 75).blink);
});

test("is a pure function (same input -> same output)", () => {
  assert.deepEqual(computeIdleMotion(1234), computeIdleMotion(1234));
});

test("handles negative time without producing out-of-range blink", () => {
  const { blink } = computeIdleMotion(-200);
  assert.ok(blink >= 0 && blink <= 1);
});
