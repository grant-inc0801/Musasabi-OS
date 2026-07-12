// Company Brain 意味検索+RAG(ローカル・無課金)。
// 埋め込みは無料ローカルLLM(Ollama 互換 /api/embeddings・既定モデル nomic-embed-text)を
// 第一候補とし、未検出時は決定論ハッシュ埋め込みへフォールバックする(どちらも外部送信なし)。
// ベクトル索引はメモリ内+シリアライズ可能(呼び出し側が localStorage 等へ保存)。

export interface EmbeddingProvider {
  /** 表示名(UI用)。 */
  name: string;
  kind: "ollama" | "hash";
  /** 埋め込み次元数。 */
  dimension: number;
  embed(text: string): Promise<number[]>;
}

export interface RagSettings {
  baseUrl: string;
  embedModel: string;
}

export const DEFAULT_RAG_SETTINGS: RagSettings = {
  baseUrl: "http://127.0.0.1:11434",
  embedModel: "nomic-embed-text",
};

type FetchLike = (url: string, init?: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

const defaultFetch: FetchLike = (url, init) =>
  (fetch as unknown as FetchLike)(url, init);

/** Ollama 互換 /api/embeddings プロバイダ(無料・ローカル)。 */
export class OllamaEmbeddings implements EmbeddingProvider {
  readonly kind = "ollama" as const;
  readonly name: string;
  readonly dimension = 768; // nomic-embed-text の次元(モデルにより実次元は応答から採用)

  constructor(
    private readonly settings: RagSettings = DEFAULT_RAG_SETTINGS,
    private readonly fetchImpl: FetchLike = defaultFetch,
    private readonly timeoutMs = 30000,
  ) {
    this.name = `ローカル埋め込み(Ollama: ${settings.embedModel})`;
  }

  /** 埋め込みモデルが使えるか確認する(1件埋め込んでみる)。 */
  async isAvailable(probeTimeoutMs = 4000): Promise<boolean> {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), probeTimeoutMs);
      const v = await this.embedWithSignal("ping", ctl.signal);
      clearTimeout(timer);
      return v.length > 0;
    } catch {
      return false;
    }
  }

  async embed(text: string): Promise<number[]> {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), this.timeoutMs);
    try {
      return await this.embedWithSignal(text, ctl.signal);
    } finally {
      clearTimeout(timer);
    }
  }

  private async embedWithSignal(text: string, signal: AbortSignal): Promise<number[]> {
    const res = await this.fetchImpl(`${this.settings.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: this.settings.embedModel, prompt: text }),
      signal,
    });
    if (!res.ok) throw new Error(`ollama embeddings http ${res.status}`);
    const data = (await res.json()) as { embedding?: number[] };
    const v = data.embedding ?? [];
    if (v.length === 0) throw new Error("ollama embeddings empty");
    return v;
  }
}

/**
 * 決定論ハッシュ埋め込み(フォールバック)。文字 n-gram を固定次元へハッシュ集約する。
 * 意味理解はしないが、語彙の重なりベースの検索が LLM なしでも動く(完全ローカル)。
 */
export class HashEmbeddings implements EmbeddingProvider {
  readonly kind = "hash" as const;
  readonly name = "ハッシュ埋め込み(フォールバック・決定論)";
  readonly dimension: number;

  constructor(dimension = 256) {
    this.dimension = dimension;
  }

  async embed(text: string): Promise<number[]> {
    const v = new Array<number>(this.dimension).fill(0);
    const normalized = text.toLowerCase().replace(/\s+/g, " ");
    for (let n = 2; n <= 3; n++) {
      for (let i = 0; i + n <= normalized.length; i++) {
        const gram = normalized.slice(i, i + n);
        let h = 2166136261;
        for (let j = 0; j < gram.length; j++) {
          h ^= gram.charCodeAt(j);
          h = Math.imul(h, 16777619);
        }
        v[Math.abs(h) % this.dimension] += 1;
      }
    }
    // L2 正規化(コサイン類似の内積化)
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    return v.map((x) => x / norm);
  }
}

export interface DetectedEmbeddings {
  provider: EmbeddingProvider;
  source: "ollama" | "fallback";
}

/** 埋め込みプロバイダを検出する。Ollama+埋め込みモデルが使えれば実埋め込み。 */
export async function detectEmbeddings(
  settings: RagSettings = DEFAULT_RAG_SETTINGS,
  fetchImpl?: FetchLike,
): Promise<DetectedEmbeddings> {
  const ollama = new OllamaEmbeddings(settings, fetchImpl);
  if (await ollama.isAvailable()) {
    return { provider: ollama, source: "ollama" };
  }
  return { provider: new HashEmbeddings(), source: "fallback" };
}

// ─────────────────────── ベクトル索引 ───────────────────────

export interface IndexedDoc {
  id: string;
  /** 検索対象テキスト(埋め込み時の原文)。 */
  text: string;
  /** 表示用メタ(カテゴリ・日時など任意)。 */
  meta: Record<string, string>;
  vector: number[];
  /** 埋め込みプロバイダ種別(混在検索を防ぐ)。 */
  embeddingKind: "ollama" | "hash";
}

export interface SearchHit {
  doc: IndexedDoc;
  score: number;
}

function cosine(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/** メモリ内ベクトル索引。シリアライズして localStorage 等に保存できる。 */
export class VectorIndex {
  private docs = new Map<string, IndexedDoc>();

  constructor(docs?: readonly IndexedDoc[]) {
    for (const d of docs ?? []) this.docs.set(d.id, d);
  }

  get size(): number {
    return this.docs.size;
  }

  has(id: string): boolean {
    return this.docs.has(id);
  }

  upsert(doc: IndexedDoc): void {
    this.docs.set(doc.id, doc);
  }

  remove(id: string): void {
    this.docs.delete(id);
  }

  /** 指定プロバイダで埋め込んだ文書のみを対象に topK 検索する。 */
  async search(
    query: string,
    provider: EmbeddingProvider,
    topK = 5,
    minScore = 0.15,
  ): Promise<SearchHit[]> {
    const qv = await provider.embed(query);
    const hits: SearchHit[] = [];
    for (const doc of this.docs.values()) {
      if (doc.embeddingKind !== provider.kind) continue;
      const score = cosine(qv, doc.vector);
      if (score >= minScore) hits.push({ doc, score });
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, topK);
  }

  toJSON(): IndexedDoc[] {
    return [...this.docs.values()];
  }

  static fromJSON(raw: string): VectorIndex {
    try {
      const parsed = JSON.parse(raw) as IndexedDoc[];
      if (!Array.isArray(parsed)) return new VectorIndex();
      return new VectorIndex(parsed.filter((d) => d && typeof d.id === "string" && Array.isArray(d.vector)));
    } catch {
      return new VectorIndex();
    }
  }
}

/**
 * 文書群を索引へ取り込む(既存IDはスキップ=増分索引)。
 * 取り込んだ件数を返す。
 */
export async function indexDocuments(
  index: VectorIndex,
  provider: EmbeddingProvider,
  docs: ReadonlyArray<{ id: string; text: string; meta?: Record<string, string> }>,
): Promise<number> {
  let added = 0;
  for (const d of docs) {
    const id = `${provider.kind}:${d.id}`;
    if (index.has(id)) continue;
    const vector = await provider.embed(d.text);
    index.upsert({ id, text: d.text, meta: d.meta ?? {}, vector, embeddingKind: provider.kind });
    added += 1;
  }
  return added;
}

/** RAG 用: 検索ヒットをLLMプロンプトに差し込むコンテキスト文字列へ整形する。 */
export function buildRagContext(hits: readonly SearchHit[], maxChars = 900): string {
  if (hits.length === 0) return "";
  const lines: string[] = [];
  let used = 0;
  for (const h of hits) {
    const metaStr = Object.entries(h.doc.meta)
      .map(([k, v]) => `${k}:${v}`)
      .join(" ");
    const line = `- ${h.doc.text}${metaStr ? `(${metaStr})` : ""}`;
    if (used + line.length > maxChars) break;
    lines.push(line);
    used += line.length;
  }
  return lines.join("\n");
}
