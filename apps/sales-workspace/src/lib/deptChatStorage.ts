import {
  appendChatEntry,
  parseChatHistory,
  type DeptChatEntry,
} from "@musasabi/ai-company";

// 部署チャット履歴の localStorage 永続化。バックアップ/復元(musasabi.* 一括)の
// 対象に自動的に含まれる。

const DEPT_CHAT_KEY = "musasabi.deptChatHistory";

export function loadDeptChatHistory(): DeptChatEntry[] {
  try {
    return parseChatHistory(localStorage.getItem(DEPT_CHAT_KEY));
  } catch {
    return [];
  }
}

/** 1件追記して保存し、保存後の履歴(新しい順)を返す。 */
export function appendDeptChat(entry: DeptChatEntry): DeptChatEntry[] {
  const next = appendChatEntry(loadDeptChatHistory(), entry);
  try {
    localStorage.setItem(DEPT_CHAT_KEY, JSON.stringify(next));
  } catch {
    // 容量超過等は無視(表示は続行)
  }
  return next;
}
