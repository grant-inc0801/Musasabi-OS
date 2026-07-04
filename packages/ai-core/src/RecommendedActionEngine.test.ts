import { test } from "node:test";
import * as assert from "node:assert/strict";
import { recommendActions } from "./RecommendedActionEngine";
import type { Lead } from "./types";

const NOW = new Date("2026-07-04T09:00:00Z");

function lead(overrides: Partial<Lead>): Lead {
  return {
    id: "L1",
    name: "Taro",
    company: "Acme",
    status: "new",
    priorityScore: 50,
    lastContactedAt: null,
    nextCallbackAt: null,
    ...overrides,
  };
}

test("new lead gets an initial-call recommendation with score-based confidence", () => {
  const [action] = recommendActions([lead({ status: "new", priorityScore: 80 })], NOW);
  assert.equal(action.action, "初回架電を行う");
  assert.equal(action.confidence, "high");
});

test("due callback recommends calling back now", () => {
  const [action] = recommendActions(
    [lead({ status: "callback", nextCallbackAt: "2026-07-04T08:00:00Z" })],
    NOW,
  );
  assert.equal(action.action, "コールバックを実施する");
  assert.equal(action.confidence, "high");
});

test("future callback produces no action yet", () => {
  const actions = recommendActions(
    [lead({ status: "callback", nextCallbackAt: "2026-07-10T08:00:00Z" })],
    NOW,
  );
  assert.equal(actions.length, 0);
});

test("negotiating lead requires escalation per sales playbook", () => {
  const [action] = recommendActions([lead({ status: "negotiating" })], NOW);
  assert.match(action.action, /承認/);
});

test("lost lead produces no recommendation", () => {
  const actions = recommendActions([lead({ status: "lost" })], NOW);
  assert.equal(actions.length, 0);
});
