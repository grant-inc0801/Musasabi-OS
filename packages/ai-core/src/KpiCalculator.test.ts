import { test } from "node:test";
import * as assert from "node:assert/strict";
import { calculateKpi } from "./KpiCalculator";
import type { CallRecord } from "./types";

function call(id: string, outcome: CallRecord["outcome"]): CallRecord {
  return { id, leadId: `lead-${id}`, occurredAt: "2026-07-04T09:00:00Z", outcome };
}

test("returns zeroed KPI for no calls", () => {
  const kpi = calculateKpi([]);
  assert.deepEqual(kpi, {
    callsMade: 0,
    appointmentsSet: 0,
    dealsWon: 0,
    appointmentRate: 0,
    winRate: 0,
  });
});

test("computes rates from call outcomes", () => {
  const calls = [
    call("1", "no_answer"),
    call("2", "appointment_set"),
    call("3", "appointment_set"),
    call("4", "closed_won"),
  ];
  const kpi = calculateKpi(calls);
  assert.equal(kpi.callsMade, 4);
  assert.equal(kpi.appointmentsSet, 2);
  assert.equal(kpi.dealsWon, 1);
  assert.equal(kpi.appointmentRate, 0.5);
  assert.equal(kpi.winRate, 0.5);
});
