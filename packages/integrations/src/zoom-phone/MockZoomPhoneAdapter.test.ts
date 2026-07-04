import { test } from "node:test";
import * as assert from "node:assert/strict";
import { MockZoomPhoneAdapter } from "./MockZoomPhoneAdapter";
import type { ZoomCallLogEntry } from "./types";

function entry(overrides: Partial<ZoomCallLogEntry>): ZoomCallLogEntry {
  return {
    id: "call-1",
    callerNumber: "0312345678",
    calleeNumber: "0398765432",
    direction: "outbound",
    durationSeconds: 60,
    result: "Call connected",
    dateTime: "2026-07-04T01:00:00Z",
    ...overrides,
  };
}

test("listCallLogs returns only entries within the date range", async () => {
  const adapter = new MockZoomPhoneAdapter();
  adapter.seed([
    entry({ id: "in-range", dateTime: "2026-07-04T01:00:00Z" }),
    entry({ id: "before-range", dateTime: "2026-07-01T01:00:00Z" }),
    entry({ id: "after-range", dateTime: "2026-07-10T01:00:00Z" }),
  ]);

  const results = await adapter.listCallLogs(new Date("2026-07-03T00:00:00Z"), new Date("2026-07-05T00:00:00Z"));

  assert.deepEqual(results.map((r) => r.id), ["in-range"]);
});

test("listCallLogs returns an empty array when nothing is seeded", async () => {
  const adapter = new MockZoomPhoneAdapter();
  const results = await adapter.listCallLogs(new Date(0), new Date());
  assert.deepEqual(results, []);
});
