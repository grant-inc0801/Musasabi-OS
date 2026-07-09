import { useMemo, useState } from "react";
import {
  POLICY_RULES,
  RULE_CATEGORY_LABEL_JA,
  RULE_LEVEL_LABEL_JA,
  GRAPH_NODES,
  GRAPH_EDGES,
  NODE_TYPE_LABEL_JA,
  WORKFLOW_TEMPLATES,
  WF_NODE_LABEL_JA,
  EXPLAINABILITY_REPORTS,
  AUDIT_MONITORS,
  BRAIN_ARTIFACTS,
  validateDecision,
  relatedNodes,
  validateWorkflow,
  computeIntelligenceSummary,
  summarizeIntelligenceJa,
  type ExplainabilityReport,
} from "@musasabi/intelligence-layer";

// Musasabi Intelligence Layer(MUSASABI_INTELLIGENCE_LAYER_DIRECTIVE.md)。
// Company Brain の上位レイヤー: AI Policy Engine / Knowledge Graph / Workflow Composer /
// Explainability Center を可視化。すべて Mock・決定論。実強制・本番実行は承認までロック。

const cell: React.CSSProperties = { border: "1px solid var(--border)", padding: "0.28rem 0.5rem", textAlign: "left", verticalAlign: "top" };

function ScoreBar({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  const good = invert ? value < 40 : value >= 70;
  return (
    <div style={{ fontSize: "0.72rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>{label}</span><span>{value}</span></div>
      <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: good ? "#22C55E" : "#F59E0B" }} />
      </div>
    </div>
  );
}

function WhyPanel({ r }: { r: ExplainabilityReport }) {
  return (
    <div className="card" style={{ marginTop: "0.35rem", fontSize: "0.76rem" }}>
      <dl className="secretary-fields" style={{ margin: 0 }}>
        <div><dt>理由</dt><dd>{r.reason}</dd></div>
        <div><dt>根拠</dt><dd>{r.evidence}</dd></div>
        <div><dt>使用ナレッジ</dt><dd>{r.usedKnowledge}</dd></div>
        <div><dt>使用ポリシー</dt><dd>{r.usedPolicy}</dd></div>
        <div><dt>使用WF</dt><dd>{r.usedWorkflow}</dd></div>
        <div><dt>KPI影響</dt><dd>{r.kpiImpact}</dd></div>
        <div><dt>リスク</dt><dd>{r.risk}</dd></div>
        <div><dt>ROI</dt><dd>{r.roi}</dd></div>
        <div><dt>期待効果</dt><dd>{r.expectedBenefit}</dd></div>
        <div><dt>承認要否</dt><dd>{r.requiredApproval ? "必要" : "不要"}</dd></div>
        <div><dt>次アクション</dt><dd>{r.nextAction}</dd></div>
      </dl>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(9rem, 1fr))", gap: "0.3rem 0.8rem", marginTop: "0.35rem" }}>
        <ScoreBar label="確信度" value={r.scores.confidence} />
        <ScoreBar label="根拠強度" value={r.scores.evidenceStrength} />
        <ScoreBar label="リスク" value={r.scores.risk} invert />
        <ScoreBar label="コスト" value={r.scores.cost} invert />
        <ScoreBar label="期待効果" value={r.scores.expectedBenefit} />
      </div>
    </div>
  );
}

