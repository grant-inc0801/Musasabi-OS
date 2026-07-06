import { useEffect, useState } from "react";
import { generateDailyPlan, recommendActions } from "@musasabi/ai-core";
import type { Lead } from "@musasabi/ai-core";
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

// 営業部 > KPI ページ(ユーザーFB)。コール結果をグラフと表の両方で表示し、
// 件数(架電/アポ/成約)と率(アポ率/成約率)を算出する。売上は表示しない。
// データはすべてMock(実データ連携は後続フェーズ)。

export function SalesKpiPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

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

  return (
    <>
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
        <p style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>
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
      <div style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>{label}</div>
      <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid rgba(151,168,205,0.16)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};

const cellStyleNum: React.CSSProperties = {
  ...cellStyle,
  textAlign: "right",
};
