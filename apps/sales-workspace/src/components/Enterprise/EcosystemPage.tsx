import { useState } from "react";
import {
  TEMPLATES,
  MARKETPLACE_ITEMS,
  EXTENSION_APIS,
  TEMPLATE_KIND_LABEL_JA,
  summarizeEcosystem,
  instantiateTemplate,
  type InstantiateResult,
} from "@musasabi/ecosystem";

// Phase 8: AI Ecosystem(docs/ai-handoff/PHASE8_AI_ECOSYSTEM.md)。
// テンプレート・内部マーケットプレイス・安定拡張API。Mockファースト・後方互換・外部本番依存なし。

export function EcosystemPage() {
  const summary = summarizeEcosystem();
  const [result, setResult] = useState<InstantiateResult | null>(null);

  return (
    <>
      <section aria-label="エコシステム概要">
        <h2>AIエコシステム(Phase 8・Mock)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          Musasabi OS を拡張可能にするエコシステムです。部門/AI社員/ワークフローのテンプレート、
          内部モジュールマーケットプレイス、安定した拡張APIを提供します(すべて Mock・後方互換・
          外部本番依存なし)。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="テンプレート" value={`${summary.templates}`} />
          <StatTile label="導入済みモジュール" value={`${summary.installedModules}`} />
          <StatTile label="利用可能モジュール" value={`${summary.availableModules}`} />
          <StatTile label="安定API" value={`${summary.stableApis}`} />
        </div>
      </section>

      <section aria-label="テンプレート">
        <h3>テンプレート</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "0.75rem" }}>
          {TEMPLATES.map((t) => (
            <div key={t.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "0.7rem" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <strong>{t.name}</strong>
                <span className="badge" style={{ marginLeft: "auto" }}>{TEMPLATE_KIND_LABEL_JA[t.kind]}</span>
              </div>
              <p style={{ fontSize: "0.85rem", margin: "0.3rem 0" }}>{t.description}</p>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>提供: {t.provides.join("、")}</div>
              <button type="button" onClick={() => setResult(instantiateTemplate(t.id))} style={{ marginTop: "0.35rem" }}>
                テンプレートから作成(Mock)
              </button>
            </div>
          ))}
        </div>
        {result && (
          <p style={{ color: "var(--ok)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{result.message}</p>
        )}
      </section>

      <section aria-label="内部モジュールマーケットプレイス">
        <h3>内部モジュールマーケットプレイス</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["モジュール", "カテゴリ", "状態", "説明"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {MARKETPLACE_ITEMS.map((m) => (
              <tr key={m.id}>
                <td style={cell}>{m.name}</td>
                <td style={cell}>{m.category}</td>
                <td style={cell}>{m.status === "installed" ? "導入済み" : "利用可能"}</td>
                <td style={cell}>{m.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="拡張API">
        <h3>拡張API(安定版・後方互換)</h3>
        <ul>
          {EXTENSION_APIS.map((a) => (
            <li key={a.name}>
              {a.name} v{a.version} — {a.stable ? "安定" : "実験的"} / 後方互換{a.backwardCompatible ? "あり" : "なし"}
            </li>
          ))}
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

const cell: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
