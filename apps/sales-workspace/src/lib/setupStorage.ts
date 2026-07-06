import { parseSetupState, type SetupState } from "@musasabi/shared";
import { appLogger } from "./appLogger";

// 初回セットアップ状態の永続化(Phase β-002 優先順位①)。
// 現状は WebView の localStorage を使う。将来 Tauri のネイティブストア
// (tauri-plugin-store 等)へ差し替えられるよう、読み書きをこのモジュールに閉じ込める。
// 実 credential は保存しない(セットアップの進捗フラグのみ)。

const STORAGE_KEY = "musasabi.setupState";

export function loadSetupState(): SetupState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return parseSetupState(raw === null ? null : JSON.parse(raw));
  } catch (error) {
    // 壊れたJSON・localStorage 不可などは初期状態にフォールバックする。
    appLogger.warn("failed to load setup state; falling back to initial", {
      error: String(error),
    });
    return parseSetupState(null);
  }
}

export function saveSetupState(state: SetupState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    appLogger.warn("failed to persist setup state", { error: String(error) });
  }
}
