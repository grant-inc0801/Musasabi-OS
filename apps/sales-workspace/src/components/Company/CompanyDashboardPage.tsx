import { useMemo } from "react";
import {
  COMMAND_DEPARTMENTS,
  DEPT_STATUS_COLOR,
  buildCompanyDashboard,
  withLiveSalesData,
} from "@musasabi/ai-company";
import { callLogStats } from "@musasabi/call-training";
import { countByStatus } from "@musasabi/sales-list";
import { loadCallLog } from "../../lib/callLogStorage";
import { loadLeads } from "../../lib/salesListStorage";
import { loadMemoryRecords } from "../../lib/memoryStorage";

// D-011 Core Departments Completion: 全社ダッシュボード。
// 全部署のKPIを1画面に集約する。営業部は実データ(テストコール履歴・営業リスト)を反映。
// deptId → 従来ページのマッピングは Command Center と同じ。

const DEPT_PAGE: Record<string, string> = {
  sales: "sales_kpi",
  support: "support",
  development: "development",
  publishing: "publishing",
  planning: "planning",
  market_research: "market_research",
  marketing: "marketing",
  accounting: "accounting",
  hr: "hr",
};

export function CompanyDashboardPage({ onOpenPage }: { onOpenPage: (page: string) => void }) {
  const dashboard = useMemo(() => {
    const stats = callLogStats(loadCallLog());
    const leadCounts = countByStatus(loadLeads());
    const recentLogs = loadMemoryRecords()
      .filter((r) => r.category === "work")
      .slice(0, 5)
      .map((r) => r.action);
    const live = {
      callCount: stats.sessionCount,
      appointmentCount: leadCounts.appointment,
      wonCount: leadCounts.won,
      notCalledCount: leadCounts.not_called,
      recentLogs,
    };
    return buildCompanyDashboard(withLiveSalesData(COMMAND_DEPARTMENTS, live));
  }, []);

  return (
    <>
      <section aria-label="全社サマリー">
        <h3 style={{ marginTop: 0 }}>全社サマリー</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          全部署のKPIを一元表示します(営業部はテストコール履歴・営業リストの実データを反映。
          その他はMock)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div className="card" style={{ minWidth: "9rem", textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>全社員数</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{dashboard.totalMembers}人</div>
          </div>
          <div className="card" style={{ minWidth: "9rem", textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>稼働中</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{dashboard.activeMembers}人</div>
          </div>
          <div className="card" style={{ minWidth: "9rem", textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>稼働率</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{dashboard.utilizationPercent}%</div>
          </div>
        </div>
      </section>

      <section aria-label="部署別KPI">
        <h3 style={{ marginTop: 0 }}>部署別KPI</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))",
            gap: "0.75rem",
          }}
        >
          {dashboard.departments.map((d) => (
            <div key={d.deptId} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    fontSize: 16,
                    background: "radial-gradient(circle at 32% 26%, #fff, #dfe3ea 62%, #c4c9d2)",
                    border: `2px solid ${DEPT_STATUS_COLOR[d.status]}`,
                  }}
                >
                  {d.icon}
                </span>
                <strong style={{ flex: 1 }}>{d.name}</strong>
                <span
                  className="dept-lamp"
                  style={{
                    background: DEPT_STATUS_COLOR[d.status],
                    boxShadow: `0 0 6px ${DEPT_STATUS_COLOR[d.status]}`,
                  }}
                />
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                {d.memberCount}人 / {d.statusLabel}
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {d.metrics.map((m) => (
                  <div key={m.label}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{m.label}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{m.value}</div>
                  </div>
                ))}
              </div>
              {DEPT_PAGE[d.deptId] && (
                <button
                  type="button"
                  style={{ alignSelf: "flex-start", marginTop: "0.2rem" }}
                  onClick={() => onOpenPage(DEPT_PAGE[d.deptId])}
                >
                  詳細を見る
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
