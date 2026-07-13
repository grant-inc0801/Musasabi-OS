import { useState } from "react";
import {
  PLANNING_DOC_STATUSES,
  PLANNING_DOC_TASKS,
  VAULT_FLOW_JA,
} from "@musasabi/ai-company";
import { recordMemory } from "../../lib/memoryStorage";
import {
  VAULT_CAPACITY_CHARS,
  loadVaultDocs,
  savePlanningGuideToVault,
  vaultUsageChars,
} from "../../lib/vaultStorage";

// 企画部ページ(従来画面)。資料作成業務と保管庫連携(D-20260706-010)。
// 保管庫保存は本番実装: 実文書を保管庫(Knowledge Vault)へ保存し RAG 索引される。

function formatChars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}千文字` : `${n}文字`;
}

export function PlanningPage() {
  const [docs, setDocs] = useState(() => loadVaultDocs());
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const usage = vaultUsageChars(docs);
  const usagePercent = Math.min(100, Math.round((usage / VAULT_CAPACITY_CHARS) * 100));
  const status = usagePercent >= 90 ? "危険" : usagePercent >= 70 ? "注意" : "正常";
  const statusColor = usagePercent >= 90 ? "#EF4444" : usagePercent >= 70 ? "#F59E0B" : "#22C55E";
  const planningDocs = docs.filter((d) => d.source === "planning");

  function handleSaveToVault(): void {
    try {
      const { doc, created } = savePlanningGuideToVault();
      setSavedNote(
        created
          ? `「${doc.title}」を保管庫へ実保存しました(RAG索引対象)。`
          : `「${doc.title}」は既に保管庫にあります(重複保存なし)。`,
      );
      if (created) {
        recordMemory({
          category: "work",
          actor: "AIドキュメントライター",
          action: "企画部: 資料を保管庫へ保存",
          detail: doc.title,
          tags: ["planning", "vault"],
        });
        setDocs(loadVaultDocs());
      }
    } catch (e) {
      setSavedNote(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <>
      <section aria-label="企画部の業務">
        <h3 style={{ marginTop: 0 }}>資料作成業務</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
          開発した自動化・新ツール・新サービスのマニュアルや提案資料を作成し、
          保管庫へ保存します。フロー: {VAULT_FLOW_JA}
        </p>
        <ul>
          {PLANNING_DOC_TASKS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section aria-label="資料状況">
        <h3 style={{ marginTop: 0 }}>資料状況</h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {PLANNING_DOC_STATUSES.map((s) => (
            <div key={s.label} className="card" style={{ minWidth: "16rem", flex: "1 1 16rem" }}>
              <strong style={{ fontSize: "0.9rem" }}>{s.label}({s.items.length})</strong>
              <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button type="button" onClick={handleSaveToVault} style={{ marginTop: "0.75rem" }}>
          保存待ち資料を保管庫へ保存
        </button>
        {savedNote && <p style={{ color: "var(--ok)", fontSize: "0.82rem" }}>{savedNote}</p>}
      </section>

      <section aria-label="保管庫の状態">
        <h3 style={{ marginTop: 0 }}>保管庫の状態(実データ)</h3>
        <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="dept-lamp"
            style={{
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
            }}
          />
          {status} — {formatChars(usage)} / {formatChars(VAULT_CAPACITY_CHARS)}
          (使用率{usagePercent}%)・保管{docs.length}件
        </p>
        <h4>企画部の保管資料({planningDocs.length}件)</h4>
        {planningDocs.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            企画部の保管資料はまだありません。「保存待ち資料を保管庫へ保存」で追加できます。
          </p>
        ) : (
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["タイトル", "出所", "サイズ", "保存日"].map((h) => (
                  <th key={h} style={cellStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planningDocs.map((d) => (
                <tr key={d.id}>
                  <td style={cellStyle}>{d.title}</td>
                  <td style={cellStyle}>企画部</td>
                  <td style={cellStyle}>{formatChars(d.text.length)}</td>
                  <td style={cellStyle}>{new Date(d.createdAtMs).toLocaleDateString("ja-JP")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          全資料の閲覧・削除・容量管理はサイドバー Knowledge の「保管庫(Knowledge Vault)」ページから行えます。
        </p>
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
