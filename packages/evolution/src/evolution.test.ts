import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MOCK_IMPROVEMENTS,
  MOCK_KNOWLEDGE,
  requiresHumanApproval,
  improvementScore,
  prioritizeImprovements,
  generateDraftIssue,
  scoreKnowledge,
  buildEvolutionSummary,
  type ImprovementProposal,
} from "./index";

test("高リスク/高インパクトは承認必須", () => {
  const hi: ImprovementProposal = { id: "x", title: "t", kind: "automation", rationale: "r", impact: 5, risk: 4 };
  assert.equal(requiresHumanApproval(hi), true);
  const lo: ImprovementProposal = { id: "y", title: "t", kind: "quality", rationale: "r", impact: 3, risk: 2 };
  assert.equal(requiresHumanApproval(lo), false);
});

test("prioritizeImprovements はスコア降順", () => {
  const ordered = prioritizeImprovements(MOCK_IMPROVEMENTS);
  for (let i = 1; i < ordered.length; i++) {
    assert.ok(improvementScore(ordered[i - 1]) >= improvementScore(ordered[i]));
  }
});

test("generateDraftIssue は承認必須提案に approval-required ラベルと警告を付ける", () => {
  const risky = MOCK_IMPROVEMENTS.find((p) => p.id === "i-03")!; // impact5,risk4
  const draft = generateDraftIssue(risky);
  assert.match(draft.title, /\[改善提案\]/);
  assert.ok(draft.requiresApproval);
  assert.ok(draft.labels.includes("approval-required"));
  assert.match(draft.body, /人間承認/);
});

test("generateDraftIssue は安全な提案に safe ラベル", () => {
  const safe = MOCK_IMPROVEMENTS.find((p) => p.id === "i-02")!;
  const draft = generateDraftIssue(safe);
  assert.equal(draft.requiresApproval, false);
  assert.ok(draft.labels.includes("safe"));
});

test("scoreKnowledge は新しく参照の多い項目を高評価", () => {
  const fresh = scoreKnowledge(MOCK_KNOWLEDGE.find((k) => k.id === "k-01")!);
  assert.ok(fresh.score >= 80);
  assert.equal(fresh.grade, "A");
  assert.equal(fresh.needsRefresh, false);
});

test("scoreKnowledge は古く参照の少ない項目を needsRefresh", () => {
  const stale = scoreKnowledge(MOCK_KNOWLEDGE.find((k) => k.id === "k-02")!); // 120日/参照1
  assert.equal(stale.needsRefresh, true);
  assert.ok(stale.score < 60);
});

test("buildEvolutionSummary は集計を返す", () => {
  const s = buildEvolutionSummary(MOCK_IMPROVEMENTS, MOCK_KNOWLEDGE);
  assert.equal(s.totalProposals, MOCK_IMPROVEMENTS.length);
  assert.equal(s.approvalRequired + s.autoApplicable, MOCK_IMPROVEMENTS.length);
  assert.equal(s.approvalRequired, 1); // i-03
  assert.equal(s.knowledgeNeedingRefresh, 1); // k-02
  assert.ok(s.topProposal);
});
