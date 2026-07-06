import { parseWorkLogEntries } from "@musasabi/call-training";
import type { WorkLogEntry } from "@musasabi/call-training";
import { appLogger } from "./appLogger";

// Learning Mode の「日々の作業内容」手動学習ログの永続化(D-20260706-006)。
// localStorage(WebView内ローカル)のみで、実DB・外部送信は行わない。

const STORAGE_KEY = "musasabi.workLog";

export function loadWorkLog(): WorkLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    return parseWorkLogEntries(JSON.parse(raw));
  } catch (error) {
    appLogger.warn("failed to load work log; starting empty", { error: String(error) });
    return [];
  }
}

export function saveWorkLog(entries: readonly WorkLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    appLogger.warn("failed to persist work log", { error: String(error) });
  }
}
