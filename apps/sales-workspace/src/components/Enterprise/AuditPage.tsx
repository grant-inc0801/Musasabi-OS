import { useState } from "react";
import {
  MOCK_FINDINGS,
  FINDING_CATEGORY_LABEL_JA,
  SEVERITY_LABEL_JA,
  CORRECTIVE_STATUS_LABEL_JA,
  AUDIT_PERIOD_LABEL_JA,
  buildAuditReport,
  rankDepartmentRisk,
  shouldRecommendPause,
  type AuditPeriod,
  type Severity,
} from "@musasabi/audit";

// AI Audit and Risk Governance(docs/ai-handoff/AI_AUDIT_AND_RISK_GOVERNANCE.md)。
// 独立監査ダッシュボード: 活動中リスク・ポリシー遵守・監査所見・是正状況・
// 部門リスクスコア・経営サマリー。監査は直接停止せず「一時停止提案」を出す(人間承認)。

const SEVERITY_COLOR: Record<Severity, string> = {
  low: "#6b7280",
  medium: "#FACC15",
  high: "#F97316",
  critical: "#EF4444",
};

const PERIODS: AuditPeriod[] = ["daily", "weekly", "monthly"];

export function AuditPage() {
  const [period, setPeriod] = useState<AuditPeriod>("daily");
  const report = buildAuditReport(period, MOCK_FINDINGS);
  const ranked = rankDepartmentRisk(MOCK_FINDINGS);

  return (
    <>
      <section aria-label="監査サマリー">
        <h2>AI監査・リスクガバナンス(Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          独立した AI 監査機能が、ワークフロー実行・ガバナンス遵守・運用リスクを継続監視し、
          異常・ポリシー違反・KPI整合性・承認遵守を検知します。監査は本番データを直接変更せず、
          高リスク操作については<strong>一時停止の提案(人間承認前提)</strong>のみを行います。
        </p>
        <div style={{ marginBottom: "0.5rem" }}>
          監査期間:{" "}
          <select value={period} onChange={(e) => setPeriod(e.target.value as AuditPeriod)}>
            {PERIODS.map((p) => <option key={p} value={p}>{AUDIT_PERIOD_LABEL_JA[p]}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="所見総数" value={`${report.totalFindings}`} />
          <StatTile label="未是正" value={`${report.openFindings}`} />
          <StatTile label="一時停止提案" value={`${report.pauseRecommendations}`} />
          <StatTile label="ポリシー遵守率" value={`${report.policyCompliancePercent}%`} />
          <StatTile label="最高リスク部門" value={report.topRiskDepartment ?? "—"} />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          {report.lines.map((l, i) => (
            <p key={i} style={{ margin: "0.15rem 0", color: "var(--text-muted)" }}>{l}</p>
          ))}
        </div>
      </section>

      <section aria-label="監査所見">
        <h3>監査所見</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["カテゴリ", "重大度", "部門", "内容", "是正状況", "推奨アクション", "一時停止提案"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {MOCK_FINDINGS.map((f) => (
              <tr key={f.id}>
                <td style={cell}>{FINDING_CATEGORY_LABEL_JA[f.category]}</td>
                <td style={cell}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: SEVERITY_COLOR[f.severity], display: "inline-block" }} />
                    {SEVERITY_LABEL_JA[f.severity]}
                  </span>
                </td>
                <td style={cell}>{f.department}</td>
                <td style={cell}>{f.description}</td>
                <td style={cell}>{CORRECTIVE_STATUS_LABEL_JA[f.status]}</td>
                <td style={cell}>{f.recommendedAction}</td>
                <td style={cell}>{shouldRecommendPause(f) ? <strong style={{ color: "var(--warn)" }}>提案(承認待ち)</strong> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="部門リスクスコア">
        <h3>部門リスクスコア(未是正所見の重大度合計)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["部門", "リスクスコア"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {ranked.map((r) => (
              <tr key={r.department}>
                <td style={cell}>{r.department}</td>
                <td style={cell}>{r.score}</td>
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
      <div style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

const cell: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
