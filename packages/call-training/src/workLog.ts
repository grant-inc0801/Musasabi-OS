// Learning Mode の「日々の作業内容」手動学習ログ(D-20260706-006 既存修正継続分)。
// ユーザーが日々の作業内容・気づきを手動登録し、全AI社員共通ナレッジの学習素材にする。
// 決定論的・イミュータブル。永続化(localStorage/JSON)はアプリ側で行う。

/** 手動登録された1件の作業内容。 */
export interface WorkLogEntry {
  id: string;
  /** 対象部門ID(全社共通の学びは null)。 */
  departmentId: string | null;
  text: string;
  timestampMs: number;
}

/** 作業内容を追加した新しいリストを返す。空文字は無視して同じリストを返す。 */
export function addWorkLogEntry(
  entries: readonly WorkLogEntry[],
  input: { departmentId: string | null; text: string; nowMs: number },
): WorkLogEntry[] {
  const text = input.text.trim();
  if (text.length === 0) {
    return [...entries];
  }
  const entry: WorkLogEntry = {
    id: `worklog-${input.nowMs}-${entries.length + 1}`,
    departmentId: input.departmentId,
    text,
    timestampMs: input.nowMs,
  };
  return [...entries, entry];
}

/** 指定部門の作業ログを新しい順で返す(null 指定で全件)。 */
export function listWorkLogEntries(
  entries: readonly WorkLogEntry[],
  departmentId: string | null = null,
): WorkLogEntry[] {
  const filtered =
    departmentId === null ? [...entries] : entries.filter((e) => e.departmentId === departmentId);
  return filtered.sort((a, b) => b.timestampMs - a.timestampMs);
}

/** 保存値(unknown)を検証して復元する。壊れた要素は捨てる。 */
export function parseWorkLogEntries(value: unknown): WorkLogEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const entries: WorkLogEntry[] = [];
  for (const item of value) {
    if (
      typeof item === "object" &&
      item !== null &&
      typeof (item as WorkLogEntry).id === "string" &&
      typeof (item as WorkLogEntry).text === "string" &&
      typeof (item as WorkLogEntry).timestampMs === "number" &&
      ((item as WorkLogEntry).departmentId === null ||
        typeof (item as WorkLogEntry).departmentId === "string")
    ) {
      entries.push({
        id: (item as WorkLogEntry).id,
        departmentId: (item as WorkLogEntry).departmentId,
        text: (item as WorkLogEntry).text,
        timestampMs: (item as WorkLogEntry).timestampMs,
      });
    }
  }
  return entries;
}
