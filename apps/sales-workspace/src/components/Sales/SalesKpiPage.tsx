import { useEffect, useMemo, useState } from "react";
import { generateDailyPlan, recommendActions } from "@musasabi/ai-core";
import type { Lead } from "@musasabi/ai-core";
import { callLogStats } from "@musasabi/call-training";
import { countByStatus } from "@musasabi/sales-list";
import {
  SALES_ACTIVITY,
  SALES_MATERIAL_STATUS_COLOR,
  appointmentAchievementPct,
} from "@musasabi/ai-company";
import { loadCallLog } from "../../lib/callLogStorage";
import { loadLeads } from "../../lib/salesListStorage";
import { MOCK_LEADS } from "../../mockData";
import { DailyPlanBoard } from "../DailyPlanBoard";
import { LeadTable } from "../LeadTable";
import { RecommendedActionsList } from "../RecommendedActionsList";
import { HBarChart } from "../charts/HBarChart";
import {
  CALL_SERIES,
  EMPLOYEE_CALL_RESULTS,
  employeeName,
  callRates,
  totalCallResults,
} from "./callResults";

// 営業部 > KPI ページ(ユーザーFB+実データ化フェーズ)。
// 実データ(テストコール履歴・営業リスト)があれば最上部に「実データKPI」を表示し、
// Mock値のグラフ/表はMockと明示して残す。売上は表示しない。

/** 実データKPI(テストコール履歴+営業リスト)。データが無ければ null。 */
function useLiveKpi() {
  return useMemo(() => {
    const stats = callLogStats(loadCallLog());
    const leadCounts = countByStatus(loadLeads());
    const hasLive =
      stats.sessionCount > 0 ||
      leadCounts.appointment > 0 ||
      leadCounts.won > 0 ||
      leadCounts.not_called > 0 ||
      leadCounts.called > 0;
    if (!hasLive) return null;
    const appointmentRatePct =
      stats.sessionCount > 0
        ? Math.round((leadCounts.appointment / stats.sessionCount) * 100)
        : 0;
    const closeRatePct =
      leadCounts.appointment > 0
        ? Math.round((leadCounts.won / leadCounts.appointment) * 100)
        : 0;
    return {
      callCount: stats.sessionCount,
      completedPct:
        stats.sessionCount > 0
          ? Math.round((stats.completedCount / stats.sessionCount) * 100)
          : 0,
      appointment: leadCounts.appointment,
      won: leadCounts.won,
      notCalled: leadCounts.not_called,
      appointmentRatePct,
      closeRatePct,
    };
  }, []);
}

