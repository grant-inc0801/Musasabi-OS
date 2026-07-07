// ローカルデータのバックアップ/復元(JSON直列化・検証)。
// 対象は musasabi.* プレフィックスの localStorage エントリのみ
// (Memory・コールログ・営業リスト・自動化ルーチン・各種設定)。
// VRMファイル(IndexedDB)はサイズの都合で対象外(UI側で明記)。
// 保存・復元はこの端末内で完結し、外部送信はしない。

export const BACKUP_SCHEMA_VERSION = 1;

/** バックアップ対象キーのプレフィックス。これ以外のキーは出力・復元しない。 */
export const MUSASABI_KEY_PREFIX = "musasabi.";

export interface BackupSnapshot {
  version: number;
  exportedAtMs: number;
  entries: Record<string, string>;
}

/** localStorage のエントリ群からバックアップJSON文字列を作る。 */
export function buildBackupJson(entries: Record<string, string>, nowMs: number): string {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(entries)) {
    if (key.startsWith(MUSASABI_KEY_PREFIX) && typeof value === "string") {
      filtered[key] = value;
    }
  }
  const snapshot: BackupSnapshot = {
    version: BACKUP_SCHEMA_VERSION,
    exportedAtMs: nowMs,
    entries: filtered,
  };
  return JSON.stringify(snapshot, null, 2);
}

/**
 * バックアップJSONを検証して復元用エントリを返す。
 * 壊れたJSON・バージョン不一致・プレフィックス外のキー・文字列以外の値は拒否/除外する。
 * 失敗時は null(呼び出し側で日本語エラー表示)。
 */
export function parseBackupJson(value: unknown): BackupSnapshot | null {
  let data = value;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const snapshot = data as Partial<BackupSnapshot>;
  if (snapshot.version !== BACKUP_SCHEMA_VERSION) {
    return null;
  }
  if (typeof snapshot.entries !== "object" || snapshot.entries === null) {
    return null;
  }
  const entries: Record<string, string> = {};
  for (const [key, val] of Object.entries(snapshot.entries)) {
    if (key.startsWith(MUSASABI_KEY_PREFIX) && typeof val === "string") {
      entries[key] = val;
    }
  }
  return {
    version: BACKUP_SCHEMA_VERSION,
    exportedAtMs: typeof snapshot.exportedAtMs === "number" ? snapshot.exportedAtMs : 0,
    entries,
  };
}
