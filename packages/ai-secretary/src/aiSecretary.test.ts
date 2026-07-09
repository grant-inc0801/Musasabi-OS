import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SECRETARY_ITEMS,
  SECRETARY_CATEGORY_LABEL_JA,
  SECRETARY_ACTIONS,
  MARKET_RESEARCH_REPORTS,
  MARKETING_POSTS,
  POST_FREQUENCIES,
  EXTERNAL_POSTING_ENABLED,
  computeBriefing,
  filterSecretaryItems,
  summarizeSecretaryJa,
  departmentsOf,
  analyzePostDraft,
  scheduleMockPosts,
} from "./index";

test("秘書アイテムは全9カテゴリを網羅し必須項目を持つ", () => {
  const cats = new Set(SECRETARY_ITEMS.map((i) => i.category));
  for (const c of [
    "approval_request", "department_proposal", "automation_candidate", "ai_combination_idea",
    "risk_alert", "kpi_warning", "workflow_improvement", "new_business_idea", "followup_reminder",
  ]) {
    assert.ok(cats.has(c as never), `missing category ${c}`);
    assert.ok(SECRETARY_CATEGORY_LABEL_JA[c as never], `label for ${c}`);
  }
  for (const i of SECRETARY_ITEMS) {
    assert.ok(i.sourceDepartment && i.relatedAiEmployee && i.summary, `${i.id} fields`);
    assert.ok(i.reason && i.recommendedAction && i.expectedImpact && i.suggestedNextStep, `${i.id} detail`);
    assert.equal(typeof i.approvalNeeded, "boolean");
  }
});

test("デイリーブリーフィングは承認待ち・高優先・リスクを集計する", () => {
  const b = computeBriefing();
  assert.equal(b.totalItems, SECRETARY_ITEMS.length);
  assert.ok(b.approvalsWaiting >= 1);
  assert.ok(b.highPriority >= 1);
  assert.ok(b.risks >= 1);
  assert.ok(b.headline.includes("承認待ち"));
  assert.ok(b.lines.length >= 3);
});

test("filterSecretaryItems はカテゴリ/優先度/部署で絞り、優先度順に並ぶ", () => {
  const high = filterSecretaryItems(SECRETARY_ITEMS, { priority: "high" });
  assert.ok(high.every((i) => i.priority === "high"));
  const dev = filterSecretaryItems(SECRETARY_ITEMS, { department: "システム開発部" });
  assert.ok(dev.every((i) => i.sourceDepartment === "システム開発部"));
  const all = filterSecretaryItems(SECRETARY_ITEMS, {});
  // 高→中→低 の順
  const ranks = all.map((i) => (i.priority === "high" ? 0 : i.priority === "medium" ? 1 : 2));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
});

test("秘書アクションは6種(承認/却下/保留/Issue Mock/バックログ/部署送付)", () => {
  const kinds = SECRETARY_ACTIONS.map((a) => a.kind);
  for (const k of ["approve", "reject", "defer", "create_issue_mock", "add_backlog", "send_department"]) {
    assert.ok(kinds.includes(k as never), `missing action ${k}`);
  }
});

test("summarizeSecretaryJa / departmentsOf", () => {
  assert.ok(summarizeSecretaryJa().includes("AI秘書"));
  assert.ok(departmentsOf().includes("営業部"));
});

test("市場調査レポートは標準形式の必須項目を持つ", () => {
  assert.ok(MARKET_RESEARCH_REPORTS.length >= 1);
  for (const r of MARKET_RESEARCH_REPORTS) {
    assert.ok(r.proposalTitle && r.sourceDepartment && r.requestingAiEmployee);
    assert.ok(r.marketSizeSummary && r.targetCustomer);
    assert.equal(r.topCompetitors.length, 3, `${r.id} top3 competitors`);
    assert.ok(r.competitorComparison.length >= 1);
    assert.ok(r.differentiationPoints.length >= 1);
    assert.ok(r.opportunityScore >= 0 && r.opportunityScore <= 100);
    assert.ok(r.recommendedStrategy && r.nextAction);
  }
});

test("マーケ投稿は標準投稿レポートの必須項目を持つ", () => {
  assert.ok(MARKETING_POSTS.length >= 1);
  for (const p of MARKETING_POSTS) {
    assert.ok(p.campaignName && p.draftText);
    assert.equal(typeof p.textLocked, "boolean");
    assert.equal(typeof p.recurringEnabled, "boolean");
    assert.ok(Array.isArray(p.revisionHistory));
  }
});

test("頻度は5種(毎日/3/7/14/30日)", () => {
  assert.equal(POST_FREQUENCIES.length, 5);
  assert.deepEqual(POST_FREQUENCIES.map((f) => f.value), ["1d", "3d", "7d", "14d", "30d"]);
});

test("analyzePostDraft: ロック時は改稿せず、未ロック時は改善提案を返す", () => {
  const locked = analyzePostDraft("なんでも", true);
  assert.equal(locked.recommendedRevision, "—(ロック中)");
  // ハッシュタグ無し・CTA無し → 提案あり
  const open = analyzePostDraft("新サービスのお知らせです", false);
  assert.ok(open.recommendedRevision.includes("ハッシュタグ") || open.recommendedRevision.includes("CTA"));
  // 良好な文
  const good = analyzePostDraft("試すはこちら→ #Musasabi", false);
  assert.ok(good.analysisSummary.includes("良好") || good.recommendedRevision.includes("見つかりません"));
});

test("scheduleMockPosts: 承認+繰り返しで複数、単発で1件、未承認で0件", () => {
  const recurring = MARKETING_POSTS.find((p) => p.recurringEnabled)!;
  // 未承認(in_review)なら0件
  assert.equal(scheduleMockPosts(recurring).length, 0);
  const approvedRecurring = { ...recurring, approvalStatus: "approved" as const };
  const recs = scheduleMockPosts(approvedRecurring, 4);
  assert.equal(recs.length, 4);
  assert.equal(recs[0].dayOffset, 0);
  assert.equal(recs[1].dayOffset, 7); // 7d
  const single = MARKETING_POSTS.find((p) => !p.recurringEnabled && p.approvalStatus === "approved")!;
  assert.equal(scheduleMockPosts(single).length, 1);
});

test("本番SNS投稿は承認まで無効(ロック)", () => {
  assert.equal(EXTERNAL_POSTING_ENABLED, false);
});
