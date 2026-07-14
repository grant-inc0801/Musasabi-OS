import { useEffect, useState } from "react";
import { probeLocalServices, type LocalServiceStatus, type ServiceState } from "../../lib/localDiagnostics";

// ローカルAI連携の状態診断(本番・完全ローカル)。
// LLM頭脳・埋め込み・VOICEVOX・whisper・SD の検出状態を1画面で表示し、
// 接続できない場合は理由と有効化ヒントを示す(自己解決の導線)。

const STATE_COLOR: Record<ServiceState, string> = {
  ok: "#22C55E",
  fallback: "#F59E0B",
  unavailable: "#EF4444",
};

const STATE_JA: Record<ServiceState, string> = {
  ok: "接続済み",
  fallback: "代替稼働",
  unavailable: "未検出",
};

export function LocalAiStatusPanel() {
  const [statuses, setStatuses] = useState<LocalServiceStatus[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function probe(): Promise<void> {
    if (busy) return;
    setBusy(true);
    try {
      setStatuses(await probeLocalServices());
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void probe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section aria-label="ローカルAI連携の状態">
      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>ローカルAI連携の状態(診断)</h3>
        <button type="button" onClick={() => void probe()} disabled={busy}>
          {busy ? "診断中…" : "🔍 再診断"}
        </button>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
        端末内のAIサービス(すべて無料・外部送信なし)の検出状態です。未検出でも代替手段で
        業務は止まりません。ヒントに従うと、より高品質な機能に自動で切り替わります。
      </p>
      {statuses === null ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>診断中…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxWidth: "48rem" }}>
          {statuses.map((s) => (
            <div key={s.id} className="card" style={{ padding: "0.5rem 0.75rem", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                <span
                  className="dept-lamp"
                  style={{ background: STATE_COLOR[s.state], boxShadow: `0 0 6px ${STATE_COLOR[s.state]}` }}
                />
                <strong>{s.label}</strong>
                <span
                  className="badge"
                  style={{ fontSize: "0.64rem", background: `${STATE_COLOR[s.state]}22`, color: STATE_COLOR[s.state] }}
                >
                  {STATE_JA[s.state]}
                </span>
              </div>
              <div style={{ marginTop: "0.2rem", color: "var(--text-muted)" }}>{s.detail}</div>
              {s.hint && (
                <div style={{ marginTop: "0.15rem", fontSize: "0.76rem", color: "#F59E0B" }}>💡 {s.hint}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
