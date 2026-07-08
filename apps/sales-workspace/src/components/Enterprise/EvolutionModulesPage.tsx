import { useState } from "react";
import {
  EVOLUTION_MODULES,
  EVOLUTION_GOVERNANCE_NOTES,
  summarizeEvolutionModules,
  buildEvolutionSummaryJa,
  runEvolutionService,
  type ModuleServiceResult,
} from "@musasabi/evolution-modules";

// Musasabi Evolution Modules(docs/ai-handoff/MUSASABI_EVOLUTION_MODULES_DIRECTIVE.md)。
// 次世代の内部オペレーティングモジュール12種を Mock パネル/サービススタブとして表示。
// Company Brain・Musasabi DNA・ガバナンス・監査・経営ダッシュボードと統合(Mock)。

export function EvolutionModulesPage() {
  const summary = summarizeEvolutionModules();
  const avatarLines = buildEvolutionSummaryJa();
  const [results, setResults] = useState<Record<string, ModuleServiceResult>>({});
  const ordered = [...EVOLUTION_MODULES].sort((a, b) => a.order - b.order);

  return (
    <>
      <section aria-label="進化モジュール概要">
        <h2>Musasabi 進化モジュール(Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          AIカンパニーOSを次世代へ進化させる内部オペレーティングモジュール12種です。各モジュールは
          Mock パネル/サービススタブを持ち、Company Brain・Musasabi DNA・ガバナンス・監査・
          経営ダッシュボードと統合します。外部本番接続・secrets なし、憲章・承認・監査を尊重します。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="モジュール数" value={`${summary.total}`} />
          <StatTile label="Mockパネル" value={`${summary.mockPanels}`} />
          <StatTile label="サービス" value={`${summary.services}`} />
          <StatTile label="統合ポイント" value={`${summary.integrationPoints}`} />
        </div>
        {avatarLines.length > 0 && (
          <p style={{ color: "var(--accent, #6c8cff)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            🐿️ ムササビAI要約: {avatarLines.join(" ")}
          </p>
        )}
      </section>

      <section aria-label="進化モジュールパネル">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "1rem" }}>
          {ordered.map((m) => (
            <div
              key={m.id}
              aria-label={`進化モジュール: ${m.name}`}
              style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "0.8rem 0.9rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>#{m.order}</span>
                <strong>{m.nameJa}</strong>
                <span className="badge" style={{ marginLeft: "auto" }}>{m.form === "mock" ? "Mock" : "Service"}</span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.2rem" }}>{m.name}</div>
              <p style={{ fontSize: "0.85rem", margin: "0.3rem 0" }}>{m.purpose}</p>
              <ul style={{ listStyle: "none", paddingLeft: 0, margin: "0.25rem 0", fontSize: "0.85rem" }}>
                {m.highlights.map((h) => (
                  <li key={h.label}>
                    <span style={{ color: "var(--text-muted)" }}>{h.label}:</span> <strong>{h.value}</strong>
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "0.3rem 0" }}>
                {m.integrations.map((p) => (
                  <span key={p} className="badge" style={{ fontSize: "0.72rem" }}>連携: {p}</span>
                ))}
              </div>
              <button type="button" onClick={() => setResults((prev) => ({ ...prev, [m.id]: runEvolutionService(m.id) }))} style={{ marginTop: "0.3rem" }}>
                サービス実行
              </button>
              {results[m.id] && (
                <p style={{ fontSize: "0.8rem", color: "var(--ok)", margin: "0.3rem 0 0" }}>{results[m.id].message}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section aria-label="進化モジュール ガバナンス">
        <h3>ガバナンス</h3>
        <ul style={{ fontSize: "0.85rem" }}>
          {EVOLUTION_GOVERNANCE_NOTES.map((n) => <li key={n}>{n}</li>)}
        </ul>
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
