import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SALES_ACTIVITY,
  appointmentAchievementPct,
  buildSalesActivitySummaryJa,
} from "./salesActivity";

test("本日の営業活動Mockが必須項目を持つ", () => {
  assert.ok(SALES_ACTIVITY.plannedCalls > 0);
  assert.ok(SALES_ACTIVITY.appointmentGoal > 0);
  assert.ok(SALES_ACTIVITY.appointmentsWon >= 0);
  assert.ok(SALES_ACTIVITY.improvementTargets.length >= 1);
  assert.ok(SALES_ACTIVITY.rebuttals.length >= 1);
  assert.ok(SALES_ACTIVITY.materialRequests.length >= 1);
  assert.ok(SALES_ACTIVITY.nextActions.length >= 1);
});

test("よくある反論には推奨切り返しが対応する", () => {
  for (const r of SALES_ACTIVITY.rebuttals) {
    assert.ok(r.objection.length > 0);
    assert.ok(r.response.length > 0);
  }
});

test("appointmentAchievementPct は達成率を返す", () => {
  assert.equal(appointmentAchievementPct({ ...SALES_ACTIVITY, appointmentGoal: 4, appointmentsWon: 2 }), 50);
  assert.equal(appointmentAchievementPct({ ...SALES_ACTIVITY, appointmentGoal: 0, appointmentsWon: 2 }), 0);
});

test("buildSalesActivitySummaryJa は架電予定とアポ状況に言及する", () => {
  const lines = buildSalesActivitySummaryJa();
  assert.ok(lines.some((l) => l.includes("架電予定")));
  assert.ok(lines.some((l) => l.includes("アポ")));
});
