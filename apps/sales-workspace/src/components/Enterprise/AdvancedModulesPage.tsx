import { useState } from "react";
import {
  ADVANCED_MODULES,
  summarizeModules,
  runModuleStub,
  type StubResponse,
} from "@musasabi/advanced-modules";

// Advanced Modules Roadmap(docs/ai-handoff/ADVANCED_MODULES_ROADMAP.md)。
// 12の次世代モジュールを Mock パネル / サービススタブとして表示する。
// 外部本番接続・secrets なし。desktop 安定性を保つため軽量な表示に留める。

export function AdvancedModulesPage() {
  const summary = summarizeModules();
  const [responses, setResponses] = useState<Record<string, StubResponse>>({});

  function runStub(id: string) {
    const r = runModuleStub(id as never);
    setResponses((prev) => ({ ...prev, [id]: r }));
  }

  return (
    <>
      <section aria-label="アドバンスドモジュール概要">
        <h2>アドバンスドモジュール(Roadmap・Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          次世代モジュール群を「まず Mock パネル / サービススタブ」として提供します。
          外部本番接続・secrets は扱いません。各モジュールは可視パネルを持ち、スタブは実処理をしません。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="モジュール数" value={`${summary.total}`} />
          <StatTile label="Mockパネル" value={`${summary.mockPanels}`} />
          <StatTile label="サービススタブ" value={`${summary.serviceStubs}`} />
          <StatTile label="カテゴリ" value={`${summary.categories}`} />
        </div>
      </section>

      <section aria-label="モジュールパネル">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
            gap: "1rem",
          }}
        >
          {ADVANCED_MODULES.map((m) => (
            <div
              key={m.id}
              aria-label={`モジュール: ${m.name}`}
              style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "0.8rem 0.9rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.25rem" }}>
                <strong>{m.name}</strong>
                <span className="badge" style={{ marginLeft: "auto" }}>
                  {m.status === "mock" ? "Mock" : "Stub"}
                </span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{m.category}</div>
              <p style={{ fontSize: "0.85rem", margin: "0.35rem 0" }}>{m.purpose}</p>
              <ul style={{ listStyle: "none", paddingLeft: 0, margin: "0.25rem 0", fontSize: "0.85rem" }}>
                {m.highlights.map((h) => (
                  <li key={h.label}>
                    <span style={{ color: "var(--text-muted)" }}>{h.label}:</span> <strong>{h.value}</strong>
                  </li>
                ))}
              </ul>
              {m.sample && (
                <ul style={{ margin: "0.25rem 0", paddingLeft: "1.1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {m.sample.map((s) => <li key={s}>{s}</li>)}
                </ul>
              )}
              <button type="button" onClick={() => runStub(m.id)} style={{ marginTop: "0.35rem" }}>
                サービススタブ実行
              </button>
              {responses[m.id] && (
                <p style={{ fontSize: "0.8rem", color: "var(--ok)", margin: "0.35rem 0 0" }}>
                  {responses[m.id].message}
                </p>
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
