import { useMemo, useState } from "react";
import { MEMORY_CATEGORIES, MEMORY_CATEGORY_LABEL_JA, MemoryEngine } from "@musasabi/memory";
import type { MemoryCategory } from "@musasabi/memory";
import { loadMemoryRecords } from "../../lib/memoryStorage";

// Company Brain ページ(Development Bible 第9章 Brain Memory Engine)。
// アプリ内の行動記録(Memory)を6分類の件数タイルと履歴一覧で可視化する。
// データはこの端末のlocalStorageのみ(外部送信なし)。

const HISTORY_LIMIT = 30;

export function CompanyBrainPage() {
  const engine = useMemo(() => new MemoryEngine(loadMemoryRecords()), []);
  const [category, setCategory] = useState<MemoryCategory | "all">("all");
  const [text, setText] = useState("");

  const counts = engine.countByCategory();
  const records = engine.query({
    category: category === "all" ? undefined : category,
    text: text.trim() === "" ? undefined : text.trim(),
    limit: HISTORY_LIMIT,
  });

  return (
    <>
      <section aria-label="Memory概要">
        <h3 style={{ marginTop: 0 }}>Brain Memory(行動記録)</h3>
        <p style={{ color: "#9aa3ba", fontSize: "0.85rem", maxWidth: "44rem" }}>
          AI社員とあなたの行動を6分類で自動記録します(Development Bible 第9章)。
          保存はこの端末内のみで、外部送信はしません。短期メモリは24時間で自動削除されます。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {MEMORY_CATEGORIES.map((c) => (
            <div key={c} className="card" style={{ minWidth: "7.5rem", textAlign: "center" }}>
              <div style={{ color: "#9aa3ba", fontSize: "0.8rem" }}>
                {MEMORY_CATEGORY_LABEL_JA[c]}
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{counts[c]}</div>
              <div style={{ color: "#7d8598", fontSize: "0.75rem" }}>件</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Memory履歴">
        <h3 style={{ marginTop: 0 }}>履歴(最新{HISTORY_LIMIT}件)</h3>
        <div style={{ marginBottom: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as MemoryCategory | "all")}
            aria-label="分類で絞り込み"
          >
            <option value="all">すべての分類</option>
            {MEMORY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {MEMORY_CATEGORY_LABEL_JA[c]}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="行動・詳細・タグを検索"
            style={{ width: "18rem" }}
          />
        </div>
        {records.length === 0 ? (
          <p style={{ color: "#9aa3ba" }}>
            記録がまだありません。テストコールや設定変更などの操作が自動で記録されます。
          </p>
        ) : (
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["日時", "分類", "行動主体", "行動", "詳細"].map((h) => (
                  <th key={h} style={cellStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td style={cellStyle}>{new Date(r.timestampMs).toLocaleString("ja-JP")}</td>
                  <td style={cellStyle}>{MEMORY_CATEGORY_LABEL_JA[r.category]}</td>
                  <td style={cellStyle}>{r.actor}</td>
                  <td style={cellStyle}>{r.action}</td>
                  <td style={cellStyle}>{r.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid rgba(151,168,205,0.16)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
