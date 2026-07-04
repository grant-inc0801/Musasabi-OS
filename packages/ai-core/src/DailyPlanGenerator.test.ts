import { test } from "node:test";
import * as assert from "node:assert/strict";
import { generateDailyPlan } from "./DailyPlanGenerator";
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

test("buckets leads by status into the right plan sections", () => {
  const leads = [
    lead({ id: "new-1", status: "new" }),
    lead({ id: "negotiating-1", status: "negotiating" }),
    lead({ id: "callback-1", status: "callback", nextCallbackAt: "2026-07-04T08:00:00Z" }),
    lead({ id: "callback-future", status: "callback", nextCallbackAt: "2026-07-10T08:00:00Z" }),
    lead({ id: "contacted-1", status: "contacted" }),
    lead({ id: "interested-1", status: "interested" }),
    lead({ id: "lost-1", status: "lost" }),
  ];

  const plan = generateDailyPlan(leads, NOW);

  assert.deepEqual(
    plan.priorityLeads.map((l) => l.id).sort(),
    ["negotiating-1", "new-1"],
  );
  assert.deepEqual(plan.callbacks.map((l) => l.id), ["callback-1"]);
  assert.deepEqual(
    plan.followUps.map((l) => l.id).sort(),
    ["contacted-1", "interested-1"],
  );
  assert.ok(!plan.recommendedQueue.some((l) => l.id === "lost-1"));
});

test("recommendedQueue caps at 5 and follows priority order", () => {
  const leads = Array.from({ length: 8 }, (_, i) =>
    lead({ id: `L${i}`, priorityScore: i * 10 }),
  );
  const plan = generateDailyPlan(leads, NOW);
  assert.equal(plan.recommendedQueue.length, 5);
  assert.equal(plan.recommendedQueue[0].id, "L7");
});
