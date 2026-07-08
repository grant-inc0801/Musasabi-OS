import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MOCK_FINDINGS,
  shouldRecommendPause,
  departmentRiskScore,
  rankDepartmentRisk,
  policyCompliancePercent,
  buildAuditReport,
  type AuditFinding,
} from "./index";

test("高/重大かつ未是正は一時停止提案の対象", () => {
  const crit: AuditFinding = { id: "x", category: "anomaly", severity: "critical", department: "d", description: "", status: "open", recommendedAction: "" };
  assert.equal(shouldRecommendPause(crit), true);
  assert.equal(shouldRecommendPause({ ...crit, status: "corrected" }), false);
  assert.equal(shouldRecommendPause({ ...crit, severity: "low" }), false);
});

test("departmentRiskScore は未是正所見の重大度を合計する", () => {
  // 開発部門: f-03 critical(10) 未是正 → 10
  assert.equal(departmentRiskScore("開発部門", MOCK_FINDINGS), 10);
  // 営業部門: f-04 low だが corrected → 0
  assert.equal(departmentRiskScore("営業部門", MOCK_FINDINGS), 0);
});

test("rankDepartmentRisk はスコア降順、開発部門が最上位", () => {
  const ranked = rankDepartmentRisk(MOCK_FINDINGS);
  assert.equal(ranked[0].department, "開発部門");
  for (let i = 1; i < ranked.length; i++) {
    assert.ok(ranked[i - 1].score >= ranked[i].score);
  }
});

test("policyCompliancePercent はポリシー/承認所見の是正率", () => {
  // f-01 approval(未是正), f-04 policy(是正) → 2件中1件是正 = 50%
  assert.equal(policyCompliancePercent(MOCK_FINDINGS), 50);
  assert.equal(policyCompliancePercent([]), 100);
});

test("buildAuditReport は集計・一時停止提案・遵守率・最高リスク部門を返す", () => {
  const r = buildAuditReport("daily", MOCK_FINDINGS);
  assert.equal(r.period, "daily");
  assert.equal(r.totalFindings, MOCK_FINDINGS.length);
  assert.equal(r.openFindings, 4); // f-04 のみ是正済み
  assert.equal(r.bySeverity.critical, 1);
  assert.equal(r.pauseRecommendations, 2); // f-01(high未是正), f-03(critical未是正)
  assert.equal(r.policyCompliancePercent, 50);
  assert.equal(r.topRiskDepartment, "開発部門");
  assert.ok(r.lines.length >= 2);
});

test("所見なしでも安全(遵守率100・停止提案0)", () => {
  const r = buildAuditReport("weekly", []);
  assert.equal(r.totalFindings, 0);
  assert.equal(r.pauseRecommendations, 0);
  assert.equal(r.policyCompliancePercent, 100);
  assert.equal(r.topRiskDepartment, null);
});
