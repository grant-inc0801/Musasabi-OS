// 定期自動バックアップ(本番実装・完全ローカル)。
// データ管理の手動バックアップ(musasabi.* の localStorage 全件)を、
// ユーザーが一度選んだフォルダへ毎日自動で書き出す(Tauri デスクトップのみ)。
// ブラウザ実行時は自動書き込み先が持てないため無効(手動バックアップは従来どおり)。

import { MUSASABI_KEY_PREFIX, buildBackupJson } from "@musasabi/shared";
import { recordMemory } from "./memoryStorage";
import { appLogger } from "./appLogger";

export interface AutoBackupSettings {
  enabled: boolean;
  /** 保存先フォルダ(Tauri のフォルダ選択ダイアログで設定)。 */
  folderPath: string;
  intervalMinutes: number;
  lastBackupMs: number | null;
  /** 直近の結果メモ(表示用)。 */
  lastResult: string | null;
}

const KEY = "musasabi.autoBackup";

export const DEFAULT_AUTO_BACKUP: AutoBackupSettings = {
  enabled: false,
  folderPath: "",
  intervalMinutes: 1440,
  lastBackupMs: null,
  lastResult: null,
};

export function loadAutoBackup(): AutoBackupSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_AUTO_BACKUP };
    return { ...DEFAULT_AUTO_BACKUP, ...(JSON.parse(raw) as Partial<AutoBackupSettings>) };
  } catch {
    return { ...DEFAULT_AUTO_BACKUP };
  }
}

export function saveAutoBackup(settings: AutoBackupSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function isAutoBackupSupported(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function collectEntries(): Array<[string, string]> {
  const entries: Array<[string, string]> = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(MUSASABI_KEY_PREFIX)) {
      const value = localStorage.getItem(key);
      if (value !== null) entries.push([key, value]);
    }
  }
  return entries;
}

/** フォルダ選択ダイアログで保存先を設定する。選択したパスを返す(キャンセルは null)。 */
export async function chooseBackupFolder(): Promise<string | null> {
  if (!isAutoBackupSupported()) return null;
  const { open } = await import("@tauri-apps/plugin-dialog");
  const path = await open({ directory: true, title: "自動バックアップの保存先フォルダ" });
  if (typeof path !== "string") return null;
  const settings = loadAutoBackup();
  saveAutoBackup({ ...settings, folderPath: path });
  return path;
}

/** 今すぐバックアップを実行する(自動/手動共通)。 */
export async function runBackupNow(): Promise<AutoBackupSettings> {
  const settings = loadAutoBackup();
  let result: string;
  try {
    if (!isAutoBackupSupported()) throw new Error("デスクトップ版のみ自動バックアップに対応しています");
    if (settings.folderPath === "") throw new Error("保存先フォルダが未設定です");
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    const json = buildBackupJson(collectEntries(), Date.now());
    const stamp = new Date().toISOString().slice(0, 10);
    const sep = settings.folderPath.includes("\\") ? "\\" : "/";
    const filePath = `${settings.folderPath}${sep}musasabi-backup-${stamp}.json`;
    await writeFile(filePath, new TextEncoder().encode(json));
    result = `保存成功: ${filePath}(${(json.length / 1024).toFixed(0)}KB)`;
    recordMemory({
      category: "work",
      actor: "system",
      action: "自動バックアップを保存",
      detail: filePath,
      tags: ["auto-backup"],
    });
  } catch (e) {
    result = `失敗: ${String(e)}`;
    appLogger.warn("auto backup failed", { error: String(e) });
  }
  const updated: AutoBackupSettings = {
    ...settings,
    lastBackupMs: Date.now(),
    lastResult: result,
  };
  saveAutoBackup(updated);
  return updated;
}

/** 期限が来ていれば自動バックアップを実行する(スケジューラ tick から呼ぶ)。 */
export async function runBackupIfDue(nowMs = Date.now()): Promise<boolean> {
  const s = loadAutoBackup();
  if (!s.enabled || !isAutoBackupSupported() || s.folderPath === "") return false;
  const due = s.lastBackupMs === null || s.lastBackupMs + s.intervalMinutes * 60 * 1000 <= nowMs;
  if (!due) return false;
  await runBackupNow();
  return true;
}
