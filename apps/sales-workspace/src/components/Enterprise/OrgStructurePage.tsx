import {
  MOCK_EXECUTIVES,
  MOCK_MONTH_PROGRESS,
  EXECUTIVE_ROLE_LABEL_JA,
  EXECUTIVE_SCOPE,
  REQUIRED_DASHBOARDS,
  buildOrgChart,
  buildCommandChain,
  buildGovernanceDashboard,
} from "@musasabi/governance";

// AI組織構造(docs/ai-handoff/AI_ORGANIZATION_STRUCTURE.md)。
// 既存の組織モデルを拡張し、AI経営陣(役員層)・管掌本部・指揮系統・独立AI監査を表示する。
// すべて Mock・決定論。

export function OrgStructurePage() {
  const chart = buildOrgChart();
  const command = buildCommandChain();
  const dash = buildGovernanceDashboard(MOCK_EXECUTIVES, MOCK_MONTH_PROGRESS);
  const ceo = chart.find((n) => n.kind === "ceo")!;
  const execs = chart.filter((n) => n.kind === "executive");
  const audit = chart.find((n) => n.kind === "audit")!;

  return (
    <>
      <section aria-label="AI組織構造概要">
        <h2>AI組織構造(Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          Musasabi OS を AIカンパニーとして運営する標準組織構造です。既存の組織モデル
          (会社→本部→部門→部署)を拡張し、AI経営陣(役員層)・管掌本部・指揮系統・独立AI監査を表します。
        </p>
      </section>

      <section aria-label="AI組織図">
        <h3>AI組織図</h3>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <div className="org-node org-ceo">{ceo.label}</div>
          <div style={{ color: "var(--text-muted)" }}>▼</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
            {execs.map((e) => {
              const hq = chart.find((n) => n.kind === "headquarters" && n.parentId === e.id);
              return (
                <div key={e.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div className="org-node org-exec">{e.label}</div>
                  {hq && <div className="org-node org-hq">{hq.label}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <div className="org-node org-audit" title="経営層から独立">{audit.label}</div>
          </div>
        </div>
      </section>

      <section aria-label="指揮系統ビュー">
        <h3>指揮系統ビュー</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {command.chains.map((chain, i) => (
            <li key={i} style={{ margin: "0.2rem 0", fontSize: "0.9rem" }}>
              {chain.join(" → ")}
            </li>
          ))}
        </ul>
        <p style={{ color: "var(--warn)", fontSize: "0.85rem" }}>{command.independentLine}</p>
      </section>

      <section aria-label="役員KPIサマリー">
        <h3>役員KPIサマリー</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["役職", "管掌領域", "着地予測", "リスク"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {dash.statuses.map((s) => (
              <tr key={s.executive.role}>
                <td style={cell}>{EXECUTIVE_ROLE_LABEL_JA[s.executive.role]}</td>
                <td style={cell}>{EXECUTIVE_SCOPE[s.executive.role].focus}</td>
                <td style={{ ...cell, color: s.behindTarget ? "var(--warn)" : "inherit" }}>{s.forecastPercent}%</td>
                <td style={cell}>{s.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="必要ダッシュボード">
        <h3>必要ダッシュボード</h3>
        <ul>
          {REQUIRED_DASHBOARDS.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </section>
    </>
  );
}

const cell: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
