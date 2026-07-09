import { useMemo } from "react";
import {
  COMMAND_DEPARTMENTS,
  buildApprovalQueue,
  buildOperationsOverview,
  withLiveSalesData,
} from "@musasabi/ai-company";
import { callLogStats } from "@musasabi/call-training";
import { countByStatus } from "@musasabi/sales-list";
import { loadCallLog } from "../../lib/callLogStorage";
import { loadLeads } from "../../lib/salesListStorage";
import { loadMemoryRecords } from "../../lib/memoryStorage";

// D-016 AI Company Operation: 会社運営ビュー。承認待ちを一元化した承認キューと、
// 稼働状況の総括を表示する。各機能への導線も提供する。すべてMock(実実行なし)。

const SOURCE_PAGE: Record<string, string> = {
  部署: "company_dashboard",
  ワークフロー: "workflow",
  コラボレーション: "collaboration",
};

export function OperationsPage({ onOpenPage }: { onOpenPage: (page: string) => void }) {
  const { overview, queue } = useMemo(() => {
    const stats = callLogStats(loadCallLog());
    const leadCounts = countByStatus(loadLeads());
    const recentLogs = loadMemoryRecords()
      .filter((r) => r.category === "work")
      .slice(0, 5)
      .map((r) => r.action);
    const departments = withLiveSalesData(COMMAND_DEPARTMENTS, {
      callCount: stats.sessionCount,
      appointmentCount: leadCounts.appointment,
      wonCount: leadCounts.won,
      notCalledCount: leadCounts.not_called,
      recentLogs,
    });
    return {
      overview: buildOperationsOverview(departments),
      queue: buildApprovalQueue(departments),
    };
  }, []);

  const tiles = [
    { label: "全社員数", value: `${overview.totalMembers}人` },
    { label: "稼働率", value: `${overview.utilizationPercent}%` },
    { label: "承認待ち(合計)", value: `${overview.approvalQueueCount}件` },
    { label: "進行中WF", value: `${overview.runningWorkflows}件` },
    { label: "連携中", value: `${overview.collabInProgress}件` },
  ];

  return (
    <>
      <section aria-label="運営サマリー">
        <h3 style={{ marginTop: 0 }}>AIカンパニー・オペレーション</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          会社全体の稼働状況と、承認待ち事項を一元管理します。承認は各機能の画面で行います
          (すべてMock・実実行なし)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {tiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "8.5rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="承認キュー">
        <h3 style={{ marginTop: 0 }}>承認キュー(全社の承認待ち)</h3>
        {queue.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>承認待ちの事項はありません。</p>
        ) : (
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["区分", "内容", "詳細", ""].map((h) => (
                  <th key={h} style={cellStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map((i) => (
                <tr key={i.id}>
                  <td style={cellStyle}>{i.source}</td>
                  <td style={cellStyle}>
                    {i.icon} {i.title}
                  </td>
                  <td style={cellStyle}>{i.detail}</td>
                  <td style={cellStyle}>
                    <button type="button" onClick={() => onOpenPage(SOURCE_PAGE[i.source] ?? "company_dashboard")}>
                      確認
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          承認・実行(実架電/実出版/実API接続等)は安全ゲートにより本フェーズでは無効です。
        </p>
      </section>

      <section aria-label="運営の導線">
        <h3 style={{ marginTop: 0 }}>運営メニュー</h3>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {[
            { label: "全社ダッシュボード", page: "company_dashboard" },
            { label: "ワークフロー", page: "workflow" },
            { label: "コラボレーション", page: "collaboration" },
            { label: "AI改善提案 / 自己進化", page: "improvement" },
            { label: "ワークスペース", page: "workspace" },
          ].map((m) => (
            <button key={m.page} type="button" onClick={() => onOpenPage(m.page)}>
              {m.label}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
