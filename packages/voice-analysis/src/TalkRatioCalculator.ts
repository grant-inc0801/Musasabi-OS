import type { TalkRatio, TranscriptSegment } from "./types";

/**
 * 発話時間ベースの担当者/顧客の比率(0〜1、合計1になるよう正規化)。
 * セグメントが無い場合は両者0とする(NaN比率を返さない)。
 */
export function calculateTalkRatio(segments: TranscriptSegment[]): TalkRatio {
  const repMs = segments.filter((s) => s.speaker === "rep").reduce((sum, s) => sum + s.durationMs, 0);
  const customerMs = segments.filter((s) => s.speaker === "customer").reduce((sum, s) => sum + s.durationMs, 0);
  const totalMs = repMs + customerMs;

  if (totalMs === 0) {
    return { rep: 0, customer: 0 };
  }

  return { rep: repMs / totalMs, customer: customerMs / totalMs };
}
