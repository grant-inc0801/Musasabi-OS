import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MOCK_ALERTS,
  MOCK_CEO_PROPOSALS,
  MOCK_EMPLOYEE_SCORES,
  buildExecutiveCompanyMeter,
  sortAlertsByPriority,
  approveProposal,
  proposalToIssueDraft,
  compositeScore,
  rankEmployees,
  deptAssignedEmployees,
  deptBlockedItems,
  deptAuditNotes,
  buildDashboardSummaryJa,
} from "./index";

test("buildExecutiveCompanyMeter は部門平均と健全性を返す", () => {
  const m = buildExecutiveCompanyMeter([80, 60, 100]);
  assert.equal(m.progressPercent, 80);
  assert.equal(m.healthLabel, "良好");
  assert.ok(m.monthlyKpiPercent > 0 && m.monthlyKpiPercent <= 100);
  assert.equal(buildExecutiveCompanyMeter([]).progressPercent, 0);
});

test("sortAlertsByPriority は critical を先頭にする", () => {
  const sorted = sortAlertsByPriority(MOCK_ALERTS);
  assert.equal(sorted[0].level, "critical");
  assert.equal(sorted[sorted.length - 1].level, "low");
});

test("approveProposal は submitted を approved にする", () => {
  const p = MOCK_CEO_PROPOSALS[0];
  assert.equal(p.status, "submitted");
  assert.equal(approveProposal(p).status, "approved");
});

test("proposalToIssueDraft は承認済みのみ Issue ドラフトを返す", () => {
  const submitted = MOCK_CEO_PROPOSALS[0];
  assert.equal(proposalToIssueDraft(submitted), null);
  const approved = approveProposal(submitted);
  const draft = proposalToIssueDraft(approved);
  assert.ok(draft);
  assert.match(draft.title, /\[提案\]/);
  assert.match(draft.body, /Mock/);
});

test("rankEmployees は総合スコア降順", () => {
  const ranked = rankEmployees(MOCK_EMPLOYEE_SCORES);
  for (let i = 1; i < ranked.length; i++) {
    assert.ok(compositeScore(ranked[i - 1]) >= compositeScore(ranked[i]));
  }
  assert.equal(ranked[0].name, "営業リーダーAI");
});

test("Layer B 補助データ: 担当社員・ブロック・監査メモ", () => {
  assert.ok(deptAssignedEmployees("sales").includes("営業リーダーAI"));
  assert.ok(deptAssignedEmployees("unknown").length >= 1);
  assert.ok(deptBlockedItems("publishing").length >= 1);
  assert.deepEqual(deptBlockedItems("unknown"), []);
  assert.ok(deptAuditNotes("development")[0].includes("異常検知"));
  assert.ok(deptAuditNotes("unknown").length >= 1);
});

test("buildDashboardSummaryJa はアバター用に全社進捗・アラート・提案を要約", () => {
  const m = buildExecutiveCompanyMeter([80, 60]);
  const lines = buildDashboardSummaryJa(m);
  assert.ok(lines.some((l) => l.includes("全社進捗")));
  assert.ok(lines.some((l) => l.includes("アラート")));
  assert.ok(lines.some((l) => l.includes("提案")));
});
