import { useState } from "react";
import {
  NEXT_CORE_MODULES,
  summarizeNextModules,
  buildNextModulesSummaryJa,
  runModuleService,
  type ModuleServiceResult,
} from "@musasabi/next-core-modules";

// Musasabi Next Core Modules(D-20260709-002)。12のコアモジュールを Mock パネル/
// サービススタブとして表示。優先順位順に並べ、アバター用の主要状態要約も掲示する。

export function NextCoreModulesPage() {
  const summary = summarizeNextModules();
  const avatarLines = buildNextModulesSummaryJa();
  const [results, setResults] = useState<Record<string, ModuleServiceResult>>({});
  const ordered = [...NEXT_CORE_MODULES].sort((a, b) => a.priority - b.priority);

  return (
    <>
      <section aria-label="コアモジュール概要">
        <h2>Musasabi コアモジュール(D-20260709-002・Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          AIカンパニーOSを強化する次のコアモジュール12種です。各モジュールは Mock パネル/
          サービススタブを持ちます。外部本番接続・secrets なし、ガバナンス/監査を尊重します。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="モジュール数" value={`${summary.total}`} />
          <StatTile label="Mockパネル" value={`${summary.mockPanels}`} />
          <StatTile label="サービス" value={`${summary.services}`} />
        </div>
        {avatarLines.length > 0 && (
          <p style={{ color: "var(--accent, #6c8cff)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            🐿️ ムササビAI要約: {avatarLines.join(" ")}
          </p>
        )}
      </section>

      <section aria-label="コアモジュールパネル">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "1rem" }}>
          {ordered.map((m) => (
            <div
              key={m.id}
              aria-label={`コアモジュール: ${m.name}`}
              style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "0.8rem 0.9rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>#{m.priority}</span>
                <strong>{m.name}</strong>
                <span className="badge" style={{ marginLeft: "auto" }}>{m.form === "mock" ? "Mock" : "Service"}</span>
              </div>
              <p style={{ fontSize: "0.85rem", margin: "0.3rem 0" }}>{m.purpose}</p>
              <ul style={{ listStyle: "none", paddingLeft: 0, margin: "0.25rem 0", fontSize: "0.85rem" }}>
                {m.highlights.map((h) => (
                  <li key={h.label}>
                    <span style={{ color: "var(--text-muted)" }}>{h.label}:</span> <strong>{h.value}</strong>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setResults((p) => ({ ...p, [m.id]: runModuleService(m.id) }))} style={{ marginTop: "0.3rem" }}>
                サービス実行
              </button>
              {results[m.id] && (
                <p style={{ fontSize: "0.8rem", color: "var(--ok)", margin: "0.3rem 0 0" }}>{results[m.id].message}</p>
              )}
            </div>
          ))}
        </div>
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
