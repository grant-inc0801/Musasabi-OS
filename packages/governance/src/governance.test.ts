import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXECUTIVE_ROLES,
  MOCK_EXECUTIVES,
  MOCK_MONTH_PROGRESS,
  budgetUsagePercent,
  kpiAttainmentPercent,
  forecastAttainmentPercent,
  isBehindTarget,
  isOverBudget,
  riskLevel,
  recommendedActions,
  requiresGovernanceApproval,
  buildGovernanceDashboard,
  type Executive,
} from "./index";

test("8役職の経営陣が定義されている", () => {
  assert.equal(EXECUTIVE_ROLES.length, 8);
  assert.ok(EXECUTIVE_ROLES.includes("ceo"));
  assert.ok(EXECUTIVE_ROLES.includes("pm"));
  assert.equal(MOCK_EXECUTIVES.length, 8);
});

test("予算・KPI率の計算", () => {
  const e: Executive = { role: "coo", name: "x", domain: "d", monthlyBudget: 1000, budgetUsed: 500, kpiName: "k", kpiTarget: 100, kpiActual: 40 };
  assert.equal(budgetUsagePercent(e), 50);
  assert.equal(kpiAttainmentPercent(e), 40);
});

test("forecastAttainmentPercent は現在ペースを月末へ外挿する", () => {
  const e: Executive = { role: "coo", name: "x", domain: "d", monthlyBudget: 1000, budgetUsed: 0, kpiName: "k", kpiTarget: 100, kpiActual: 30 };
  // 50%経過で実績30 → 着地予測60
  assert.equal(forecastAttainmentPercent(e, 0.5), 60);
  assert.ok(isBehindTarget(e, 0.5));
});

test("順調なら behind でない", () => {
  const e: Executive = { role: "coo", name: "x", domain: "d", monthlyBudget: 1000, budgetUsed: 300, kpiName: "k", kpiTarget: 100, kpiActual: 60 };
  // 60%経過で実績60 → 着地100
  assert.equal(isBehindTarget(e, 0.6), false);
});

test("isOverBudget は経過割合+10ptを超える消化を検知", () => {
  const e: Executive = { role: "cmo", name: "x", domain: "d", monthlyBudget: 1000, budgetUsed: 800, kpiName: "k", kpiTarget: 100, kpiActual: 50 };
  assert.equal(isOverBudget(e, 0.6), true); // 80% > 60+10
  assert.equal(isOverBudget({ ...e, budgetUsed: 650 }, 0.6), false); // 65% <= 70
});

test("riskLevel は大幅遅延を high とする", () => {
  const bad: Executive = { role: "cmo", name: "x", domain: "d", monthlyBudget: 1000, budgetUsed: 800, kpiName: "k", kpiTarget: 400, kpiActual: 150 };
  // 60%経過で150/0.6=250 → 62.5% <80 → high
  assert.equal(riskLevel(bad, 0.6), "high");
});

test("recommendedActions は大幅遅延の非CEOにCEOエスカレーションを含む", () => {
  const cmo = MOCK_EXECUTIVES.find((e) => e.role === "cmo")!;
  const actions = recommendedActions(cmo, MOCK_MONTH_PROGRESS);
  assert.ok(actions.some((a) => a.includes("再優先")));
  assert.ok(actions.some((a) => a.includes("CEO")));
});

test("順調な役員は現状維持を返す", () => {
  const good: Executive = { role: "cto", name: "x", domain: "d", monthlyBudget: 1000, budgetUsed: 500, kpiName: "k", kpiTarget: 100, kpiActual: 60 };
  assert.deepEqual(recommendedActions(good, 0.6), ["現状維持(目標達成見込み)"]);
});

test("requiresGovernanceApproval は戦略/組織/価格変更で true", () => {
  assert.equal(requiresGovernanceApproval("strategy"), true);
  assert.equal(requiresGovernanceApproval("org_change"), true);
  assert.equal(requiresGovernanceApproval("pricing"), true);
  assert.equal(requiresGovernanceApproval("routine_task"), false);
  assert.equal(requiresGovernanceApproval("budget_reallocation"), false);
});

test("buildGovernanceDashboard は集計と経営サマリーを返す", () => {
  const d = buildGovernanceDashboard(MOCK_EXECUTIVES, MOCK_MONTH_PROGRESS);
  assert.equal(d.monthProgressPercent, 60);
  assert.equal(d.statuses.length, 8);
  assert.ok(d.behindCount >= 1);
  assert.ok(d.summaryLines.length >= 2);
  assert.equal(d.totalBudget, MOCK_EXECUTIVES.reduce((s, e) => s + e.monthlyBudget, 0));
});
