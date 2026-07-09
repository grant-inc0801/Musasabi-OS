import {
  MARKET_RESEARCH_REPORTS,
  RESEARCH_STATUS_LABEL_JA,
  PRIORITY_LABEL_JA,
  PRIORITY_COLOR,
} from "@musasabi/ai-secretary";

// 市場調査部: 標準サービス調査レポート(MARKET_RESEARCH_AND_MARKETING_DEPARTMENT_DIRECTIVE.md)。
// 他部署の新サービス提案に対し、統一フォーマットで調査レポートを提示(Mock・有償データ/外部API不使用)。
// 要約は AI秘書 右パネルへ集約。

const cell: React.CSSProperties = { border: "1px solid var(--border)", padding: "0.3rem 0.5rem", textAlign: "left", verticalAlign: "top" };

export function ResearchReportsSection() {
  return (
    <section aria-label="標準サービス調査レポート">
      <h3>標準サービス調査レポート(Mock)</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
        新サービス提案に対し、統一フォーマットで市場規模・競合・差別化・価格・機会スコアを調査します。
        有償データ・外部APIは使用しません(Mock)。要約は AI秘書パネルへ送られます。
      </p>
      {MARKET_RESEARCH_REPORTS.map((r) => (
        <div key={r.id} className="card" style={{ marginBottom: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <strong>{r.proposalTitle}</strong>
            <span className="badge" style={{ fontSize: "0.68rem" }}>{RESEARCH_STATUS_LABEL_JA[r.researchStatus]}</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>依頼: {r.sourceDepartment} / {r.requestingAiEmployee}</span>
            <span style={{ marginLeft: "auto", fontSize: "0.74rem" }}>
              機会スコア <b>{r.opportunityScore}</b> / リスク <b style={{ color: PRIORITY_COLOR[r.riskLevel] }}>{PRIORITY_LABEL_JA[r.riskLevel]}</b>
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden", margin: "0.3rem 0" }}>
            <div style={{ width: `${r.opportunityScore}%`, height: "100%", background: r.opportunityScore >= 70 ? "#22C55E" : "#F59E0B" }} />
          </div>
          <dl className="secretary-fields" style={{ margin: "0.2rem 0" }}>
            <div><dt>市場規模</dt><dd>{r.marketSizeSummary}</dd></div>
            <div><dt>ターゲット</dt><dd>{r.targetCustomer}</dd></div>
            <div><dt>差別化</dt><dd>{r.differentiationPoints.join(" / ")}</dd></div>
            <div><dt>価格比較</dt><dd>{r.pricingComparison}</dd></div>
            <div><dt>推奨戦略</dt><dd>{r.recommendedStrategy}</dd></div>
            <div><dt>次アクション</dt><dd>{r.nextAction}</dd></div>
            <div><dt>承認要否</dt><dd>{r.approvalNeeded ? "必要" : "不要"}</dd></div>
          </dl>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.2rem 0" }}>競合比較(トップ3)</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "0.74rem", minWidth: "32rem" }}>
              <thead><tr>{["競合", "強み", "弱み", "価格"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr></thead>
              <tbody>
                {r.competitorComparison.map((c) => (
                  <tr key={c.name}>
                    <td style={cell}>{c.name}</td>
                    <td style={cell}>{c.strength}</td>
                    <td style={cell}>{c.weakness}</td>
                    <td style={cell}>{c.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}
