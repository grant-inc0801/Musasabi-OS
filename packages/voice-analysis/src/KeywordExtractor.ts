import type { TranscriptSegment } from "./types";

// docs/department-playbooks/sales.md の営業フローに関連する、検知したいキーワードのウォッチリスト。
// AI Sales Employee(packages/ai-core)の推奨アクション同様、決定的なキーワードスポッティングのみを行う。
const WATCHED_KEYWORDS = [
  "高い",
  "予算",
  "検討します",
  "他社",
  "考えます",
  "契約します",
  "申し込みます",
  "進めてください",
  "解約",
];

/**
 * トランスクリプト全体からウォッチリストに含まれるキーワードを検知する(重複除去、出現順)。
 */
export function extractKeywords(segments: TranscriptSegment[]): string[] {
  const found: string[] = [];
  for (const segment of segments) {
    for (const keyword of WATCHED_KEYWORDS) {
      if (segment.text.includes(keyword) && !found.includes(keyword)) {
        found.push(keyword);
      }
    }
  }
  return found;
}
