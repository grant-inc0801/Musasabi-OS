import {
  MOCK_EXECUTIVES,
  MOCK_MONTH_PROGRESS,
  EXECUTIVE_ROLE_LABEL_JA,
  RISK_LABEL_JA,
  CHANGE_KIND_LABEL_JA,
  requiresGovernanceApproval,
  buildGovernanceDashboard,
  type RiskLevel,
  type ChangeKind,
} from "@musasabi/governance";

// AI Executive Governance(docs/ai-handoff/AI_EXECUTIVE_GOVERNANCE.md)。
// AI経営陣の月次予算・KPI・着地予測・リスク・推奨アクション・経営サマリーを表示する。
// すべて Mock。実予算執行・実戦略変更は行わない(大きな変更はガバナンス承認が必要)。

const RISK_COLOR: Record<RiskLevel, string> = {
  low: "#22C55E",
  medium: "#FACC15",
  high: "#EF4444",
};

const CHANGE_KINDS: ChangeKind[] = ["strategy", "budget_reallocation", "org_change", "pricing", "routine_task"];

export function GovernancePage() {
  const dash = buildGovernanceDashboard(MOCK_EXECUTIVES, MOCK_MONTH_PROGRESS);
  const fmt = (n: number) => `¥${n.toLocaleString()}`;

  return (
    <>
      <section aria-label="ガバナンス概要">
        <h2>AI経営ガバナンス(Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          AI経営陣(CEO/COO/CTO/CFO/CMO/CPO/CHRO/PM)が月次予算・KPI・部門目標を持ち、
          着地を予測して遅延時は自動で再優先付け・リソース再配分・是正提案・CEOエスカレーションを行います。
          大きな戦略・組織・価格変更にはガバナンス承認(人間)が必要です。実予算執行はしません。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="月経過" value={`${dash.monthProgressPercent}%`} />
          <StatTile label="経営陣" value={`${dash.statuses.length}`} />
          <StatTile label="目標遅延" value={`${dash.behindCount}`} />
          <StatTile label="高リスク" value={`${dash.highRiskCount}`} />
          <StatTile label="全社予算消化" value={fmt(dash.totalBudgetUsed)} />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          {dash.summaryLines.map((l, i) => (
            <p key={i} style={{ margin: "0.15rem 0", color: "var(--text-muted)" }}>{l}</p>
          ))}
        </div>
      </section>

      <section aria-label="経営ダッシュボード">
        <h3>役員別ダッシュボード</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", whiteSpace: "nowrap" }}>
            <thead>
              <tr>{["役職", "KPI", "実績/目標", "予算消化", "着地予測", "リスク", "推奨アクション"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {dash.statuses.map((s) => (
                <tr key={s.executive.role}>
                  <td style={cell}>{EXECUTIVE_ROLE_LABEL_JA[s.executive.role]}</td>
                  <td style={cell}>{s.executive.kpiName}</td>
                  <td style={cell}>{s.executive.kpiActual} / {s.executive.kpiTarget}({s.kpiAttainmentPercent}%)</td>
                  <td style={cell}>{s.executive.monthlyBudget > 0 ? `${fmt(s.executive.budgetUsed)}(${s.budgetUsagePercent}%)` : "—"}</td>
                  <td style={{ ...cell, fontWeight: s.behindTarget ? "bold" : "normal", color: s.behindTarget ? "var(--warn)" : "inherit" }}>
                    {s.forecastPercent}%
                  </td>
                  <td style={cell}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: RISK_COLOR[s.risk], display: "inline-block" }} />
                      {RISK_LABEL_JA[s.risk]}
                    </span>
                  </td>
                  <td style={cell}>{s.actions.join("、")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="ガバナンス承認">
        <h3>ガバナンス承認が必要な変更</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {CHANGE_KINDS.map((k) => (
            <li key={k} style={{ margin: "0.2rem 0" }}>
              {CHANGE_KIND_LABEL_JA[k]}:{" "}
              <strong style={{ color: requiresGovernanceApproval(k) ? "var(--warn)" : "var(--ok)" }}>
                {requiresGovernanceApproval(k) ? "人間承認が必要" : "承認不要"}
              </strong>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{label}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

const cell: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
