import { useMemo, useState } from "react";
import {
  VAULT_ITEMS,
  VAULT_STATUS_COLOR,
  VAULT_STORAGE_POLICIES,
  computeVaultSummary,
  filterVaultItems,
} from "@musasabi/ai-company";
import type { KnowledgeVaultItem } from "@musasabi/ai-company";
import { recordMemory } from "../../lib/memoryStorage";

// 保管庫(Knowledge Vault)の詳細パネル(D-20260706-010)。
// βはMockデータのみ: プレビュー/ダウンロード/アーカイブ/削除候補はUI上の
// Mock操作で、実ファイルの読取・削除・アップロード・クラウド接続は行わない。

function formatKb(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`;
}

export function VaultDetailPanel({ onClose }: { onClose: () => void }) {
  // Mock操作(アーカイブ/削除候補)をセッション内で反映するローカル状態
  const [items, setItems] = useState<KnowledgeVaultItem[]>(() => [...VAULT_ITEMS]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [dept, setDept] = useState("");
  const [sort, setSort] = useState<"updated" | "size">("updated");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const summary = useMemo(() => computeVaultSummary(items), [items]);
  const visible = filterVaultItems(items, {
    keyword,
    category: category || undefined,
    dept: dept || undefined,
    sort,
  });
  const categories = [...new Set(items.map((i) => i.category))];
  const depts = [...new Set(items.map((i) => i.dept))];

  function setStatus(id: string, status: KnowledgeVaultItem["status"], label: string): void {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    if (target.isProtected && status === "削除候補") {
      alert("保護フラグ付きの重要資料は削除候補にできません。");
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    setNote(`「${target.title}」を${label}にしました(Mock)。`);
    recordMemory({
      category: "work",
      actor: "user",
      action: `保管庫: ${label}`,
      detail: target.title,
      tags: ["vault"],
    });
  }

  function handleDownload(target: KnowledgeVaultItem): void {
    setNote(`「${target.title}」のダウンロードはMockです(実ファイル保存は後続フェーズ・承認後)。`);
  }

  const preview = items.find((i) => i.id === previewId) ?? null;

  return (
    <aside className="dept-detail" aria-label="保管庫詳細">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: "1.15rem" }}>保管庫(Knowledge Vault)</h2>
        <button type="button" onClick={onClose} style={{ padding: "0.15rem 0.6rem" }}>
          ×
        </button>
      </div>
      <p style={{ margin: "0.4rem 0 0.8rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        重要資料のメタデータを一元管理します(Mock。実ファイル操作・クラウド接続なし)。
      </p>

      <div className="detail-block">
        <strong>容量管理</strong>
        <p style={{ margin: "0.35rem 0", display: "flex", alignItems: "center", gap: 6 }}>
          <span
            className="dept-lamp"
            style={{
              background: VAULT_STATUS_COLOR[summary.status],
              boxShadow: `0 0 8px ${VAULT_STATUS_COLOR[summary.status]}`,
            }}
          />
          {summary.status} — {formatKb(summary.totalKb)} / {formatKb(summary.capacityKb)}
          (使用率{summary.usagePercent}%)
        </p>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(summary.usagePercent, 100)}%`,
              background: VAULT_STATUS_COLOR[summary.status],
            }}
          />
        </div>
        <div className="detail-stats" style={{ marginTop: "0.5rem" }}>
          <div>
            <span>大容量ファイル</span>
            <b>{summary.largeFileCount}件</b>
          </div>
          <div>
            <span>重複候補</span>
            <b>{summary.duplicateCount}件</b>
          </div>
          <div>
            <span>アーカイブ候補</span>
            <b>{summary.archiveCandidateCount}件</b>
          </div>
          <div>
            <span>削除候補</span>
            <b>{summary.deleteCandidateCount}件</b>
          </div>
        </div>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          部署別: {summary.byDept.map((d) => `${d.dept} ${formatKb(d.totalKb)}`).join(" / ")}
        </p>
        <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          種別上位: {summary.byCategory.slice(0, 3).map((c) => `${c.category} ${formatKb(c.totalKb)}`).join(" / ")}
        </p>
      </div>

      <div className="detail-block">
        <strong>検索・絞り込み</strong>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.4rem" }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="キーワード(タイトル/タグ/AI社員)"
          />
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="種類">
              <option value="">全種類</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="部署">
              <option value="">全部署</option>
              {depts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as "updated" | "size")} aria-label="並び順">
              <option value="updated">更新日順</option>
              <option value="size">サイズ順</option>
            </select>
          </div>
        </div>
      </div>

      {note && <p style={{ color: "var(--ok)", fontSize: "0.82rem" }}>{note}</p>}

      <div className="detail-block">
        <strong>保管データ({visible.length}件)</strong>
        {visible.map((it) => (
          <div
            key={it.id}
            style={{
              borderTop: "1px solid var(--border)",
              padding: "0.45rem 0",
              fontSize: "0.8rem",
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {it.isProtected ? "🔒 " : ""}
              {it.title} <span style={{ color: "var(--text-muted)" }}>{it.version}</span>
            </div>
            <div style={{ color: "var(--text-muted)" }}>
              {it.category} / {it.dept} / {it.author} / {formatKb(it.sizeKb)} /
              更新 {new Date(it.updatedAtMs).toLocaleDateString("ja-JP")} / {it.status}
            </div>
            <div style={{ color: "var(--text-muted)" }}>タグ: {it.tags.join("、") || "—"}</div>
            <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
              <button type="button" style={miniBtn} onClick={() => setPreviewId(previewId === it.id ? null : it.id)}>
                プレビュー
              </button>
              <button type="button" style={miniBtn} onClick={() => handleDownload(it)}>
                ダウンロード(Mock)
              </button>
              <button type="button" style={miniBtn} onClick={() => setStatus(it.id, "アーカイブ候補", "アーカイブ候補")}>
                アーカイブ
              </button>
              <button type="button" style={miniBtn} onClick={() => setStatus(it.id, "削除候補", "削除候補")}>
                削除候補に追加
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
                <strong style={{ fontSize: "0.78rem" }}>プレビュー(Mockサムネイル)</strong>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem" }}>
                  📄 {it.title} — {it.category}の概要をここに表示します(実体ファイルは
                  読み込みません。メタデータと分離管理)。
                </p>
                {it.versions.length > 0 && (
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    履歴: {it.versions.map((v) => `${v.version}(${v.note})`).join(" → ")}
                  </p>
                )}
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
