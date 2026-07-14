import { useState } from "react";
import { VAULT_STORAGE_POLICIES } from "@musasabi/ai-company";
import { recordMemory } from "../../lib/memoryStorage";
import {
  VAULT_CAPACITY_CHARS,
  addVaultDocument,
  loadVaultDocs,
  removeVaultDocument,
  vaultUsageChars,
  type VaultDocument,
} from "../../lib/vaultStorage";

// 保管庫(Knowledge Vault)の詳細パネル(本番実装)。
// 実文書ストア(vaultStorage)の内容を表示し、プレビュー・削除を実行できる。
// 保存文書は Company Brain の RAG 索引対象(分類: vault)。

const SOURCE_JA: Record<VaultDocument["source"], string> = {
  upload: "ファイル取込",
  planning: "企画部",
  agent: "エージェント",
};

function formatChars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}千文字` : `${n}文字`;
}

export function VaultDetailPanel({ onClose }: { onClose: () => void }) {
  const [docs, setDocs] = useState<VaultDocument[]>(() => loadVaultDocs());
  const [keyword, setKeyword] = useState("");
  const [source, setSource] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const usage = vaultUsageChars(docs);
  const usagePercent = Math.min(100, Math.round((usage / VAULT_CAPACITY_CHARS) * 100));
  const status = usagePercent >= 90 ? "危険" : usagePercent >= 70 ? "注意" : "正常";
  const statusColor = usagePercent >= 90 ? "#EF4444" : usagePercent >= 70 ? "#F59E0B" : "#22C55E";

  const visible = docs.filter((d) => {
    if (source && d.source !== source) return false;
    const kw = keyword.trim();
    if (kw && !d.title.includes(kw) && !d.text.includes(kw) && !d.tags.some((t) => t.includes(kw))) {
      return false;
    }
    return true;
  });

  async function handleImportFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return;
    const added: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        if (text.trim() === "") continue;
        const doc = addVaultDocument({
          title: file.name.replace(/\.[^.]+$/, ""),
          text,
          source: "upload",
          tags: ["upload"],
        });
        added.push(doc.title);
      } catch (e) {
        setNote(e instanceof Error ? e.message : String(e));
        break;
      }
    }
    if (added.length > 0) {
      setDocs(loadVaultDocs());
      setNote(`${added.length}件の資料を保管庫へ保存しました(RAG索引対象): ${added.join(" / ")}`);
      recordMemory({
        category: "company",
        actor: "保管庫",
        action: "資料を保管庫へ取込(コマンドセンター)",
        detail: added.join(" / ").slice(0, 200),
        tags: ["vault", "upload"],
      });
    }
  }

  function handleRemove(doc: VaultDocument): void {
    setDocs(removeVaultDocument(doc.id));
    setNote(`「${doc.title}」を保管庫から削除しました(次回の索引更新で検索対象からも外れます)。`);
    recordMemory({
      category: "work",
      actor: "user",
      action: "保管庫: 文書を削除",
      detail: doc.title,
      tags: ["vault"],
    });
  }

  return (
    <aside className="dept-detail" aria-label="保管庫詳細">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: "1.15rem" }}>保管庫(Knowledge Vault)</h2>
        <button type="button" onClick={onClose} style={{ padding: "0.15rem 0.6rem" }}>
          ×
        </button>
      </div>
      <p style={{ margin: "0.4rem 0 0.8rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        会社の資料を端末内に実保存し、Company Brain の意味検索(RAG)へ索引します。
        資料の取込はサイドバー Knowledge の「保管庫(Knowledge Vault)」ページから行えます。
      </p>

      <div className="detail-block">
        <strong>容量管理(実データ)</strong>
        <p style={{ margin: "0.35rem 0", display: "flex", alignItems: "center", gap: 6 }}>
          <span
            className="dept-lamp"
            style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
          />
          {status} — {formatChars(usage)} / {formatChars(VAULT_CAPACITY_CHARS)}(使用率{usagePercent}%)
        </p>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${usagePercent}%`, background: statusColor }}
          />
        </div>
        <div className="detail-stats" style={{ marginTop: "0.5rem" }}>
          <div>
            <span>保管文書</span>
            <b>{docs.length}件</b>
          </div>
          <div>
            <span>ファイル取込</span>
            <b>{docs.filter((d) => d.source === "upload").length}件</b>
          </div>
          <div>
            <span>企画部</span>
            <b>{docs.filter((d) => d.source === "planning").length}件</b>
          </div>
          <div>
            <span>エージェント</span>
            <b>{docs.filter((d) => d.source === "agent").length}件</b>
          </div>
        </div>
      </div>

      <div className="detail-block">
        <strong>資料の取込</strong>
        <div style={{ marginTop: "0.4rem" }}>
          <input
            type="file"
            multiple
            accept=".txt,.md,.csv,.json,.log,.tsv"
            aria-label="コマンドセンターから保管庫へ取り込むファイル"
            onChange={(e) => void handleImportFiles(e.target.files)}
          />
        </div>
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.72rem", color: "var(--text-muted)" }}>
          テキスト文書(複数可)をここから直接取り込めます(1文書4万文字まで)。
        </p>
      </div>

      <div className="detail-block">
        <strong>検索・絞り込み</strong>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.4rem" }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="キーワード(タイトル/本文/タグ)"
          />
          <select value={source} onChange={(e) => setSource(e.target.value)} aria-label="出所">
            <option value="">全出所</option>
            <option value="upload">ファイル取込</option>
            <option value="planning">企画部</option>
            <option value="agent">エージェント</option>
          </select>
        </div>
      </div>

      {note && <p style={{ color: "var(--ok)", fontSize: "0.82rem" }}>{note}</p>}

      <div className="detail-block">
        <strong>保管データ({visible.length}件)</strong>
        {visible.length === 0 && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {docs.length === 0
              ? "保管文書はまだありません。保管庫ページの「資料の取込」から追加できます。"
              : "絞り込みに一致する文書はありません。"}
          </p>
        )}
        {visible.map((it) => (
          <div
            key={it.id}
            style={{
              borderTop: "1px solid var(--border)",
              padding: "0.45rem 0",
              fontSize: "0.8rem",
            }}
          >
            <div style={{ fontWeight: 600 }}>{it.title}</div>
            <div style={{ color: "var(--text-muted)" }}>
              {SOURCE_JA[it.source]} / {formatChars(it.text.length)} / 保存{" "}
              {new Date(it.createdAtMs).toLocaleDateString("ja-JP")}
            </div>
            <div style={{ color: "var(--text-muted)" }}>タグ: {it.tags.join("、") || "—"}</div>
            <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
              <button type="button" style={miniBtn} onClick={() => setPreviewId(previewId === it.id ? null : it.id)}>
                プレビュー
              </button>
              <button type="button" style={miniBtn} onClick={() => handleRemove(it)}>
                削除
              </button>
            </div>
            {previewId === it.id && (
              <div
                style={{
                  marginTop: "0.35rem",
                  padding: "0.5rem",
                  border: "1px dashed var(--border)",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.5)",
                }}
              >
                <strong style={{ fontSize: "0.78rem" }}>本文プレビュー(冒頭400文字)</strong>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", whiteSpace: "pre-wrap" }}>
                  {it.text.slice(0, 400)}
                  {it.text.length > 400 ? "…" : ""}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="detail-block">
        <strong>保存ルール(容量肥大化防止)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.78rem" }}>
          {VAULT_STORAGE_POLICIES.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

const miniBtn: React.CSSProperties = {
  fontSize: "0.72rem",
  padding: "0.15rem 0.45rem",
};
