import { useMemo, useState } from "react";
import {
  MOCK_ALERTS,
  MOCK_TIMELINE,
  MOCK_CEO_PROPOSALS,
  ALERT_LEVEL_LABEL_JA,
  ALERT_LEVEL_COLOR,
  PROPOSAL_STATUS_LABEL_JA,
  buildExecutiveCompanyMeter,
  sortAlertsByPriority,
  approveProposal,
  proposalToIssueDraft,
  rankEmployees,
  compositeScore,
  type CeoProposal,
} from "@musasabi/ceo-dashboard";
import { computeIntelligenceSummary } from "@musasabi/intelligence-layer";
import type { CommandDepartment } from "@musasabi/ai-company";

// Layer A: AI CEO 経営ダッシュボードの追加モジュール
// (経営メーター・アラート優先度・タイムライン・CEO提案ボックス・AI社員ランキング)。
// CEO_DASHBOARD_TWO_LAYER_UI_DIRECTIVE(D-20260709-003)。すべて Mock。

export function CeoDashboardPanel({ departments }: { departments: readonly CommandDepartment[] }) {
  const meter = useMemo(
    () => buildExecutiveCompanyMeter(departments.map((d) => d.progressPercent)),
    [departments],
  );
  const alerts = useMemo(() => sortAlertsByPriority(MOCK_ALERTS), []);
  const intel = useMemo(() => computeIntelligenceSummary(), []);
  const ranking = useMemo(() => rankEmployees(), []);
  const [proposals, setProposals] = useState<CeoProposal[]>(() => MOCK_CEO_PROPOSALS.map((p) => ({ ...p })));
  const [issueNote, setIssueNote] = useState<string | null>(null);

  function approve(id: string) {
    setProposals((prev) => prev.map((p) => (p.id === id ? approveProposal(p) : p)));
  }
  function createIssue(p: CeoProposal) {
    const draft = proposalToIssueDraft(p);
    if (!draft) return;
    setProposals((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: "issue_created" } : x)));
    setIssueNote(`Issueドラフトを作成しました(Mock): ${draft.title}`);
  }

  return (
    <section className="ceo-dash" aria-label="AI CEO 経営ダッシュボード">
      {/* 経営メーター */}
      <div className="ceo-card" aria-label="全社経営メーター">
        <h3>全社経営メーター</h3>
        <div className="ceo-meter-row">
          <Gauge label="全社進捗" value={meter.progressPercent} />
          <Gauge label="月次KPI" value={meter.monthlyKpiPercent} />
          <Gauge label="生産性" value={meter.productivityPercent} />
        </div>
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.85rem" }}>稼働健全性: <strong>{meter.healthLabel}</strong></p>
      </div>

      {/* アラート優先度 */}
      <div className="ceo-card" aria-label="アラート優先度">
        <h3>アラート優先度</h3>
        <ul className="ceo-list">
          {alerts.map((a) => (
            <li key={a.id}>
              <span className="ceo-badge" style={{ background: ALERT_LEVEL_COLOR[a.level] }}>
                {ALERT_LEVEL_LABEL_JA[a.level]}
              </span>{" "}
              <span style={{ color: "var(--text-muted)" }}>{a.department}</span> {a.message}
            </li>
          ))}
        </ul>
      </div>

      {/* リアルタイムタイムライン */}
      <div className="ceo-card" aria-label="リアルタイムタイムライン">
        <h3>リアルタイムタイムライン</h3>
        <ul className="ceo-list">
          {MOCK_TIMELINE.map((e) => (
            <li key={e.id}>
              <span style={{ color: "var(--text-muted)" }}>{e.timeLabel}</span>{" "}
              <strong>{e.department}</strong> {e.summary}
            </li>
          ))}
        </ul>
      </div>

      {/* CEO提案ボックス */}
      <div className="ceo-card" aria-label="AI CEO 提案ボックス">
        <h3>AI CEO 提案ボックス</h3>
        <ul className="ceo-list">
          {proposals.map((p) => (
            <li key={p.id}>
              <div><strong>{p.title}</strong> <span style={{ color: "var(--text-muted)" }}>— {p.from}</span></div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.detail}</div>
              <div style={{ marginTop: "0.2rem", display: "flex", gap: 6, alignItems: "center" }}>
                <span className="ceo-badge" style={{ background: "#334155" }}>{PROPOSAL_STATUS_LABEL_JA[p.status]}</span>
                {p.status === "submitted" && (
                  <button type="button" onClick={() => approve(p.id)}>承認(Mock)</button>
                )}
                {p.status === "approved" && (
                  <button type="button" onClick={() => createIssue(p)}>Issue作成(Mock)</button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {issueNote && <p style={{ color: "var(--ok)", fontSize: "0.8rem", margin: "0.3rem 0 0" }}>{issueNote}</p>}
      </div>

      {/* AI社員ランキング */}
      <div className="ceo-card" aria-label="AI社員ランキング">
        <h3>AI社員ランキング</h3>
        <ol className="ceo-rank">
          {ranking.map((e) => (
            <li key={e.name}>
              <strong>{e.name}</strong> <span style={{ color: "var(--text-muted)" }}>{e.department}</span>
              <span style={{ float: "right", fontWeight: 700 }}>{compositeScore(e)}</span>
            </li>
          ))}
        </ol>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
          総合スコア = 貢献・速度・品質・稼働率の加重 + 提案数(Mock)。
        </p>
      </div>

      {/* Musasabi Intelligence サマリー(MUSASABI_INTELLIGENCE_LAYER_DIRECTIVE §7) */}
      <div className="ceo-card" aria-label="Musasabi Intelligence サマリー">
        <h3>Musasabi Intelligence</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.8rem" }}>
          <span>ポリシー <b>{intel.policyCount}</b>(違反 {intel.policyViolations})</span>
          <span>ナレッジグラフ <b>{intel.graphNodes}</b>ノード</span>
          <span>WFテンプレ <b>{intel.workflowTemplates}</b></span>
          <span>説明アラート <b style={{ color: intel.explainabilityAlerts > 0 ? "#F59E0B" : "inherit" }}>{intel.explainabilityAlerts}</b></span>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>
          直近の意思決定: {intel.recentDecisions.join(" / ")}
        </p>
      </div>
    </section>
  );
}

function Gauge({ label, value }: { label: string; value: number }) {
  return (
    <div className="ceo-gauge">
      <div className="ceo-gauge-label">{label}</div>
      <div className="ceo-gauge-track"><div className="ceo-gauge-fill" style={{ width: `${value}%` }} /></div>
      <div className="ceo-gauge-value">{value}%</div>
    </div>
  );
}
