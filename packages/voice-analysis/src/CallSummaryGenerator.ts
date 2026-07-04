import { buildSentimentTimeline, summarizeOverallSentiment } from "./SentimentAnalyzer";
import { extractKeywords } from "./KeywordExtractor";
import { calculateTalkRatio } from "./TalkRatioCalculator";
import type { CallAnalysisSummary, SentimentLabel, TranscriptSegment } from "./types";

const SENTIMENT_LABEL_JA: Record<SentimentLabel, string> = {
  positive: "良好",
  neutral: "中立",
  negative: "要注意",
};

function buildSummaryText(overallSentiment: SentimentLabel, keywords: string[], repRatio: number): string {
  const repPercent = Math.round(repRatio * 100);
  const keywordText = keywords.length > 0 ? keywords.join("、") : "特になし";
  return `顧客の感情は${SENTIMENT_LABEL_JA[overallSentiment]}。検出キーワード: ${keywordText}。担当者の発話比率は${repPercent}%。`;
}

/**
 * トランスクリプトから通話サマリを生成する(決定的ロジックのみ、LLM推論なし)。
 * Development Bible 第10章、docs/ARCHITECTURE.md Phase 6 受け入れ基準。
 */
export function generateCallSummary(callId: string, segments: TranscriptSegment[]): CallAnalysisSummary {
  const sentimentTimeline = buildSentimentTimeline(segments);
  const overallSentiment = summarizeOverallSentiment(sentimentTimeline);
  const keywords = extractKeywords(segments);
  const talkRatio = calculateTalkRatio(segments);

  return {
    callId,
    sentimentTimeline,
    overallSentiment,
    keywords,
    talkRatio,
    summary: buildSummaryText(overallSentiment, keywords, talkRatio.rep),
  };
}
