import { useMemo, useState } from "react";
import { MEMORY_CATEGORIES, MEMORY_CATEGORY_LABEL_JA, MemoryEngine } from "@musasabi/memory";
import type { MemoryCategory } from "@musasabi/memory";
import { loadMemoryRecords, promoteMemoriesNow } from "../../lib/memoryStorage";
import { searchBrain, vaultIndexCoverage } from "../../lib/brainRag";
import type { SearchHit } from "@musasabi/brain-rag";
import { saveBinaryFile } from "../../lib/saveFile";

// Company Brain ページ(Development Bible 第9章 Brain Memory Engine)。
// アプリ内の行動記録(Memory)を6分類の件数タイルと履歴一覧で可視化する。
// データはこの端末のlocalStorageのみ(外部送信なし)。

const HISTORY_LIMIT = 30;

/** 期間フィルタ。 */
type Period = "all" | "today" | "7d";
const PERIOD_LABEL_JA: Record<Period, string> = {
  all: "全期間",
  today: "今日",
  "7d": "直近7日",
};

/** 期間の下限(epoch ms)。all は undefined。 */
function periodSinceMs(period: Period, nowMs: number): number | undefined {
  if (period === "today") {
    const d = new Date(nowMs);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (period === "7d") return nowMs - 7 * 24 * 60 * 60 * 1000;
  return undefined;
}

export function CompanyBrainPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const engine = useMemo(() => new MemoryEngine(loadMemoryRecords()), [reloadKey]);
  const [category, setCategory] = useState<MemoryCategory | "all">("all");
  const [text, setText] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const [promotedNote, setPromotedNote] = useState<string | null>(null);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [semQuery, setSemQuery] = useState("");
  const [semHits, setSemHits] = useState<SearchHit[] | null>(null);
  const [semNote, setSemNote] = useState<string | null>(null);
  const [semBusy, setSemBusy] = useState(false);

  async function handleSemanticSearch(): Promise<void> {
    const q = semQuery.trim();
    if (q === "" || semBusy) return;
    setSemBusy(true);
    setSemNote(null);
    try {
      const { hits, state } = await searchBrain(q, 5);
      setSemHits(hits);
      const vault = vaultIndexCoverage();
      const vaultNote =
        vault.docCount > 0 ? ` / 保管庫の索引 ${vault.indexedChunks}/${vault.totalChunks}チャンク(${vault.docCount}文書)` : "";
      setSemNote(`${state.providerName} / 索引 ${state.indexedCount} 件${vaultNote}${state.source === "fallback" ? "(Ollama で nomic-embed-text を取得すると実埋め込みに切替)" : ""}`);
    } catch (e) {
      setSemNote(`検索に失敗しました: ${String(e)}`);
    } finally {
      setSemBusy(false);
    }
  }

  function handlePromote(): void {
    const count = promoteMemoriesNow();
    setPromotedNote(
      count === 0
        ? "昇格対象はありませんでした(同じ行動の短期メモリが2回以上必要です)。"
        : `${count}件を長期ナレッジへ昇格しました。`,
    );
    setReloadKey((k) => k + 1);
  }

  const counts = engine.countByCategory();
  const queryBase = {
    category: category === "all" ? undefined : category,
    text: text.trim() === "" ? undefined : text.trim(),
    sinceMs: periodSinceMs(period, Date.now()),
  };
  const records = engine.query({ ...queryBase, limit: HISTORY_LIMIT });

  async function handleExport(): Promise<void> {
    // 現在の絞り込み(分類・検索・期間)を反映した全件をJSONで書き出す。
    const all = engine.query(queryBase);
    const json = JSON.stringify(
      { exportedAtMs: Date.now(), filter: { category, text: text.trim(), period }, records: all },
      null,
      2,
    );
    const bytes = new TextEncoder().encode(json);
    const stamp = new Date().toISOString().slice(0, 10);
    const result = await saveBinaryFile(
      `musasabi-memory-${stamp}.json`,
      bytes,
      "JSON",
      ["json"],
    );
    setExportNote(
      result === "cancelled"
        ? "書き出しをキャンセルしました。"
        : `${all.length}件をJSONで書き出しました。`,
    );
  }

  return (
    <>
      <section aria-label="Memory概要">
        <h3 style={{ marginTop: 0 }}>Brain Memory(行動記録)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
          AI社員とあなたの行動を6分類で自動記録します(Development Bible 第9章)。
          保存はこの端末内のみで、外部送信はしません。短期メモリは24時間で自動削除されます。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {MEMORY_CATEGORIES.map((c) => (
            <div key={c} className="card" style={{ minWidth: "7.5rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                {MEMORY_CATEGORY_LABEL_JA[c]}
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{counts[c]}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="意味検索">
        <h3 style={{ marginTop: 0 }}>意味検索(ローカルRAG)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
          社内の行動記録をローカル埋め込みで意味検索します(無課金・外部送信なし)。
          アシスタントチャットとエージェントの市場調査ツールもこの検索結果を利用します。
        </p>
        <div style={{ display: "flex", gap: "0.5rem", maxWidth: "36rem" }}>
          <input
            value={semQuery}
            onChange={(e) => setSemQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleSemanticSearch(); }}
            placeholder="例: 営業の架電リスト / 経理のExcel出力"
            style={{ flex: 1, fontSize: "0.85rem", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.4rem 0.6rem" }}
          />
          <button type="button" onClick={() => void handleSemanticSearch()} disabled={semBusy}>
            {semBusy ? "検索中…" : "意味検索"}
          </button>
        </div>
        {semNote && <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: "0.4rem 0 0" }}>{semNote}</p>}
        {semHits && (
          <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {semHits.length === 0 && <p style={{ fontSize: "0.85rem" }}>関連する記録は見つかりませんでした。</p>}
            {semHits.map((h) => (
              <div key={h.doc.id} className="card" style={{ padding: "0.45rem 0.7rem", fontSize: "0.8rem" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge" style={{ fontSize: "0.64rem" }}>関連度 {(h.score * 100).toFixed(0)}%</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                    {h.doc.meta["主体"]} / {h.doc.meta["日時"]}
                  </span>
                </div>
                <div style={{ marginTop: "0.15rem" }}>{h.doc.text}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-label="自己改善">
        <h3 style={{ marginTop: 0 }}>自己改善(短期→長期の昇格)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
          同じ行動の短期メモリが繰り返された場合、長期ナレッジへ昇格できます
          (Development Bible 第9章の昇格戦略・第18章 Self Evolution。決定的ロジックのみ)。
        </p>
        <button type="button" onClick={handlePromote}>
          繰り返された短期メモリを長期へ昇格
        </button>
        {promotedNote && <p style={{ color: "var(--ok)", margin: "0.5rem 0 0" }}>{promotedNote}</p>}
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
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            aria-label="期間で絞り込み"
          >
            {(Object.keys(PERIOD_LABEL_JA) as Period[]).map((p) => (
              <option key={p} value={p}>
                {PERIOD_LABEL_JA[p]}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => void handleExport()}>
            JSONエクスポート
          </button>
        </div>
        {exportNote && (
          <p style={{ color: "var(--ok)", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>{exportNote}</p>
        )}
        {records.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
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
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
