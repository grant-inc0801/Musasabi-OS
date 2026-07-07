import assert from "node:assert/strict";
import { test } from "node:test";

import {
  COMMAND_DEPARTMENTS,
  DEPT_CONNECTIONS,
  DEPT_STATUS_COLOR,
  DEPT_STATUSES,
  buildAssistantSummaryJa,
  summarizeCompany,
} from "./commandCenter";

test("初期部署は9部署で、ステータス色は4種すべて定義されている", () => {
  assert.equal(COMMAND_DEPARTMENTS.length, 9);
  assert.equal(DEPT_STATUSES.length, 4);
  assert.equal(DEPT_STATUS_COLOR.done, "#22C55E");
  assert.equal(DEPT_STATUS_COLOR.working, "#FACC15");
  assert.equal(DEPT_STATUS_COLOR.error, "#EF4444");
  assert.equal(DEPT_STATUS_COLOR.waiting_approval, "#A855F7");
});

test("部署間連携は存在する部署IDのみを参照する", () => {
  const ids = new Set(COMMAND_DEPARTMENTS.map((d) => d.id));
  for (const c of DEPT_CONNECTIONS) {
    assert.ok(ids.has(c.from), c.from);
    assert.ok(ids.has(c.to), c.to);
  }
});

test("summarizeCompany は総員・稼働中(完了/作業中)・稼働率を集計する", () => {
  const overview = summarizeCompany(COMMAND_DEPARTMENTS);
  assert.equal(overview.totalMembers, 37);
  // 完了(8+4+2)+作業中(5+2+5)=26
  assert.equal(overview.activeMembers, 26);
  assert.equal(overview.utilizationPercent, Math.round((26 / 37) * 100));
});

test("withLiveSalesData は営業部へ実データを反映し、データ無しならMockを維持する", async () => {
  const { withLiveSalesData } = await import("./commandCenter");
  // データ無し → 変更なし
  const noData = withLiveSalesData(COMMAND_DEPARTMENTS, {
    callCount: 0,
    appointmentCount: 0,
    wonCount: 0,
    notCalledCount: 0,
    recentLogs: [],
  });
  assert.deepEqual(noData, [...COMMAND_DEPARTMENTS]);
  // 実データあり → ステータス/進捗/ログが更新される(未架電あり=作業中)
  const live = withLiveSalesData(COMMAND_DEPARTMENTS, {
    callCount: 3,
    appointmentCount: 2,
    wonCount: 1,
    notCalledCount: 7,
    recentLogs: ["14:00 テストコール開始", "14:05 議事録を自動作成"],
  });
  const sales = live.find((d) => d.id === "sales");
  assert.equal(sales?.status, "working");
  assert.equal(sales?.progressPercent, Math.round((3 / 10) * 100));
  assert.deepEqual(sales?.logs, ["14:00 テストコール開始", "14:05 議事録を自動作成"]);
  // 他部署・元配列は不変
  assert.equal(live.find((d) => d.id === "hr")?.status, "waiting_approval");
  assert.equal(COMMAND_DEPARTMENTS.find((d) => d.id === "sales")?.status, "done");
  // 未架電0なら完了
  const done = withLiveSalesData(COMMAND_DEPARTMENTS, {
    callCount: 1,
    appointmentCount: 1,
    wonCount: 1,
    notCalledCount: 0,
    recentLogs: [],
  });
  assert.equal(done.find((d) => d.id === "sales")?.status, "done");
});

test("buildAssistantSummaryJa は承認待ち・エラー原因/解決策・全体進行を要約する", () => {
  const text = buildAssistantSummaryJa(COMMAND_DEPARTMENTS);
  assert.ok(text.includes("出版部と人事部で承認待ち"));
  assert.ok(text.includes("システム開発部ではエラー"));
  assert.ok(text.includes("認証期限切れ"));
  assert.ok(text.includes("APIキーを更新"));
  assert.ok(text.includes("全体の進行状況は約"));
  // 決定的
  assert.equal(text, buildAssistantSummaryJa(COMMAND_DEPARTMENTS));
});

test("市場調査部・出版部クリーン運営のMockデータが整合している(D-20260706-009)", async () => {
  const {
    AI_TECHNOLOGY_ITEMS,
    AI_SERVICE_ITEMS,
    AI_SERVICE_EVALUATIONS,
    AI_COMBINATION_CANDIDATES,
    HANDOFF_PROPOSALS,
    MARKET_RESEARCH_STAFF,
    PUBLISHING_CLEAN_CHECKS,
    PUBLISHING_STAFF,
    buildMarketResearchKpi,
    buildResearchAndPublishingSummaryJa,
  } = await import("./marketResearch");
  // 市場調査部が部署一覧に存在する
  assert.ok(COMMAND_DEPARTMENTS.some((d) => d.id === "market_research" && d.name === "市場調査部"));
  // KPIはMockデータと整合する
  const kpi = buildMarketResearchKpi();
  assert.equal(kpi.collectedToday, AI_TECHNOLOGY_ITEMS.length);
  assert.equal(kpi.newServicesFound, AI_SERVICE_ITEMS.length);
  assert.equal(kpi.evaluations, AI_SERVICE_EVALUATIONS.length);
  assert.equal(
    kpi.devHandoffs + kpi.planningHandoffs,
    HANDOFF_PROPOSALS.filter((p) => p.target !== "CEO").length,
  );
  assert.ok(kpi.ceoPending >= 1);
  // AI社員は各5名、組み合わせ候補は3件、出版前チェックは9項目
  assert.equal(MARKET_RESEARCH_STAFF.length, 5);
  assert.equal(PUBLISHING_STAFF.length, 5);
  assert.equal(AI_COMBINATION_CANDIDATES.length, 3);
  assert.equal(PUBLISHING_CLEAN_CHECKS.length, 9);
  // 吹き出し要約: 市場調査部の発見と出版部の承認待ちが含まれる
  const lines = buildResearchAndPublishingSummaryJa();
  assert.ok(lines.some((l) => l.includes("市場調査部が新しいAIサービスを")));
  assert.ok(lines.some((l) => l.includes("出版部で") && l.includes("承認待ち")));
  // buildAssistantSummaryJa 経由でも含まれる
  const summary = buildAssistantSummaryJa(COMMAND_DEPARTMENTS);
  assert.ok(summary.includes("市場調査部が新しいAIサービスを"));
});
