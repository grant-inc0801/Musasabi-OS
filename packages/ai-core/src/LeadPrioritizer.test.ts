import { test } from "node:test";
import * as assert from "node:assert/strict";
import { prioritizeLeads } from "./LeadPrioritizer";
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

test("sorts by priorityScore descending", () => {
  const leads = [lead({ id: "A", priorityScore: 10 }), lead({ id: "B", priorityScore: 90 })];
  const result = prioritizeLeads(leads, NOW);
  assert.deepEqual(result.map((l) => l.id), ["B", "A"]);
});

test("due callbacks outrank higher priorityScore", () => {
  const leads = [
    lead({ id: "A", priorityScore: 95 }),
    lead({ id: "B", status: "callback", priorityScore: 5, nextCallbackAt: "2026-07-04T08:00:00Z" }),
  ];
  const result = prioritizeLeads(leads, NOW);
  assert.deepEqual(result.map((l) => l.id), ["B", "A"]);
});

test("future callbacks do not jump the queue", () => {
  const leads = [
    lead({ id: "A", priorityScore: 95 }),
    lead({ id: "B", status: "callback", priorityScore: 5, nextCallbackAt: "2026-07-05T08:00:00Z" }),
  ];
  const result = prioritizeLeads(leads, NOW);
  assert.deepEqual(result.map((l) => l.id), ["A", "B"]);
});

test("excludes lost leads", () => {
  const leads = [lead({ id: "A", status: "lost", priorityScore: 100 }), lead({ id: "B", priorityScore: 1 })];
  const result = prioritizeLeads(leads, NOW);
  assert.deepEqual(result.map((l) => l.id), ["B"]);
});
