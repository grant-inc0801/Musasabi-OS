import type { CommandDepartment } from "./commandCenter";

// 部署チャットのMock応答生成(Command Center チャット強化フェーズ)。
// 部署の状態・進捗・タスク・ログから決定的に日本語応答を組み立てる。
// β版はローカル生成のみ(実AI API・外部送信なし)。

/** チャット1件(指示+部署応答)。localStorage 永続化にも使う。 */
export interface DeptChatEntry {
  /** 指示先部署ID。 */
  deptId: string;
  /** 指示先部署名(表示用スナップショット)。 */
  deptName: string;
  /** ユーザーの指示本文。 */
  message: string;
  /** 部署のMock応答。 */
  reply: string;
  /** 送信時刻(epoch ms)。 */
  atMs: number;
}

/** 履歴の最大保持件数。 */
export const DEPT_CHAT_MAX_ENTRIES = 50;

/**
 * 部署状態に応じたMock応答を生成する。
 * - 「進捗」「状況」: 進捗率+直近ログ
 * - 「課題」「問題」「エラー」: エラー/承認待ちがあれば原因と対処、なければ順調報告
 * - 「目標」「優先」「タスク」: 現在のタスク一覧
 * - その他: 指示の受領+着手中タスクの報告
 */
export function buildDeptReplyJa(dept: CommandDepartment, message: string): string {
  const head = `【${dept.name}】`;
  const topTask = dept.tasks[0] ?? "割当タスクなし";
  if (/進捗|状況/.test(message)) {
    const latest = dept.logs[0] ? `直近の作業: ${dept.logs[0]}` : "本日の作業ログはまだありません";
    return `${head}現在の進捗は${dept.progressPercent}%です。${latest}`;
  }
  if (/課題|問題|エラー/.test(message)) {
    if (dept.status === "error") {
      return `${head}エラーが発生しています。原因: ${dept.errorCause ?? "調査中"}。対処: ${dept.errorFix ?? "対応策を検討中"}`;
    }
    if (dept.status === "waiting_approval") {
      return `${head}承認待ちの案件があります。承認されると次の工程へ進みます。`;
    }
    return `${head}現在大きな課題はありません。「${topTask}」を順調に進めています。`;
  }
  if (/目標|優先|タスク/.test(message)) {
    return `${head}現在のタスクは ${dept.tasks.join(" / ")} です(進捗${dept.progressPercent}%)。`;
  }
  return `${head}指示を受領しました。現在「${topTask}」に着手しています(メンバー${dept.memberCount}人・進捗${dept.progressPercent}%)。`;
}

/** 履歴配列に1件追加して最大件数に丸める(新しい順)。 */
export function appendChatEntry(
  history: readonly DeptChatEntry[],
  entry: DeptChatEntry,
): DeptChatEntry[] {
  return [entry, ...history].slice(0, DEPT_CHAT_MAX_ENTRIES);
}

/** 指定部署あての直近の指示を取り出す(新しい順)。 */
export function recentEntriesFor(
  history: readonly DeptChatEntry[],
  deptId: string,
  limit = 3,
): DeptChatEntry[] {
  return history.filter((e) => e.deptId === deptId).slice(0, limit);
}

/** JSON文字列から履歴を復元する。壊れた入力は空配列。 */
export function parseChatHistory(json: string | null): DeptChatEntry[] {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is DeptChatEntry =>
          typeof e === "object" &&
          e !== null &&
          typeof (e as DeptChatEntry).deptId === "string" &&
          typeof (e as DeptChatEntry).deptName === "string" &&
          typeof (e as DeptChatEntry).message === "string" &&
          typeof (e as DeptChatEntry).reply === "string" &&
          typeof (e as DeptChatEntry).atMs === "number",
      )
      .slice(0, DEPT_CHAT_MAX_ENTRIES);
  } catch {
    return [];
  }
}
