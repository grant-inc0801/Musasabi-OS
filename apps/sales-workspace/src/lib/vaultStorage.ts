// 保管庫(Knowledge Vault)の実装(本番・完全ローカル)。
// 会社の資料(txt/md/csv 等のテキスト文書)を localStorage に実保存し、
// RAG 索引(brainRag)へチャンク単位で統合する。チャット・エージェント・未来予測が
// 保管庫の実文書を参照できるようになる。外部送信なし。

export interface VaultDocument {
  id: string;
  title: string;
  /** 文書本文(テキスト)。 */
  text: string;
  /** 出所(upload=ファイル取込 / planning=企画部 / agent=エージェント成果物)。 */
  source: "upload" | "planning" | "agent";
  tags: string[];
  createdAtMs: number;
}

const KEY = "musasabi.vaultDocs";
/** 容量上限(合計文字数)。localStorage を圧迫しない範囲。 */
export const VAULT_CAPACITY_CHARS = 400_000;
/** 1文書あたりの上限文字数。 */
const MAX_DOC_CHARS = 40_000;

export function loadVaultDocs(): VaultDocument[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as VaultDocument[]) : [];
    return Array.isArray(parsed) ? parsed.filter((d) => d && typeof d.id === "string") : [];
  } catch {
    return [];
  }
}

function save(docs: readonly VaultDocument[]): void {
  localStorage.setItem(KEY, JSON.stringify(docs));
}

/** 使用容量(合計文字数)。 */
export function vaultUsageChars(docs = loadVaultDocs()): number {
  return docs.reduce((sum, d) => sum + d.text.length, 0);
}

/** 文書を追加する。容量超過時はエラー。 */
export function addVaultDocument(input: {
  title: string;
  text: string;
  source: VaultDocument["source"];
  tags?: string[];
}): VaultDocument {
  const docs = loadVaultDocs();
  const text = input.text.slice(0, MAX_DOC_CHARS);
  if (vaultUsageChars(docs) + text.length > VAULT_CAPACITY_CHARS) {
    throw new Error(`保管庫の容量上限(${Math.round(VAULT_CAPACITY_CHARS / 1000)}千文字)を超えます。不要な文書を削除してください。`);
  }
  const doc: VaultDocument = {
    id: `vault-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title.trim().slice(0, 80) || "無題の文書",
    text,
    source: input.source,
    tags: input.tags ?? [],
    createdAtMs: Date.now(),
  };
  save([doc, ...docs]);
  return doc;
}

export function removeVaultDocument(id: string): VaultDocument[] {
  const next = loadVaultDocs().filter((d) => d.id !== id);
  save(next);
  return next;
}

/** 企画部の「保管庫操作ガイド v1.0」本文(実文書として保管庫へ保存される)。 */
export const PLANNING_GUIDE_TEXT = [
  "保管庫操作ガイド v1.0(企画部作成)",
  "",
  "1. 保管庫とは: 会社の資料(マニュアル・提案資料・議事録など)をこの端末内に実保存する文書ストアです。外部送信はありません。",
  "2. 資料の取込: サイドバー Knowledge → 保管庫(Knowledge Vault)を開き、「資料の取込」から txt / md / csv などのテキストファイルを選択します。複数選択できます。",
  "3. 検索との連携: 保存した資料は Company Brain の意味検索(RAG)へ自動で索引され、AIアシスタントへの相談・エージェント実行・未来予測が内容を参照します。",
  "4. 容量管理: 合計40万文字(1文書あたり4万文字)まで保存できます。使用率は保管庫ページの容量バーで確認し、不要な文書は削除してください。",
  "5. 削除: 保管資料一覧の「削除」で文書を取り除くと、次回の索引更新時に検索対象からも外れます。",
].join("\n");

/**
 * 企画部の保存フロー: 保管庫操作ガイドを実文書として保管庫へ保存する。
 * 同名文書が既にあれば重複保存せず既存を返す(2重押し対策)。
 */
export function savePlanningGuideToVault(): { doc: VaultDocument; created: boolean } {
  const title = "保管庫操作ガイド v1.0";
  const existing = loadVaultDocs().find((d) => d.title === title && d.source === "planning");
  if (existing) return { doc: existing, created: false };
  const doc = addVaultDocument({
    title,
    text: PLANNING_GUIDE_TEXT,
    source: "planning",
    tags: ["planning", "manual"],
  });
  return { doc, created: true };
}

/**
 * エージェント成果物(実行報告・議事録)を保管庫へ自動保存する。
 * 容量超過などの失敗は握りつぶさず結果として返す(呼び出し側で通知に載せる)。
 */
export function saveAgentDocToVault(input: {
  title: string;
  text: string;
  tags?: string[];
}): { ok: true; doc: VaultDocument } | { ok: false; error: string } {
  if (input.text.trim() === "") return { ok: false, error: "本文が空のため保存しませんでした。" };
  try {
    const doc = addVaultDocument({
      title: input.title,
      text: input.text,
      source: "agent",
      tags: input.tags ?? ["agent"],
    });
    return { ok: true, doc };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * RAG索引用のチャンク(1文書を約400文字ごとに分割)。
 * 文書ごとの最大チャンク数を制限して索引の偏りを防ぐ。
 */
export function vaultChunksForIndex(maxChunksPerDoc = 8): Array<{
  id: string;
  text: string;
  meta: Record<string, string>;
}> {
  const chunks: Array<{ id: string; text: string; meta: Record<string, string> }> = [];
  for (const doc of loadVaultDocs()) {
    const normalized = doc.text.replace(/\s+/g, " ").trim();
    for (let i = 0; i < maxChunksPerDoc; i++) {
      const start = i * 400;
      if (start >= normalized.length) break;
      const piece = normalized.slice(start, start + 400);
      chunks.push({
        id: `${doc.id}-c${i}`,
        text: `${doc.title}: ${piece}`,
        meta: {
          分類: "vault",
          主体: doc.title,
          日時: new Date(doc.createdAtMs).toLocaleDateString("ja-JP"),
        },
      });
    }
  }
  return chunks;
}
