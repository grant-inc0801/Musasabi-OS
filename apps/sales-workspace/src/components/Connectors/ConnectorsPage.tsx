import { useMemo, useState } from "react";
import {
  CONNECTORS,
  CONNECTOR_CATEGORY_LABEL_JA,
  OPERATION_LABEL_JA,
  MockConnectorAdapter,
  toAuditEntry,
  appendAudit,
  summarizeConnectors,
  getConnector,
  type AuditEntry,
} from "@musasabi/connectors";
import { FreeConnectorsSection } from "./FreeConnectorsSection";

// Phase 3: Real-World Integration(Directive D-20260708-004)デバッグ/確認画面。
// コネクタ・フレームワークの一覧、Mock 読み取り/書き込みの実行、監査ログを表示する。
// 本番接続はすべて未承認(無効)。Mock は実システムに一切影響しない。

export function ConnectorsPage() {
  const summary = useMemo(() => summarizeConnectors(), []);
  const [selectedId, setSelectedId] = useState(CONNECTORS[0].id);
  const [resource, setResource] = useState("");
  const [log, setLog] = useState<AuditEntry[]>([]);

  const selected = getConnector(selectedId)!;
  const adapter = useMemo(() => new MockConnectorAdapter(selected), [selected]);

  function run(operation: "read" | "write") {
    const result =
      operation === "read" ? adapter.read(resource) : adapter.write(resource, { demo: true });
    setLog((prev) => appendAudit(prev, toAuditEntry(result, Date.now())));
  }

  return (
    <>
      <FreeConnectorsSection />
      <section aria-label="コネクタ概要">
        <h2>外部連携コネクタ(Phase 3・Mock)</h2>
        <p style={{ color: "var(--warn)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          すべて Mock モードです。本番接続は未承認のため無効で、外部サービスへは一切接続しません。
          読み取りを先に、書き込みは承認ゲート経由でのみ本番許可される設計です。secrets は保存しません。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="コネクタ数" value={`${summary.total}`} />
          <StatTile label="Mock" value={`${summary.mockCount}`} />
          <StatTile label="本番承認済み" value={`${summary.productionApprovedCount}`} />
          <StatTile label="読み取り専用" value={`${summary.readOnlyCount}`} />
          <StatTile label="書き込み対応" value={`${summary.writeCapableCount}`} />
        </div>
      </section>

      <section aria-label="コネクタ一覧">
        <h3>コネクタ一覧</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["連携先", "カテゴリ", "モード", "本番承認", "対応操作", "説明"].map((h) => (
                <th key={h} style={cell}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONNECTORS.map((c) => (
              <tr key={c.id}>
                <td style={cell}>{c.name}</td>
                <td style={cell}>{CONNECTOR_CATEGORY_LABEL_JA[c.category]}</td>
                <td style={cell}>
                  <span className="badge">{c.mode === "mock" ? "Mock" : "本番"}</span>
                </td>
                <td style={cell}>{c.productionApproved ? "承認済み" : "未承認(無効)"}</td>
                <td style={cell}>{c.capabilities.map((o) => OPERATION_LABEL_JA[o]).join(" / ")}</td>
                <td style={cell}>{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="Mock操作デモ">
        <h3>Mock 操作デモ</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <label>
            コネクタ{" "}
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {CONNECTORS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            リソース{" "}
            <input
              type="text"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              placeholder="例: issues / 2026-07 / Customers"
              style={{ width: "14rem" }}
            />
          </label>
          <button type="button" onClick={() => run("read")}>読み取り(Mock)</button>
          <button
            type="button"
            onClick={() => run("write")}
            disabled={!selected.capabilities.includes("write")}
            title={selected.capabilities.includes("write") ? "" : "このコネクタは読み取り専用です"}
          >
            書き込み(Mock)
          </button>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          書き込みは Mock のためシミュレートのみ(実システム無影響)。本番書き込みには承認者・理由が必要です。
        </p>
      </section>

      <section aria-label="監査ログ">
        <h3>監査ログ({log.length})</h3>
        {log.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>まだ操作がありません。上のデモを実行してください。</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {log.map((e, i) => (
              <li key={i} style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>
                  {new Date(e.timestampMs).toLocaleTimeString()}{" "}
                </span>
                [{OPERATION_LABEL_JA[e.operation]}/{e.effect}] {e.ok ? "✓" : "✗"} {e.message}
              </li>
            ))}
          </ul>
        )}
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
  verticalAlign: "top",
};
