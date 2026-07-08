import { useMemo, useState } from "react";
import {
  MOCK_IMPROVEMENTS,
  MOCK_KNOWLEDGE,
  IMPROVEMENT_KIND_LABEL_JA,
  prioritizeImprovements,
  generateDraftIssue,
  scoreKnowledge,
  buildEvolutionSummary,
  requiresHumanApproval,
} from "@musasabi/evolution";

// Phase 7: Self-Evolving AI(D-20260708-008)。改善提案の自動生成・優先順位付け・
// ドラフトIssue生成・ナレッジ品質スコア。高インパクト/高リスクは人間承認必須。
// 実際のIssue作成・本番変更は行わない(ドラフト生成のみ)。

export function ImprovementPage() {
  const ordered = useMemo(() => prioritizeImprovements(MOCK_IMPROVEMENTS), []);
  const summary = buildEvolutionSummary(MOCK_IMPROVEMENTS, MOCK_KNOWLEDGE);
  const [draftId, setDraftId] = useState<string | null>(null);

  const draft = useMemo(() => {
    const p = ordered.find((x) => x.id === draftId);
    return p ? generateDraftIssue(p) : null;
  }, [draftId, ordered]);

  return (
    <>
      <section aria-label="自己進化サマリー">
        <h2>AI 改善提案 / 自己進化(Phase 7・Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          Musasabi AI が自身の運用を分析して改善提案を自動生成し、AI PM が優先順位付けします。
          ドラフトIssue(実装計画の下書き)を生成できますが、実際のIssue作成・本番変更は行いません。
          高インパクト/高リスクの提案は人間承認が必須です。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="改善提案" value={`${summary.totalProposals}`} />
          <StatTile label="承認必須" value={`${summary.approvalRequired}`} />
          <StatTile label="自動適用可" value={`${summary.autoApplicable}`} />
          <StatTile label="要更新ナレッジ" value={`${summary.knowledgeNeedingRefresh}`} />
        </div>
      </section>

      <section aria-label="改善提案一覧">
        <h3>改善提案(優先順)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["提案", "種別", "効果", "リスク", "承認", "ドラフト"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {ordered.map((p) => (
              <tr key={p.id}>
                <td style={cell}>{p.title}</td>
                <td style={cell}>{IMPROVEMENT_KIND_LABEL_JA[p.kind]}</td>
                <td style={cell}>{p.impact}</td>
                <td style={cell}>{p.risk}</td>
                <td style={cell}>{requiresHumanApproval(p) ? "必須" : "不要"}</td>
                <td style={cell}>
                  <button type="button" onClick={() => setDraftId(p.id)}>Issue下書き生成</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {draft && (
        <section aria-label="ドラフトIssue">
          <h3>ドラフトIssue(生成のみ・未作成)</h3>
          <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "0.75rem" }}>
            <div style={{ fontWeight: "bold", marginBottom: "0.3rem" }}>{draft.title}</div>
            <div style={{ marginBottom: "0.4rem" }}>
              {draft.labels.map((l) => (
                <span key={l} className="badge" style={{ marginRight: 6 }}>{l}</span>
              ))}
            </div>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", margin: 0 }}>{draft.body}</pre>
          </div>
        </section>
      )}

      <section aria-label="ナレッジ品質">
        <h3>ナレッジ品質スコア</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["ナレッジ", "スコア", "評価", "更新要否"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {MOCK_KNOWLEDGE.map((k) => {
              const s = scoreKnowledge(k);
              return (
                <tr key={k.id}>
                  <td style={cell}>{k.title}</td>
                  <td style={cell}>{s.score}</td>
                  <td style={cell}>{s.grade}</td>
                  <td style={cell}>{s.needsRefresh ? "要更新" : "—"}</td>
                </tr>
              );
            })}
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
