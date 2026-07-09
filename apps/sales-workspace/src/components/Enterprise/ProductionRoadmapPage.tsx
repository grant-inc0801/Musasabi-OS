import {
  DEVELOPMENT_POLICY,
  MOCK_COMPLETION_SCOPE,
  MOCK_STATUS_LABEL_JA,
  PRODUCTION_READINESS_ITEMS,
  READINESS_STATUS_LABEL_JA,
  PRODUCTION_LAUNCH_CHECKLIST,
  CHECKLIST_STATUS_LABEL_JA,
  PRODUCTION_RULE,
  PRODUCTION_APPROVED,
  PRODUCTION_READINESS_DESIGN_DOC,
  ROADMAP_GOVERNANCE_NOTES,
  computeMockCompletion,
  isProductionReadinessUnlocked,
  summarizeRoadmapJa,
} from "@musasabi/production-roadmap";

// Master Roadmap to Production(docs/ai-handoff/MASTER_ROADMAP_TO_PRODUCTION.md)。
// Mock 完成状況の追跡と、Production Readiness フェーズのゲート可視化(承認まではロック)。
// 追跡・可視化のみ。認証/secrets/本番DB 等は実装しない(人間承認が明示されるまでロック)。

export function ProductionRoadmapPage() {
  const completion = computeMockCompletion();
  const unlocked = isProductionReadinessUnlocked(PRODUCTION_APPROVED);

  return (
    <>
      <section aria-label="本番ロードマップ概要">
        <h2>Master Roadmap to Production(Mock 追跡)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "50rem" }}>
          Mock ファーストで各機能を構築・検証・統合し、Mock 完成後にのみ Production Readiness へ進みます。
          本ページは進捗の追跡とゲートの可視化のみを行い、認証・secrets・本番DB 等は実装しません
          (人間承認が明示されるまでロック)。
        </p>
        <p style={{ color: "var(--accent, #6c8cff)", fontSize: "0.85rem" }}>🐿️ {summarizeRoadmapJa()}</p>

        <div style={{ maxWidth: "40rem", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
            <strong>Mock 完成度</strong>
            <span>{completion.percent}%（{completion.done}/{completion.total}）</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={completion.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Mock完成度"
            style={{ height: 12, borderRadius: 6, background: "var(--border)", overflow: "hidden", marginTop: 4 }}
          >
            <div style={{ width: `${completion.percent}%`, height: "100%", background: completion.complete ? "#22C55E" : "#FACC15" }} />
          </div>
          {completion.complete && (
            <p style={{ color: "#22C55E", fontSize: "0.85rem", marginTop: "0.3rem" }}>
              ✅ Mock 完成。Production Readiness は人間承認が明示されるまでロックされます。
            </p>
          )}
        </div>
      </section>

      <section aria-label="開発方針">
        <h3>開発方針</h3>
        <ol style={{ fontSize: "0.85rem", maxWidth: "48rem" }}>
          {DEVELOPMENT_POLICY.map((p) => <li key={p}>{p}</li>)}
        </ol>
      </section>

      <section aria-label="Mock完成スコープ">
        <h3>Mock 完成スコープ</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))", gap: "0.6rem" }}>
          {MOCK_COMPLETION_SCOPE.map((s) => (
            <div key={s.id} aria-label={`Mockスコープ: ${s.name}`} className="card" style={{ padding: "0.55rem 0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span aria-hidden style={{ color: s.status === "done" ? "#22C55E" : "#FACC15" }}>
                  {s.status === "done" ? "✔" : "…"}
                </span>
                <strong>{s.name}</strong>
                <span className="badge" style={{ marginLeft: "auto", fontSize: "0.72rem" }}>{MOCK_STATUS_LABEL_JA[s.status]}</span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.76rem", marginTop: "0.2rem" }}>{s.implementedBy}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Production Readiness フェーズ">
        <h3>Production Readiness フェーズ（{unlocked ? "解放済み" : "ロック中 🔒"}）</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          以下は Mock 完成後・かつ人間承認が明示された場合にのみ着手します。現在は承認未取得のためロックです。
          各項目には<strong>設計方針のみ</strong>を用意しています(実装は承認後)。詳細設計は
          <code style={{ margin: "0 0.2rem" }}>{PRODUCTION_READINESS_DESIGN_DOC}</code>を参照。
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))", gap: "0.6rem" }}>
          {PRODUCTION_READINESS_ITEMS.map((r) => (
            <div key={r.id} aria-label={`本番対応: ${r.name}`} className="card" style={{ padding: "0.55rem 0.75rem", opacity: r.status === "locked" ? 0.9 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span aria-hidden>{r.status === "locked" ? "🔒" : r.status === "approved" ? "✔" : "…"}</span>
                <strong>{r.name}</strong>
                <span className="badge" style={{ marginLeft: "auto", fontSize: "0.72rem" }}>{READINESS_STATUS_LABEL_JA[r.status]}</span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.76rem", marginTop: "0.2rem" }}>{r.note}</div>
              <div style={{ marginTop: "0.35rem", fontSize: "0.76rem" }}>
                <span className="badge" style={{ fontSize: "0.68rem" }}>設計</span>{" "}
                <span style={{ color: "var(--text)" }}>{r.design}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="本番リリースチェックリスト">
        <h3>本番リリースチェックリスト</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0, fontSize: "0.85rem", maxWidth: "40rem" }}>
          {PRODUCTION_LAUNCH_CHECKLIST.map((c) => (
            <li key={c.id} style={{ display: "flex", gap: 8, padding: "0.15rem 0" }}>
              <span aria-hidden style={{ color: c.status === "done" ? "#22C55E" : "var(--text-muted)" }}>
                {c.status === "done" ? "☑" : "☐"}
              </span>
              <span>{c.name}</span>
              <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.78rem" }}>{CHECKLIST_STATUS_LABEL_JA[c.status]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="本番ルール・ガバナンス">
        <h3>ルール・ガバナンス</h3>
        <p style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#EF4444" }}>⚠ {PRODUCTION_RULE}</p>
        <ul style={{ fontSize: "0.85rem" }}>
          {ROADMAP_GOVERNANCE_NOTES.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </section>
    </>
  );
}