export function IntelligenceLayerPage() {
  const [graphFocus, setGraphFocus] = useState("prj-meishi-launch");
  const [whyFor, setWhyFor] = useState<string | null>(null);
  const summary = useMemo(() => computeIntelligenceSummary(), []);
  const related = useMemo(() => relatedNodes(graphFocus), [graphFocus]);

  // Decision Validation デモ(決定論)
  const demoOk = useMemo(() => validateDecision({ id: "demo-ok", title: "Mock改善提案", department: "開発部", external: false, paid: false, impact: "medium", risk: "low" }), []);
  const demoNg = useMemo(() => validateDecision({ id: "demo-ng", title: "実SNS接続", department: "マーケ部", external: true, paid: true, impact: "high", risk: "medium" }), []);

  return (
    <>
      <section aria-label="Intelligence Layer 概要">
        <h2>Musasabi Intelligence Layer(Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "52rem" }}>
          Company Brain の上位レイヤーとして、判断品質・ナレッジ関係・ワークフロー設計・説明可能性を全AI社員へ提供します。
          構成: <strong>AI CEO → Intelligence Layer → Company Brain / ワークフロー / 部署 / AI社員</strong>。
          重要な提案は実行前に本レイヤーの検証を参照します。実ポリシー強制・実実行は Production Readiness 承認まで無効です。
        </p>
        <p style={{ color: "var(--accent, #6c8cff)", fontSize: "0.85rem" }}>🐿️ {summarizeIntelligenceJa()}</p>
        <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", fontSize: "0.8rem" }}>
          <span>ポリシー <b>{summary.policyCount}</b></span>
          <span>ノード <b>{summary.graphNodes}</b> / エッジ <b>{summary.graphEdges}</b></span>
          <span>WFテンプレ <b>{summary.workflowTemplates}</b></span>
          <span>説明アラート <b>{summary.explainabilityAlerts}</b></span>
        </div>
      </section>

      {/* 1. AI Policy Engine */}
      <section aria-label="AI Policy Engine">
        <h3>1. AI Policy Engine(ルール集中管理)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
          優先度: {Object.entries(RULE_LEVEL_LABEL_JA).map(([k, v]) => `${k}.${v}`).join(" > ")}(上位が下位を上書き)
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: "0.76rem" }}>
            <thead><tr>{["優先度", "カテゴリ", "ルール"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr></thead>
            <tbody>
              {POLICY_RULES.map((r) => (
                <tr key={r.id}>
                  <td style={cell}>{r.level}. {RULE_LEVEL_LABEL_JA[r.level]}</td>
                  <td style={cell}>{RULE_CATEGORY_LABEL_JA[r.category]}</td>
                  <td style={{ ...cell, whiteSpace: "normal", minWidth: "20rem" }}>{r.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h4 style={{ margin: "0.5rem 0 0.2rem" }}>意思決定検証(Decision Validation・Mock)</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(19rem, 1fr))", gap: "0.5rem" }}>
          {[demoOk, demoNg].map((v) => (
            <div key={v.decisionId} className="card" style={{ fontSize: "0.76rem" }}>
              <div style={{ fontWeight: 700 }}>{v.decisionId === "demo-ok" ? "Mock改善提案" : "実SNS接続(課金あり)"}</div>
              <div>判定: <b style={{ color: v.allowed ? "#22C55E" : "#EF4444" }}>{v.allowed ? "続行可" : "遮断"}</b> / 承認: {v.approvalRequired ? "必要" : "不要"} / リスク: {v.riskEstimate}</div>
              <div style={{ color: "var(--text-muted)" }}>{v.note}</div>
              {v.violations.length > 0 && <div style={{ color: "#EF4444" }}>違反: {v.violations.join(", ")}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* 2. Knowledge Graph */}
      <section aria-label="Knowledge Graph">
        <h3>2. Knowledge Graph(関係の可視化)</h3>
        <label style={{ fontSize: "0.8rem" }}>フォーカス
          <select value={graphFocus} onChange={(e) => setGraphFocus(e.target.value)} style={{ marginLeft: 6 }}>
            {GRAPH_NODES.map((n) => <option key={n.id} value={n.id}>{NODE_TYPE_LABEL_JA[n.type]}: {n.label}</option>)}
          </select>
        </label>
        <div className="card" style={{ marginTop: "0.4rem", fontSize: "0.78rem" }}>
          <div style={{ fontWeight: 700 }}>関連ノード({related.length})</div>
          <ul style={{ margin: "0.2rem 0 0", paddingLeft: "1.1rem" }}>
            {related.map((n) => (
              <li key={n.id}><span className="badge" style={{ fontSize: "0.62rem" }}>{NODE_TYPE_LABEL_JA[n.type]}</span> {n.label}</li>
            ))}
          </ul>
        </div>
        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
          エッジ: {GRAPH_EDGES.length}本(例: MEISHI-TUBE → ローンチPJ → 立ち上げフロー → 週次レポート / secret参照は論理名のみ)
        </div>
      </section>

      {/* 3. Workflow Composer */}
      <section aria-label="Workflow Composer">
        <h3>3. Workflow Composer(ノーコード構成モデル)</h3>
        {WORKFLOW_TEMPLATES.map((t) => {
          const v = validateWorkflow(t);
          return (
            <div key={t.id} className="card" style={{ marginBottom: "0.5rem", fontSize: "0.78rem" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <strong>{t.name}</strong>
                <span className="badge" style={{ fontSize: "0.66rem" }}>{v.hasApproval ? "承認ノードあり" : "承認なし"}</span>
                <span className="badge" style={{ fontSize: "0.66rem" }}>{v.ok ? "構成OK" : "破損エッジあり"}</span>
              </div>
              <div style={{ color: "var(--text-muted)" }}>{t.description}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: "0.3rem", alignItems: "center" }}>
                {t.nodes.map((n, i) => (
                  <span key={n.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span className="quick-template" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", cursor: "default" }}>
                      {WF_NODE_LABEL_JA[n.type]}: {n.label}
                    </span>
                    {i < t.nodes.length - 1 && <span aria-hidden style={{ color: "var(--text-muted)" }}>→</span>}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* 4. Explainability Center */}
      <section aria-label="Explainability Center">
        <h3>4. Explainability Center(なぜこの提案か)</h3>
        {EXPLAINABILITY_REPORTS.map((r) => (
          <div key={r.id} className="card" style={{ marginBottom: "0.5rem", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <strong>{r.recommendation}</strong>
              <span className="badge" style={{ fontSize: "0.66rem" }}>確信度 {r.confidence}</span>
              {r.requiredApproval && <span className="badge" style={{ fontSize: "0.66rem" }}>要承認</span>}
              <button type="button" className="quick-template" style={{ marginLeft: "auto" }} onClick={() => setWhyFor(whyFor === r.id ? null : r.id)}>
                {whyFor === r.id ? "閉じる" : "Why(理由)"}
              </button>
            </div>
            {whyFor === r.id && <WhyPanel r={r} />}
          </div>
        ))}
      </section>

      {/* 5-8. 統合 */}
      <section aria-label="統合(監査・Company Brain)">
        <h3>統合(AI監査 / Company Brain)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(19rem, 1fr))", gap: "0.5rem" }}>
          <div className="card" style={{ fontSize: "0.78rem" }}>
            <strong>AI監査の監視対象</strong>
            <ul style={{ margin: "0.2rem 0 0", paddingLeft: "1.1rem" }}>
              {AUDIT_MONITORS.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </div>
          <div className="card" style={{ fontSize: "0.78rem" }}>
            <strong>Company Brain 保存対象</strong>
            <ul style={{ margin: "0.2rem 0 0", paddingLeft: "1.1rem" }}>
              {BRAIN_ARTIFACTS.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>
        </div>
        <p style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#EF4444", marginTop: "0.5rem" }}>
          ⚠ 実ポリシー強制・実ワークフロー実行は Production Readiness 承認まで無効(Mockのみ・監査ログ保持)。
        </p>
      </section>
    </>
  );
}
