import { test } from "node:test";
import * as assert from "node:assert/strict";
import {
  MOCK_DEPARTMENT_SUMMARIES,
  computeCompanySummary,
  formatJpy,
  DEPARTMENT_STATUS_LABEL_JA,
} from "./summary";
import type { DepartmentSummary } from "./summary";

test("computeCompanySummary aggregates the mock departments deterministically", () => {
  const summary = computeCompanySummary(MOCK_DEPARTMENT_SUMMARIES);
  assert.equal(summary.totalEmployees, 14);
  assert.equal(summary.totalRevenueJpy, 1250000);
  assert.equal(summary.todayProgressPercent, Math.round((72 + 45 + 60 + 30) / 4));
  assert.equal(summary.activeDepartments, 3);
});

test("computeCompanySummary handles an empty department list", () => {
  assert.deepEqual(computeCompanySummary([]), {
    totalEmployees: 0,
    totalRevenueJpy: 0,
    todayProgressPercent: 0,
    activeDepartments: 0,
  });
});

test("progress percent is a rounded average", () => {
  const depts: DepartmentSummary[] = [
    { id: "a", name: "A", employeeCount: 1, progressPercent: 50, todaySummary: "", revenueJpy: 0, status: "active" },
    { id: "b", name: "B", employeeCount: 1, progressPercent: 51, todaySummary: "", revenueJpy: 0, status: "preparing" },
  ];
  const summary = computeCompanySummary(depts);
  assert.equal(summary.todayProgressPercent, 51); // (50+51)/2 = 50.5 → 51
  assert.equal(summary.activeDepartments, 1);
});

test("formatJpy renders yen with thousands separators", () => {
  assert.equal(formatJpy(1250000), "¥1,250,000");
  assert.equal(formatJpy(0), "¥0");
});

test("every department status has a Japanese label", () => {
  for (const d of MOCK_DEPARTMENT_SUMMARIES) {
    assert.ok(DEPARTMENT_STATUS_LABEL_JA[d.status].length > 0);
  }
});
