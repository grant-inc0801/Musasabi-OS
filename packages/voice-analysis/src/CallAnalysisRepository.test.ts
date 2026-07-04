import { test } from "node:test";
import * as assert from "node:assert/strict";
import { CallAnalysisRepository } from "./CallAnalysisRepository";
import { generateCallSummary } from "./CallSummaryGenerator";

test("save then getByCallId round-trips a summary", () => {
  const repo = new CallAnalysisRepository(":memory:");
  try {
    const summary = generateCallSummary("call-001", [
      { speaker: "customer", text: "興味があります", timestampMs: 0, durationMs: 1000 },
    ]);

    repo.save(summary);
    const fetched = repo.getByCallId("call-001");

    assert.deepEqual(fetched, summary);
  } finally {
    repo.close();
  }
});

test("getByCallId returns null for an unknown callId", () => {
  const repo = new CallAnalysisRepository(":memory:");
  try {
    assert.equal(repo.getByCallId("does-not-exist"), null);
  } finally {
    repo.close();
  }
});

test("save upserts on repeated calls with the same callId", () => {
  const repo = new CallAnalysisRepository(":memory:");
  try {
    const first = generateCallSummary("call-002", []);
    const second = generateCallSummary("call-002", [
      { speaker: "rep", text: "高いですね", timestampMs: 0, durationMs: 1000 },
    ]);

    repo.save(first);
    repo.save(second);

    assert.deepEqual(repo.getByCallId("call-002"), second);
  } finally {
    repo.close();
  }
});
