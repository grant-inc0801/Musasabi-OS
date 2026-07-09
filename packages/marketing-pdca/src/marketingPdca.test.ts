import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MARKETING_POSTS,
  METRIC_KEYS,
  POST_FREQUENCIES,
  EXTERNAL_POSTING_ENABLED,
  analyzePostMetrics,
  weakPoints,
  buildSuggestions,
  runPdca,
  createNextVersion,
  extractKnowledge,
  buildMarketingSecretaryItems,
  summarizeMarketingJa,
} from "./index";

test("数値分析は12指標を持ち0-100に収まる", () => {
  assert.equal(METRIC_KEYS.length, 12);
  const m = analyzePostMetrics({ title: "テスト", body: "今すぐ試す→ #tag" });
  for (const k of METRIC_KEYS) {
    assert.ok(m[k] >= 0 && m[k] <= 100, `${k}`);
  }
});

test("CTA/ハッシュタグ有りは無しよりスコアが高い", () => {
  const good = analyzePostMetrics({ title: "AI日報コーチ 新登場", body: "今すぐ試す→ #Musasabi #営業" });
  const bad = analyzePostMetrics({ title: "お知らせ", body: "リリースしました" });
  assert.ok(good.overall > bad.overall);
  assert.ok(good.cta > bad.cta);
  assert.ok(good.hashtag > bad.hashtag);
});

test("投稿はタイトル単位で必須項目・バージョン・指標を持つ", () => {
  assert.ok(MARKETING_POSTS.length >= 1);
  for (const p of MARKETING_POSTS) {
    assert.ok(p.postTitle && p.campaignName && p.assignedAiEmployee);
    assert.ok(p.versions.length >= 1);
    assert.equal(p.currentVersion, p.versions.length);
    // ベストバージョンが1つある
    assert.equal(p.versions.filter((v) => v.isBest).length, 1);
  }
});

test("バージョン改善で最新が最高スコアなら isBest が移動する", () => {
  const p = MARKETING_POSTS[0];
  assert.equal(p.textLocked, false);
  const improved = createNextVersion(p, "【期間限定】AIが日報をコーチング。今すぐ無料で試す→ #Musasabi #営業DX", "CTA強化");
  assert.equal(improved.versions.length, p.versions.length + 1);
  const best = improved.versions.find((v) => v.isBest)!;
  assert.ok(best.score >= Math.max(...p.versions.map((v) => v.score)));
});

test("テキストロック時は次バージョンを作らない(本文改変なし)", () => {
  const locked = MARKETING_POSTS.find((p) => p.textLocked)!;
  const after = createNextVersion(locked, "改変してみる", "test");
  assert.equal(after.versions.length, locked.versions.length);
  assert.equal(after.draftText, locked.draftText);
});

test("PDCA は Plan/Do/Check/Act を返し、ロック時は本文改変を提案しない", () => {
  const open = runPdca(MARKETING_POSTS[0]);
  assert.ok(open.plan.channel && open.plan.expectedAction);
  assert.ok(typeof open.check.score === "number");
  assert.ok(Array.isArray(open.act.suggestions));
  const locked = runPdca(MARKETING_POSTS.find((p) => p.textLocked)!);
  assert.equal(locked.act.nextVersionText, null);
  assert.ok(locked.act.suggestions.join("").includes("ロック") || locked.act.suggestions.length >= 1);
});

test("weakPoints は低スコア指標名を返す", () => {
  const wp = weakPoints(analyzePostMetrics({ title: "x", body: "短い" }));
  assert.ok(wp.length >= 1);
});

test("buildSuggestions はロック時に本文変更を促さない", () => {
  const m = analyzePostMetrics({ title: "x", body: "リリース" });
  const locked = buildSuggestions(m, true);
  assert.ok(locked.join("").includes("ロック"));
});

test("extractKnowledge は高スコア投稿からベストパターンを抽出", () => {
  const k = extractKnowledge(MARKETING_POSTS, 0);
  assert.ok(k.length >= 1);
  assert.ok(k[0].bestTitlePattern && k[0].bestCtaPattern && k[0].successfulCampaignTemplate);
});

test("秘書カードは統一形式で承認/高低スコア/繰り返しを含む", () => {
  const items = buildMarketingSecretaryItems();
  assert.ok(items.length >= 1);
  const cats = new Set(items.map((i) => i.category));
  assert.ok(cats.has("approval_request") || cats.has("kpi_warning"));
  for (const i of items) {
    assert.equal(i.sourceDepartment, "マーケティング部");
    assert.ok(i.summary && i.recommendedAction && i.suggestedNextStep);
    assert.equal(typeof i.approvalNeeded, "boolean");
  }
});

test("summarizeMarketingJa と本番投稿ロック", () => {
  assert.ok(summarizeMarketingJa().includes("マーケPDCA"));
  assert.equal(EXTERNAL_POSTING_ENABLED, false);
});
