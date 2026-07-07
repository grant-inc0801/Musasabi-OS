import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  ACCOUNTING_STAFF,
  HIRING_PLANS,
  HR_MEMBER_RECORDS,
  HR_STAFF,
  LEDGER_ENTRIES,
  MARKETING_CAMPAIGNS,
  MARKETING_STAFF,
  SNS_POST_PLANS,
  buildAccountingSummary,
  buildHrKpi,
  buildMarketingKpi,
} from "./backOffice";
import { COMMAND_DEPARTMENTS } from "./commandCenter";

test("マーケティングKPIはMockデータと整合する", () => {
  const kpi = buildMarketingKpi();
  assert.equal(kpi.activeCampaigns, MARKETING_CAMPAIGNS.filter((c) => c.status === "配信中").length);
  assert.equal(
    kpi.totalLeads,
    MARKETING_CAMPAIGNS.reduce((s, c) => s + c.leads, 0),
  );
  assert.ok(kpi.averageCvrPercent > 0);
  assert.equal(kpi.postsPlanned, SNS_POST_PLANS.length);
  assert.ok(kpi.postsPublished >= 1);
});

test("経理サマリーは確定分のみ集計し未確定は件数へ", () => {
  const s = buildAccountingSummary();
  assert.equal(s.incomeJpy, 200000);
  assert.equal(s.expenseJpy, 18000);
  assert.equal(s.balanceJpy, s.incomeJpy - s.expenseJpy);
  assert.equal(s.pendingCount, LEDGER_ENTRIES.filter((e) => e.status !== "確定").length);
  assert.ok(s.pendingCount >= 1);
});

test("人事KPIは稼働・評価・採用計画から導出される", () => {
  const kpi = buildHrKpi();
  assert.ok(kpi.averageUtilizationPercent > 0 && kpi.averageUtilizationPercent <= 100);
  assert.equal(
    kpi.topEvaluations,
    HR_MEMBER_RECORDS.filter((r) => r.evaluation === "S" || r.evaluation === "A").length,
  );
  assert.equal(
    kpi.hiringPlanned,
    HIRING_PLANS.reduce((s, p) => s + p.headcount, 0),
  );
  assert.equal(kpi.hiringPendingApproval, 1);
});

test("AI社員数は部署一覧(Command Center)の人数と整合する", () => {
  const byId = new Map(COMMAND_DEPARTMENTS.map((d) => [d.id, d.memberCount]));
  assert.equal(MARKETING_STAFF.length, byId.get("marketing"));
  assert.equal(ACCOUNTING_STAFF.length, byId.get("accounting"));
  assert.equal(HR_STAFF.length, byId.get("hr"));
});
