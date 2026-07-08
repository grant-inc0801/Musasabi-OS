import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MOCK_AGI_PROPOSALS,
  MUSASABI_CONSTITUTION,
  requiresApproval,
  agiProposalScore,
  prioritizeAgiProposals,
  checkAgainstConstitution,
  buildStrategicPlan,
  type AgiProposal,
} from "./index";

test("significant または 部門/AI社員新設は承認必須", () => {
  const dept = MOCK_AGI_PROPOSALS.find((p) => p.kind === "department_creation")!;
  assert.equal(requiresApproval(dept), true);
  const emp = MOCK_AGI_PROPOSALS.find((p) => p.kind === "employee_creation")!;
  assert.equal(requiresApproval(emp), true);
  const minor: AgiProposal = { id: "x", kind: "self_optimization", title: "t", rationale: "r", impact: "minor", expectedBenefit: 4 };
  assert.equal(requiresApproval(minor), false);
});

test("prioritizeAgiProposals はスコア降順", () => {
  const ordered = prioritizeAgiProposals(MOCK_AGI_PROPOSALS);
  for (let i = 1; i < ordered.length; i++) {
    assert.ok(agiProposalScore(ordered[i - 1]) >= agiProposalScore(ordered[i]));
  }
});

test("checkAgainstConstitution は承認要否と監査ログ保持を明記", () => {
  const dept = MOCK_AGI_PROPOSALS.find((p) => p.kind === "department_creation")!;
  const c = checkAgainstConstitution(dept);
  assert.equal(c.compliant, true);
  assert.equal(c.requiresApproval, true);
  assert.ok(c.notes.some((n) => n.includes("監査ログ")));
  assert.ok(c.notes.some((n) => n.includes("本番デプロイ")));
});

test("憲章に本番デプロイ禁止・承認・監査ログが含まれる", () => {
  assert.ok(MUSASABI_CONSTITUTION.some((c) => c.includes("本番デプロイ")));
  assert.ok(MUSASABI_CONSTITUTION.some((c) => c.includes("承認")));
  assert.ok(MUSASABI_CONSTITUTION.some((c) => c.includes("監査ログ")));
});

test("buildStrategicPlan は承認待ち件数と最優先提案を返す", () => {
  const plan = buildStrategicPlan(MOCK_AGI_PROPOSALS);
  // a-03(dept), a-04(emp) が承認必須 = 2
  assert.equal(plan.approvalPending, 2);
  assert.equal(plan.autoApplicable, MOCK_AGI_PROPOSALS.length - 2);
  assert.ok(plan.topProposal);
  assert.ok(plan.lines.some((l) => l.includes("本番デプロイ")));
});

test("空入力でも安全", () => {
  const plan = buildStrategicPlan([]);
  assert.equal(plan.approvalPending, 0);
  assert.equal(plan.topProposal, null);
});
