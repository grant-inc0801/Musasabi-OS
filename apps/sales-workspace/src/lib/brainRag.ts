// Company Brain 意味検索+RAG のアプリ側配線(完全ローカル・無課金)。
// 埋め込みは Ollama(nomic-embed-text)を自動検出し、未検出時はハッシュ埋め込み。
// 索引は localStorage に増分保存する。デスクトップでは Rust プロキシ経由で接続。

import {
  VectorIndex,
  buildRagContext,
  detectEmbeddings,
  indexDocuments,
  type DetectedEmbeddings,
  type SearchHit,
} from "@musasabi/brain-rag";
import { loadMemoryRecords } from "./memoryStorage";
import { loadDeptChatHistory } from "./deptChatStorage";
import { vaultChunksForIndex } from "./vaultStorage";
import { loadLlmSettings } from "./llmSettings";
import { resolveLlmFetch } from "./llmFetch";

const INDEX_KEY = "musasabi.brainIndex";
const EMBED_MODEL = "nomic-embed-text";
/** 索引する直近レコード上限(localStorage 容量対策)。 */
const MAX_DOCS = 300;

let detectedCache: DetectedEmbeddings | null = null;

async function detect(): Promise<DetectedEmbeddings> {
  if (detectedCache) return detectedCache;
  const llm = loadLlmSettings();
  const f = await resolveLlmFetch();
  detectedCache = await detectEmbeddings({ baseUrl: llm.baseUrl, embedModel: EMBED_MODEL }, f);
  return detectedCache;
}

function loadIndex(): VectorIndex {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? VectorIndex.fromJSON(raw) : new VectorIndex();
  } catch {
    return new VectorIndex();
  }
}

function saveIndex(index: VectorIndex): void {
  try {
    // ベクトルを4桁へ丸めてJSONサイズを圧縮する
    const docs = index.toJSON().map((d) => ({
      ...d,
      vector: d.vector.map((x) => Math.round(x * 1e4) / 1e4),
    }));
    localStorage.setItem(INDEX_KEY, JSON.stringify(docs));
  } catch {
    // 容量超過などは索引保存をあきらめる(次回また増分構築される)
  }
}

export interface BrainRagState {
  providerName: string;
  source: "ollama" | "fallback";
  indexedCount: number;
}

/** Company Brain の記録を索引へ増分取り込みする。 */
export async function ensureBrainIndex(): Promise<BrainRagState> {
  const detected = await detect();
  const index = loadIndex();
  const records = loadMemoryRecords().slice(0, MAX_DOCS);
  const docs = records.map((r) => ({
    id: r.id,
    text: `${r.action}: ${r.detail}`.slice(0, 400),
    meta: {
      分類: r.category,
      主体: r.actor,
      日時: new Date(r.timestampMs).toLocaleDateString("ja-JP"),
    },
  }));
  // チャット履歴(過去の相談・指示と回答)も索引対象にする — アシスタントが過去の会話を思い出せる
  const chats = loadDeptChatHistory().slice(0, 100);
  for (const c of chats) {
    docs.push({
      id: `chat-${c.atMs}`,
      text: `相談: ${c.message} / 回答: ${c.reply}`.slice(0, 400),
      meta: {
        分類: "chat",
        主体: c.deptName,
        日時: new Date(c.atMs).toLocaleDateString("ja-JP"),
      },
    });
  }
  // 保管庫(Knowledge Vault)の実文書もチャンク単位で索引する — 会社の全資料を頭脳が引ける
  const vaultChunks = vaultChunksForIndex();
  docs.push(...vaultChunks);
  // 削除済み文書の古いチャンクを索引から掃除する(保管庫で削除→検索にも出さない)
  const liveVaultIds = new Set(vaultChunks.map((c) => c.id));
  let pruned = 0;
  for (const d of index.toJSON()) {
    // 索引IDは「<埋め込み種別>:<チャンクID>」形式のため、接頭辞を外して照合する
    const rawId = d.id.replace(/^[^:]+:/, "");
    if (d.meta?.分類 === "vault" && !liveVaultIds.has(rawId)) {
      index.remove(d.id);
      pruned++;
    }
  }
  const added = await indexDocuments(index, detected.provider, docs);
  if (added > 0 || pruned > 0) saveIndex(index);
  return { providerName: detected.provider.name, source: detected.source, indexedCount: index.size };
}

export interface VaultIndexCoverage {
  /** 索引済みの保管庫チャンク数。 */
  indexedChunks: number;
  /** 保管庫の全チャンク数(索引対象)。 */
  totalChunks: number;
  /** 保管庫の文書数。 */
  docCount: number;
}

/** 保管庫の索引カバレッジ(索引済みチャンク/全チャンク)。 */
export function vaultIndexCoverage(): VaultIndexCoverage {
  const chunks = vaultChunksForIndex();
  const liveIds = new Set(chunks.map((c) => c.id));
  const indexedChunks = loadIndex()
    .toJSON()
    .filter((d) => d.meta?.["分類"] === "vault" && liveIds.has(d.id.replace(/^[^:]+:/, ""))).length;
  return { indexedChunks, totalChunks: chunks.length, docCount: loadVaultDocsCount() };
}

function loadVaultDocsCount(): number {
  try {
    const raw = localStorage.getItem("musasabi.vaultDocs");
    const parsed = raw ? (JSON.parse(raw) as unknown[]) : [];
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/** 意味検索: クエリに関連する社内記録を返す。 */
export async function searchBrain(query: string, topK = 5): Promise<{
  hits: SearchHit[];
  state: BrainRagState;
}> {
  const state = await ensureBrainIndex();
  const detected = await detect();
  const hits = await loadIndex().search(query, detected.provider, topK);
  return { hits, state };
}

/** RAG: クエリに関連する社内データをプロンプト用コンテキストへ整形する(なければ空)。 */
export async function ragContextFor(query: string): Promise<string> {
  try {
    const { hits } = await searchBrain(query, 3);
    return buildRagContext(hits);
  } catch {
    return "";
  }
}
