import { RoutineRecorder, parseRoutines, serializeRoutines, upsertRoutine } from "@musasabi/automation";
import type { AutomationRoutine } from "@musasabi/automation";
import { appLogger } from "./appLogger";

// Automation のローカル永続化と記録フック(この端末のlocalStorageのみ。外部送信なし)。
// recorder はアプリ全体で1つ。記録開始〜停止の間のみページ遷移が記録される
// (手動オプトイン。常時記録はしない)。

const STORAGE_KEY = "musasabi.automationRoutines";

export const routineRecorder = new RoutineRecorder();

/** ページ遷移を記録候補として通知する(記録中でなければ無視される)。 */
export function noteNavigation(target: string, label: string): void {
  routineRecorder.record({ kind: "navigate", target, label, timestampMs: Date.now() });
}

export function loadRoutines(): AutomationRoutine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? [] : parseRoutines(raw);
  } catch (error) {
    appLogger.warn("failed to load automation routines; starting empty", { error: String(error) });
    return [];
  }
}

export function saveRoutine(routine: AutomationRoutine): AutomationRoutine[] {
  try {
    const next = upsertRoutine(loadRoutines(), routine);
    localStorage.setItem(STORAGE_KEY, serializeRoutines(next));
    return next;
  } catch (error) {
    appLogger.warn("failed to persist automation routines", { error: String(error) });
    return loadRoutines();
  }
}
