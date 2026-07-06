import { useEffect, useState } from "react";
import { calculateKpi, generateDailyPlan, recommendActions } from "@musasabi/ai-core";
import type { Lead } from "@musasabi/ai-core";
import type { CallAnalysisSummary } from "@musasabi/voice-analysis";
import {
  MOCK_DEPARTMENT_SUMMARIES,
  DEPARTMENT_STATUS_LABEL_JA,
  AI_EMPLOYEES,
} from "@musasabi/ai-company";
import { MOCK_CALLS, MOCK_LEADS } from "../../mockData";
import { DailyPlanBoard } from "../DailyPlanBoard";
import { LeadTable } from "../LeadTable";
import { RecommendedActionsList } from "../RecommendedActionsList";
import { MusaActionsPanel } from "../MusaActionsPanel";
import { CallAnalysisPanel } from "../CallAnalysisPanel";
import { CallTrainingPage } from "../CallTraining/CallTrainingPage";
import { HBarChart } from "../charts/HBarChart";
import type { BarSeries } from "../charts/HBarChart";

// 営業部ページ(D-20260706-006 + ユーザーFB)。ダッシュボードを営業部へ集約し、
// 全体KPI・各AI社員のKPI(コール結果)をグラフで表示する。売上は表示しない。
// コールシステム(Learning/Test/AutoCall)を中心に据える。データはすべてMock。

const salesSummary = MOCK_DEPARTMENT_SUMMARIES.find((d) => d.id === "dept-sales");

// コール結果の系列(検証済みダークパレット: 全チェックPASS)。
const CALL_SERIES: readonly BarSeries[] = [
  { key: "calls", label: "架電数", color: "#3987e5" },
  { key: "appointments", label: "アポ獲得数", color: "#199e70" },
  { key: "deals", label: "成約数", color: "#c98500" },
];

// AI社員別のコール結果(Mock実績。実データ連携は後続フェーズ)。
const EMPLOYEE_CALL_RESULTS: ReadonlyArray<{
  employeeId: string;
  calls: number;
  appointments: number;
  deals: number;
}> = [
  { employeeId: "MUSA-100", calls: 42, appointments: 6, deals: 2 },
  { employeeId: "MUSA-101", calls: 58, appointments: 9, deals: 3 },
  { employeeId: "MUSA-102", calls: 71, appointments: 11, deals: 4 },
  { employeeId: "MUSA-103", calls: 88, appointments: 10, deals: 3 },
  { employeeId: "MUSA-104", calls: 25, appointments: 3, deals: 1 },
  { employeeId: "MUSA-105", calls: 12, appointments: 1, deals: 0 },
];

function employeeName(id: string): string {
  return AI_EMPLOYEES.find((e) => e.id === id)?.name ?? id;
}

export function SalesDeptPage() {
  // window.musasabi はTauriデスクトップ内でのみ存在。ブラウザではMockへフォールバック。
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [callAnalysis, setCallAnalysis] = useState<CallAnalysisSummary | null>(null);

  useEffect(() => {
    const musasabi = window.musasabi;
    if (!musasabi) {
      return;
    }
    musasabi.getLeads().then(setLeads).catch(() => setLeads(MOCK_LEADS));
  }, []);

  const kpi = calculateKpi(MOCK_CALLS);
  const plan = generateDailyPlan(leads);
  const actions = recommendActions(leads);
  const leadsById = new Map(leads.map((lead) => [lead.id, lead]));

  const totals = EMPLOYEE_CALL_RESULTS.reduce(
    (sum, r) => ({
      calls: sum.calls + r.calls,
      appointments: sum.appointments + r.appointments,
      deals: sum.deals + r.deals,
    }),
    { calls: 0, appointments: 0, deals: 0 },
  );

  return (
    <>
      <section aria-label="営業部サマリー">
        <h2>営業部</h2>
        {salesSummary && (
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <StatTile label="AI社員" value={`${salesSummary.employeeCount}名`} />
            <StatTile label="本日進捗" value={`${salesSummary.progressPercent}%`} />
            <StatTile label="状態" value={DEPARTMENT_STATUS_LABEL_JA[salesSummary.status]} />
            <StatTile label="アポ率" value={`${Math.round(kpi.appointmentRate * 100)}%`} />
            <StatTile label="成約率" value={`${Math.round(kpi.winRate * 100)}%`} />
          </div>
        )}
        {salesSummary && (
          <p style={{ color: "#9aa3ba" }}>本日の作業: {salesSummary.todaySummary}(Mock)</p>
        )}
      </section>

      <section aria-label="全体KPI">
        <h3>全体KPI — コール結果(Mock)</h3>
        <HBarChart
          series={CALL_SERIES}
          rows={[
            {
              label: "営業部全体",
              values: {
                calls: totals.calls,
                appointments: totals.appointments,
                deals: totals.deals,
              },
            },
          ]}
          unit="件"
        />
      </section>

      <section aria-label="AI社員別KPI">
        <h3>AI社員別KPI — コール結果(Mock)</h3>
        <HBarChart
          series={CALL_SERIES}
          rows={EMPLOYEE_CALL_RESULTS.map((r) => ({
            label: employeeName(r.employeeId),
            values: { calls: r.calls, appointments: r.appointments, deals: r.deals },
          }))}
          unit="件"
        />
      </section>

      <CallTrainingPage />

      <MusaActionsPanel onCallAnalysisComplete={setCallAnalysis} />
      <CallAnalysisPanel summary={callAnalysis} />
      <DailyPlanBoard plan={plan} />
      <RecommendedActionsList actions={actions} leadsById={leadsById} />
      <LeadTable leads={leads} />
    </>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>{label}</div>
      <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
