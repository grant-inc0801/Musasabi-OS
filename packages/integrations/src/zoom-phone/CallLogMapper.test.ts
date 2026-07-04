import { test } from "node:test";
import * as assert from "node:assert/strict";
import {
  mapCallLogToCallRecord,
  resolveLeadIdByPhoneNumber,
  resolveOutcomeFromCallResult,
} from "./CallLogMapper";
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

test("resolveOutcomeFromCallResult maps unanswered results to no_answer", () => {
  for (const result of ["No Answer", "Busy", "Voicemail", "Call Failed", "Missed"] as const) {
    assert.equal(resolveOutcomeFromCallResult(result), "no_answer");
  }
});

test("resolveOutcomeFromCallResult does not guess an outcome for connected calls", () => {
  assert.equal(resolveOutcomeFromCallResult("Call connected"), null);
});

test("mapCallLogToCallRecord returns null for a connected call with no manual outcome", () => {
  const record = mapCallLogToCallRecord(entry({ result: "Call connected" }), "lead-1");
  assert.equal(record, null);
});

test("mapCallLogToCallRecord uses the manual outcome when provided for a connected call", () => {
  const record = mapCallLogToCallRecord(entry({ result: "Call connected" }), "lead-1", "appointment_set");
  assert.deepEqual(record, {
    id: "call-1",
    leadId: "lead-1",
    occurredAt: "2026-07-04T01:00:00Z",
    outcome: "appointment_set",
  });
});

test("mapCallLogToCallRecord derives no_answer automatically without a manual outcome", () => {
  const record = mapCallLogToCallRecord(entry({ result: "No Answer" }), "lead-1");
  assert.equal(record?.outcome, "no_answer");
});

test("resolveLeadIdByPhoneNumber looks up a known number and returns null for unknown", () => {
  const map = { "0312345678": "lead-1" };
  assert.equal(resolveLeadIdByPhoneNumber("0312345678", map), "lead-1");
  assert.equal(resolveLeadIdByPhoneNumber("0300000000", map), null);
});
