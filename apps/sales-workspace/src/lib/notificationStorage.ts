import { parseReadIds } from "@musasabi/ai-company";

// 通知の既読IDを localStorage(musasabi.notificationsRead)へ永続化する。
// musasabi.* キーなのでバックアップ/復元の対象に自動的に含まれる。

const KEY = "musasabi.notificationsRead";

export function loadReadIds(): Set<string> {
  try {
    return parseReadIds(localStorage.getItem(KEY));
  } catch {
    return new Set();
  }
}

export function saveReadIds(ids: ReadonlySet<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    /* 容量超過等は無視 */
  }
}
