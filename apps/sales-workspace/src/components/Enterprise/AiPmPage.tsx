import { useState } from "react";
import {
  MOCK_PROPOSALS,
  MOCK_DEPARTMENT_KPIS,
  PROPOSAL_CATEGORY_LABEL_JA,
  EXECUTION_STAGE_LABEL_JA,
  buildExecutionQueue,
  buildExecutiveSummary,
  approveProposal,
  type ExecutionItem,
} from "@musasabi/ai-pm";

// Phase 4: Autonomous Enterprise(D-20260708-005)。AI PM の実行キュー・経営サマリー・
// 部門KPI。承認必須の提案は「保留(承認待ち)」で、承認ボタンでのみ前進する。

export function AiPmPage() {
  const [queue, setQueue] = useState<ExecutionItem[]>(() => buildExecutionQueue(MOCK_PROPOSALS));
  const summary = buildExecutiveSummary(MOCK_PROPOSALS, MOCK_DEPARTMENT_KPIS);

  function approve(id: string) {
    setQueue((prev) => prev.map((it) => (it.proposal.id === id ? approveProposal(it) : it)));
  }

  return (
    <>
      <section aria-label="AI PM 経営サマリー">
        <h2>AI PM / 自律経営(Phase 4・Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          AI PM が部門横断で改善提案を優先順位付けし、実行キューをレビューゲート付きで管理します。
          本番・財務・法務・外部影響を伴う提案は人間承認が必須です(すべて Mock)。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="提案数" value={`${summary.totalProposals}`} />
          <StatTile label="承認待ち" value={`${summary.approvalPending}`} />
          <StatTile label="実行中" value={`${summary.activeExecution}`} />
          <StatTile label="平均稼働率" value={`${summary.avgUtilization}%`} />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          {summary.lines.map((l, i) => (
            <p key={i} style={{ margin: "0.15rem 0", color: "var(--text-muted)" }}>{l}</p>
          ))}
        </div>
      </section>

      <section aria-label="実行キュー">
        <h3>実行キュー(優先順)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["#", "提案", "部門", "カテゴリ", "効果/労力", "ステージ", "操作"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {queue.map((it) => (
              <tr key={it.proposal.id}>
                <td style={cell}>{it.rank}</td>
                <td style={cell}>{it.proposal.title}</td>
                <td style={cell}>{it.proposal.department}</td>
                <td style={cell}>{PROPOSAL_CATEGORY_LABEL_JA[it.proposal.category]}</td>
                <td style={cell}>{it.proposal.impact} / {it.proposal.effort}</td>
                <td style={cell}>{EXECUTION_STAGE_LABEL_JA[it.stage]}</td>
                <td style={cell}>
                  {it.stage === "blocked" ? (
                    <button type="button" onClick={() => approve(it.proposal.id)}>承認する</button>
                  ) : it.stage === "approved" ? (
                    "承認済み ✓"
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="部門KPI">
        <h3>部門KPI(Mock)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["部門", "稼働率", "完了", "保留"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {MOCK_DEPARTMENT_KPIS.map((k) => (
              <tr key={k.department}>
                <td style={cell}>{k.department}</td>
                <td style={cell}>{k.utilizationPercent}%</td>
                <td style={cell}>{k.completedTasks}</td>
                <td style={cell}>{k.pendingTasks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
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

const cell: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
