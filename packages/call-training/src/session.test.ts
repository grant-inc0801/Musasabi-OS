import { test } from "node:test";
import * as assert from "node:assert/strict";
import { MockCallAdapter } from "./MockCallAdapter";
import {
  startTestCall,
  addHumanTurn,
  endTestCall,
  addFeedback,
  canEnableAutoCall,
  canPlaceRealCall,
} from "./session";
import { AUTOCALL_GATES } from "./types";

const adapter = new MockCallAdapter();

test("startTestCall creates an in-progress session with an AI opening turn", () => {
  const s = startTestCall("テスト太郎", adapter, 1000);
  assert.equal(s.status, "in_progress");
  assert.equal(s.contact, "テスト太郎");
  assert.equal(s.turns.length, 1);
  assert.equal(s.turns[0].speaker, "ai");
});

test("startTestCall rejects an empty contact", () => {
  assert.throws(() => startTestCall("   ", adapter), /連絡先/);
});

test("addHumanTurn appends the human turn and an AI reply", () => {
  let s = startTestCall("テスト太郎", adapter);
  s = addHumanTurn(s, "少し予算が高いですね", adapter, 5000);
  assert.equal(s.turns.length, 3);
  assert.equal(s.turns[1].speaker, "human");
  assert.equal(s.turns[2].speaker, "ai");
  assert.match(s.turns[2].text, /費用対効果|事例/);
});

test("addHumanTurn throws once the session is completed", () => {
  let s = startTestCall("テスト太郎", adapter);
  s = endTestCall(s, 9000);
  assert.throws(() => addHumanTurn(s, "はい", adapter, 9500), /進行中/);
});

test("addFeedback records a talk-correction note", () => {
  let s = startTestCall("テスト太郎", adapter);
  s = addFeedback(s, { turnIndex: 0, comment: "もっと明るい声で", category: "tone", nowMs: 100 });
  assert.equal(s.feedback.length, 1);
  assert.equal(s.feedback[0].category, "tone");
});

test("canEnableAutoCall requires every safety gate", () => {
  assert.equal(canEnableAutoCall([]), false);
  assert.equal(canEnableAutoCall(AUTOCALL_GATES.slice(0, 3)), false);
  assert.equal(canEnableAutoCall(AUTOCALL_GATES), true);
});

test("canPlaceRealCall is false for learning/test, and for autocall without all gates", () => {
  assert.equal(canPlaceRealCall("learning", AUTOCALL_GATES), false);
  assert.equal(canPlaceRealCall("test", AUTOCALL_GATES), false);
  assert.equal(canPlaceRealCall("autocall", []), false);
  // 全ゲート充足時のみ autocall が true(現フェーズでは充足しない)。
  assert.equal(canPlaceRealCall("autocall", AUTOCALL_GATES), true);
});

test("session operations are immutable (do not mutate the input)", () => {
  const s0 = startTestCall("テスト太郎", adapter);
  const s1 = addHumanTurn(s0, "はい", adapter, 100);
  assert.equal(s0.turns.length, 1);
  assert.equal(s1.turns.length, 3);
});
