import type { SentimentLabel, SentimentPoint, TranscriptSegment } from "./types";

// Development Bible: Deterministic behavior before LLM behavior。
// LLM推論を使わない辞書ベースのスコアリング。将来的な精度向上は辞書拡充で対応する。
const POSITIVE_KEYWORDS = [
  "ありがとうございます",
  "いいですね",
  "興味があります",
  "検討したいです",
  "助かります",
  "満足",
  "嬉しい",
  "お願いします",
];

const NEGATIVE_KEYWORDS = ["高い", "難しい", "結構です", "興味ありません", "忙しい", "不満", "困る", "無理"];

function countOccurrences(text: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
}

function scoreToLabel(score: number): SentimentLabel {
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

export function analyzeSegmentSentiment(segment: TranscriptSegment): SentimentPoint {
  const score = countOccurrences(segment.text, POSITIVE_KEYWORDS) - countOccurrences(segment.text, NEGATIVE_KEYWORDS);
  return {
    timestampMs: segment.timestampMs,
    speaker: segment.speaker,
    sentiment: scoreToLabel(score),
    score,
  };
}

export function buildSentimentTimeline(segments: TranscriptSegment[]): SentimentPoint[] {
  return segments.map(analyzeSegmentSentiment);
}

/**
 * タイムライン全体の総合感情。各ポイントのスコア合計の符号で判定する
 * (件数の多数決ではなくスコア加重にすることで、強い言葉が1件ある場合を弱い言葉複数件より重視する)。
 */
export function summarizeOverallSentiment(timeline: SentimentPoint[]): SentimentLabel {
  const total = timeline.reduce((sum, point) => sum + point.score, 0);
  return scoreToLabel(total);
}
