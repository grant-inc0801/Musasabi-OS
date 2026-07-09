import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AI_CEO_STATUS,
  AI_PM_STATUS,
  DEPARTMENT_ROSTER,
  TODAY_TASKS,
  APPROVALS,
  GITHUB_STATUS,
  AI_TIMELINE,
  SYSTEM_STATUS,
  LED_COLOR,
  computeMissionSummary,
  summarizeMissionJa,
} from "./index";

test("AI CEO / AI PM の状態が定義されている", () => {
  assert.equal(AI_CEO_STATUS.name, "AI CEO");
  assert.ok(AI_CEO_STATUS.metrics.length >= 3);
  assert.ok(AI_PM_STATUS.sprint.length > 0);
  assert.ok(AI_PM_STATUS.metrics.some((m) => m.label.includes("Issue")));
});

test("部署一覧は9部署で必須項目を持つ", () => {
  assert.equal(DEPARTMENT_ROSTER.length, 9);
  for (const d of DEPARTMENT_ROSTER) {
    assert.ok(d.name.length > 0, `${d.id} name`);
    assert.ok(d.icon.length > 0, `${d.id} icon`);
    assert.ok(d.headcount >= 1, `${d.id} headcount`);
    assert.ok(d.utilization >= 0 && d.utilization <= 100, `${d.id} utilization`);
    assert.ok(d.page.length > 0, `${d.id} page`);
  }
});

test("Today's Tasks / Approvals は優先度と担当を持つ", () => {
  assert.ok(TODAY_TASKS.length >= 1);
  for (const t of TODAY_TASKS) {
    assert.ok(["high", "medium", "low"].includes(t.priority));
    assert.ok(t.progress >= 0 && t.progress <= 100);
    assert.ok(t.assignee.length > 0);
  }
  assert.ok(APPROVALS.length >= 1);
  assert.ok(APPROVALS.every((a) => ["high", "medium", "low"].includes(a.priority)));
});

test("GitHub / Timeline / System が定義されている", () => {
  assert.ok(GITHUB_STATUS.implementingIssues.length >= 1);
  assert.ok(GITHUB_STATUS.logs.length >= 1);
  assert.ok(AI_TIMELINE.length >= 4);
  assert.ok(AI_TIMELINE.every((e) => /\d\d:\d\d/.test(e.time)));
  assert.equal(SYSTEM_STATUS.length, 6);
  assert.ok(SYSTEM_STATUS.every((s) => s.level in LED_COLOR));
});

test("computeMissionSummary は稼働率平均・集計を返す", () => {
  const s = computeMissionSummary();
  assert.ok(s.aiUtilization > 0 && s.aiUtilization <= 100);
  assert.equal(s.totalHeadcount, DEPARTMENT_ROSTER.reduce((a, d) => a + d.headcount, 0));
  assert.equal(s.activeTasks, DEPARTMENT_ROSTER.reduce((a, d) => a + d.taskCount, 0));
  assert.equal(s.pendingApprovals, APPROVALS.length);
  // API が yellow のため全体は yellow
  assert.equal(s.systemHealth, "yellow");
});

test("computeMissionSummary は red を最優先で反映する", () => {
  const s = computeMissionSummary(
    DEPARTMENT_ROSTER,
    APPROVALS,
    [{ name: "X", level: "red", value: "停止" }],
  );
  assert.equal(s.systemHealth, "red");
});

test("summarizeMissionJa は稼働率と承認待ちを含む", () => {
  const t = summarizeMissionJa();
  assert.ok(t.includes("AI稼働率"));
  assert.ok(t.includes("承認待ち"));
});