export function SalesKpiPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const live = useLiveKpi();

  useEffect(() => {
    const musasabi = window.musasabi;
    if (!musasabi) {
      return;
    }
    musasabi.getLeads().then(setLeads).catch(() => setLeads(MOCK_LEADS));
  }, []);

  const plan = generateDailyPlan(leads);
  const actions = recommendActions(leads);
  const leadsById = new Map(leads.map((lead) => [lead.id, lead]));

  const totals = totalCallResults();
  const totalRates = callRates(totals);

  const activity = SALES_ACTIVITY;
  const achievementPct = appointmentAchievementPct(activity);

  return (
    <>
      <section aria-label="本日の営業活動">
        <h3>本日の営業活動(Mock)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Zoom Phone / FileMaker 連携は後続フェーズ扱いです。現フェーズでは実接続しません。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <StatTile label="本日の架電予定" value={`${activity.plannedCalls}件`} />
          <StatTile label="本日のアポ目標" value={`${activity.appointmentGoal}件`} />
          <StatTile label="獲得アポ数" value={`${activity.appointmentsWon}件`} />
          <StatTile label="目標達成率" value={`${achievementPct}%`} />
        </div>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <h4 style={{ marginBottom: "0.3rem" }}>改善対象トーク</h4>
            <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
              {activity.improvementTargets.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "1 1 20rem" }}>
            <h4 style={{ marginBottom: "0.3rem" }}>よくある反論と推奨切り返し</h4>
            <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
              {activity.rebuttals.map((r) => (
                <li key={r.objection} style={{ marginBottom: "0.25rem" }}>
                  <strong>「{r.objection}」</strong>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    → {r.response}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <h4 style={{ marginBottom: "0.3rem" }}>営業資料作成依頼</h4>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {activity.materialRequests.map((m) => (
            <li key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, margin: "0.2rem 0" }}>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: SALES_MATERIAL_STATUS_COLOR[m.status],
                  boxShadow: `0 0 6px ${SALES_MATERIAL_STATUS_COLOR[m.status]}`,
                }}
              />
              {m.title}(依頼元: {m.requestedBy})— {m.status}
            </li>
          ))}
        </ul>
        <h4 style={{ marginBottom: "0.3rem" }}>次の営業アクション</h4>
        <ol>
          {activity.nextActions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      </section>

      {live ? (
        <section aria-label="実データKPI">
          <h3>実データKPI(テストコール履歴+営業リスト・実架電なし)</h3>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <StatTile label="架電数(テストコール累計)" value={`${live.callCount}件`} />
            <StatTile label="完了率" value={`${live.completedPct}%`} />
            <StatTile label="アポ獲得数(営業リスト)" value={`${live.appointment}件`} />
            <StatTile label="成約数(営業リスト)" value={`${live.won}件`} />
            <StatTile label="未架電リード" value={`${live.notCalled}件`} />
            <StatTile label="アポ率" value={`${live.appointmentRatePct}%`} />
            <StatTile label="成約率" value={`${live.closeRatePct}%`} />
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            アポ率=アポ獲得数÷架電数、成約率=成約数÷アポ獲得数。
            コマンドセンターの営業部パネルと同じデータソースです。
          </p>
        </section>
      ) : (
        <p style={{ color: "var(--warn)", fontSize: "0.9rem" }}>
          実データ(テストコール履歴・営業リスト)がまだありません。以下はMock表示です。
        </p>
      )}
      <section aria-label="全体KPI">
        <h3>全体KPI(Mock)</h3>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <StatTile label="架電数" value={`${totals.calls}件`} />
          <StatTile label="アポ獲得数" value={`${totals.appointments}件`} />
          <StatTile label="成約数" value={`${totals.deals}件`} />
          <StatTile label="アポ率" value={`${totalRates.appointmentRatePct}%`} />
          <StatTile label="成約率" value={`${totalRates.closeRatePct}%`} />
        </div>
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
        <h3>AI社員別KPI — グラフ(Mock)</h3>
        <HBarChart
          series={CALL_SERIES}
          rows={EMPLOYEE_CALL_RESULTS.map((r) => ({
            label: employeeName(r.employeeId),
            values: { calls: r.calls, appointments: r.appointments, deals: r.deals },
          }))}
          unit="件"
        />

        <h3>AI社員別KPI — 表(件数・率)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["AI社員", "架電数", "アポ獲得数", "成約数", "アポ率", "成約率"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EMPLOYEE_CALL_RESULTS.map((r) => {
              const rates = callRates(r);
              return (
                <tr key={r.employeeId}>
                  <td style={cellStyle}>
                    {employeeName(r.employeeId)}({r.employeeId})
                  </td>
                  <td style={cellStyleNum}>{r.calls}件</td>
                  <td style={cellStyleNum}>{r.appointments}件</td>
                  <td style={cellStyleNum}>{r.deals}件</td>
                  <td style={cellStyleNum}>{rates.appointmentRatePct}%</td>
                  <td style={cellStyleNum}>{rates.closeRatePct}%</td>
                </tr>
              );
            })}
            <tr>
              <td style={{ ...cellStyle, fontWeight: "bold" }}>合計 / 全体率</td>
              <td style={{ ...cellStyleNum, fontWeight: "bold" }}>{totals.calls}件</td>
              <td style={{ ...cellStyleNum, fontWeight: "bold" }}>{totals.appointments}件</td>
              <td style={{ ...cellStyleNum, fontWeight: "bold" }}>{totals.deals}件</td>
              <td style={{ ...cellStyleNum, fontWeight: "bold" }}>
                {totalRates.appointmentRatePct}%
              </td>
              <td style={{ ...cellStyleNum, fontWeight: "bold" }}>{totalRates.closeRatePct}%</td>
            </tr>
          </tbody>
        </table>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          アポ率=アポ獲得数÷架電数、成約率=成約数÷アポ獲得数。すべてMock値です。
        </p>
      </section>

      <DailyPlanBoard plan={plan} />
      <RecommendedActionsList actions={actions} leadsById={leadsById} />
      <LeadTable leads={leads} />
    </>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{label}</div>
      <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};

const cellStyleNum: React.CSSProperties = {
  ...cellStyle,
  textAlign: "right",
};
