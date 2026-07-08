import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MOCK_PROPOSALS,
  MOCK_DEPARTMENT_KPIS,
  priorityScore,
  prioritizeProposals,
  buildExecutionQueue,
  approveProposal,
  buildExecutiveSummary,
  type AiPmProposal,
} from "./index";

test("priorityScore は 効果*2 - 労力", () => {
  const p: AiPmProposal = { id: "x", title: "t", department: "d", category: "process", impact: 5, effort: 2, requiresApproval: false };
  assert.equal(priorityScore(p), 8);
});

test("prioritizeProposals は優先度降順・同点id昇順で安定", () => {
  const ordered = prioritizeProposals(MOCK_PROPOSALS);
  for (let i = 1; i < ordered.length; i++) {
    const prev = priorityScore(ordered[i - 1]);
    const cur = priorityScore(ordered[i]);
    assert.ok(prev >= cur, "降順であること");
  }
  // p-01 (impact5,effort2 => 8) が先頭
  assert.equal(ordered[0].id, "p-01");
});

test("承認必須の提案は blocked、それ以外は上位が queued", () => {
  const queue = buildExecutionQueue(MOCK_PROPOSALS, 2);
  const p03 = queue.find((q) => q.proposal.id === "p-03")!;
  assert.equal(p03.stage, "blocked"); // requiresApproval
  const queued = queue.filter((q) => q.stage === "queued");
  assert.equal(queued.length, 2); // activeSlots=2
});

test("approveProposal は blocked を approved にする", () => {
  const queue = buildExecutionQueue(MOCK_PROPOSALS);
  const blocked = queue.find((q) => q.stage === "blocked")!;
  assert.equal(approveProposal(blocked).stage, "approved");
  // blocked以外は不変
  const queued = queue.find((q) => q.stage === "queued")!;
  assert.equal(approveProposal(queued).stage, "queued");
});

test("buildExecutiveSummary は提案数・承認待ち・稼働率を集計する", () => {
  const s = buildExecutiveSummary(MOCK_PROPOSALS, MOCK_DEPARTMENT_KPIS);
  assert.equal(s.totalProposals, MOCK_PROPOSALS.length);
  assert.equal(s.approvalPending, 2); // p-03, p-05
  assert.ok(s.topPriority);
  assert.equal(s.topPriority!.id, "p-01");
  assert.ok(s.avgUtilization > 0);
  assert.ok(s.lines.length >= 2);
});

test("空入力でも安全", () => {
  const s = buildExecutiveSummary([], []);
  assert.equal(s.totalProposals, 0);
  assert.equal(s.avgUtilization, 0);
  assert.equal(s.topPriority, null);
});
