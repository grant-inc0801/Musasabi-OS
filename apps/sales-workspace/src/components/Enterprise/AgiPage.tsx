import { useMemo, useState } from "react";
import {
  MOCK_AGI_PROPOSALS,
  MUSASABI_CONSTITUTION,
  AGI_PROPOSAL_KIND_LABEL_JA,
  prioritizeAgiProposals,
  requiresApproval,
  checkAgainstConstitution,
  buildStrategicPlan,
} from "@musasabi/agi";

// Phase 11: Musasabi AGI(docs/ai-handoff/PHASE11_MUSASABI_AGI.md)。
// 改善提案・ワークフロー再編・部門/AI社員新設提案・Company Brain進化・戦略立案支援を
// ガバナンス(承認・監査ログ・本番デプロイ禁止)下で提示する。すべて Mock。

export function AgiPage() {
  const ordered = useMemo(() => prioritizeAgiProposals(MOCK_AGI_PROPOSALS), []);
  const plan = buildStrategicPlan(MOCK_AGI_PROPOSALS);
  const [checkedId, setCheckedId] = useState<string | null>(null);
  const check = useMemo(() => {
    const p = ordered.find((x) => x.id === checkedId);
    return p ? checkAgainstConstitution(p) : null;
  }, [checkedId, ordered]);

  return (
    <>
      <section aria-label="AGI戦略サマリー">
        <h2>Musasabi AGI(Phase 11・Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          協調的なAI組織として、自己最適化・ワークフロー・部門/AI社員の新設・Company Brain進化・
          戦略立案を提案します。重要な変更は<strong>人間承認が必須</strong>で、監査ログを保持し、
          <strong>自律的な本番デプロイは行いません</strong>。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="提案数" value={`${MOCK_AGI_PROPOSALS.length}`} />
          <StatTile label="承認待ち" value={`${plan.approvalPending}`} />
          <StatTile label="自動適用可" value={`${plan.autoApplicable}`} />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          {plan.lines.map((l, i) => (
            <p key={i} style={{ margin: "0.15rem 0", color: "var(--text-muted)" }}>{l}</p>
          ))}
        </div>
      </section>

      <section aria-label="AGI提案一覧">
        <h3>AGI提案(優先順)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["提案", "種別", "影響", "効果", "承認", "憲章チェック"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {ordered.map((p) => (
              <tr key={p.id}>
                <td style={cell}>{p.title}</td>
                <td style={cell}>{AGI_PROPOSAL_KIND_LABEL_JA[p.kind]}</td>
                <td style={cell}>{p.impact}</td>
                <td style={cell}>{p.expectedBenefit}</td>
                <td style={cell}>
                  {requiresApproval(p) ? <strong style={{ color: "var(--warn)" }}>必須</strong> : "不要"}
                </td>
                <td style={cell}>
                  <button type="button" onClick={() => setCheckedId(p.id)}>照合</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {check && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "0.6rem", marginTop: "0.5rem" }}>
            <strong>憲章チェック結果: {check.compliant ? "適合" : "不適合"}</strong>
            {check.requiresApproval && <span style={{ color: "var(--warn)" }}>(人間承認が必要)</span>}
            <ul style={{ margin: "0.3rem 0 0" }}>
              {check.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        )}
      </section>

      <section aria-label="Musasabi憲章">
        <h3>Musasabi Constitution(憲章)</h3>
        <ol>
          {MUSASABI_CONSTITUTION.map((c) => <li key={c}>{c}</li>)}
        </ol>
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
