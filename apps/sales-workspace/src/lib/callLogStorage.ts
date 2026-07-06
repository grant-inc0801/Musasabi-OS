import { parseCallLog, serializeCallLog, upsertSession } from "@musasabi/call-training";
import type { TestCallSession } from "@musasabi/call-training";
import { appLogger } from "./appLogger";

// テストコール履歴のローカル永続化(この端末のlocalStorageのみ。外部送信なし)。
// 直列化・検証は @musasabi/call-training の persistence(テスト済み)に任せる。
// デスクトップのSQLite保存(TestCallRepository)への切り替えは後続フェーズ。

const STORAGE_KEY = "musasabi.testCallLog";

export function loadCallLog(): TestCallSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? [] : parseCallLog(raw);
  } catch (error) {
    appLogger.warn("failed to load test call log; starting empty", { error: String(error) });
    return [];
  }
}

export function saveSessionToCallLog(session: TestCallSession): void {
  try {
    const next = upsertSession(loadCallLog(), session);
    localStorage.setItem(STORAGE_KEY, serializeCallLog(next));
  } catch (error) {
    appLogger.warn("failed to persist test call log", { error: String(error) });
  }
}
