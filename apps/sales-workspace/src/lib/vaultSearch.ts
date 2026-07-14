// チャットからの保管庫検索(本番・完全ローカル・決定論)。
// 「保管庫で◯◯を探して」で保管庫の実文書を直接検索し、該当箇所を引用して回答する。
// まず部分一致(タイトル/本文/タグ)、見つからなければ意味検索(RAG索引の vault チャンク)
// へフォールバックする。LLM不要で動作する。

import { loadVaultDocs, type VaultDocument } from "./vaultStorage";
import { searchBrain } from "./brainRag";

/** チャット文からの保管庫検索コマンド抽出。マッチしなければ null。 */
export function parseVaultSearchQuery(message: string): string | null {
  const m = message.match(/^保管庫(?:で|から|を)?[\s、]*(.+?)(?:を)?(?:探して|検索して|検索|調べて)。?$/);
  if (m && m[1].trim() !== "") return m[1].trim();
  return null;
}

export interface VaultSearchHit {
  title: string;
  sourceJa: string;
  dateJa: string;
  /** 該当箇所の引用(前後含む・最大160文字)。 */
  snippet: string;
}

const SOURCE_JA: Record<VaultDocument["source"], string> = {
  upload: "ファイル取込",
  planning: "企画部",
  agent: "エージェント",
};

function snippetAround(text: string, keyword: string, width = 160): string {
  const normalized = text.replace(/\s+/g, " ");
  const idx = normalized.indexOf(keyword);
  if (idx < 0) return normalized.slice(0, width) + (normalized.length > width ? "…" : "");
  const start = Math.max(0, idx - Math.floor((width - keyword.length) / 2));
  const piece = normalized.slice(start, start + width);
  return `${start > 0 ? "…" : ""}${piece}${start + width < normalized.length ? "…" : ""}`;
}

/**
 * 保管庫を検索する。1) タイトル/本文/タグの部分一致(該当箇所を引用)
 * 2) ヒットなしなら意味検索(vault チャンクのみ)へフォールバック。
 */
export async function searchVault(query: string, topK = 3): Promise<{
  hits: VaultSearchHit[];
  mode: "substring" | "semantic" | "none";
}> {
  const docs = loadVaultDocs();
  const substringHits: VaultSearchHit[] = docs
    .filter((d) => d.title.includes(query) || d.text.includes(query) || d.tags.some((t) => t.includes(query)))
    .slice(0, topK)
    .map((d) => ({
      title: d.title,
      sourceJa: SOURCE_JA[d.source],
      dateJa: new Date(d.createdAtMs).toLocaleDateString("ja-JP"),
      snippet: snippetAround(d.text, query),
    }));
  if (substringHits.length > 0) return { hits: substringHits, mode: "substring" };

  // 意味検索フォールバック(索引済み vault チャンクのみ)
  try {
    const { hits } = await searchBrain(query, 8);
    const vaultHits = hits
      .filter((h) => h.doc.meta["分類"] === "vault")
      .slice(0, topK)
      .map((h) => ({
        title: h.doc.meta["主体"] ?? "保管文書",
        sourceJa: "保管庫(意味検索)",
        dateJa: h.doc.meta["日時"] ?? "",
        snippet: h.doc.text.slice(0, 160),
      }));
    if (vaultHits.length > 0) return { hits: vaultHits, mode: "semantic" };
  } catch {
    /* 意味検索不可でも部分一致の結果(なし)で応答する */
  }
  return { hits: [], mode: "none" };
}

/** 検索結果をチャット返信文へ整形する(決定論・LLM不要)。 */
export function buildVaultSearchReply(query: string, result: Awaited<ReturnType<typeof searchVault>>): string {
  if (result.hits.length === 0) {
    return `🗄 保管庫に「${query}」に一致する資料は見つかりませんでした。保管庫ページ(Knowledge)から資料を取り込むと検索できるようになります。`;
  }
  const lines = result.hits.map(
    (h) => `📄 ${h.title}(${h.sourceJa}・${h.dateJa})\n「${h.snippet}」`,
  );
  const modeNote = result.mode === "semantic" ? "(意味検索でヒット)" : "";
  return `🗄 保管庫から${result.hits.length}件見つかりました${modeNote}:\n${lines.join("\n")}\n— 全文は保管庫ページ(Knowledge)で確認できます。`;
}
