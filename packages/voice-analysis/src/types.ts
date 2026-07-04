// 通話音声解析のドメイン型。Development Bible 第10章(Voice)を参照。

export type Speaker = "rep" | "customer";

export interface TranscriptSegment {
  speaker: Speaker;
  text: string;
  timestampMs: number;
  durationMs: number;
}

export type SentimentLabel = "positive" | "neutral" | "negative";

export interface SentimentPoint {
  timestampMs: number;
  speaker: Speaker;
  sentiment: SentimentLabel;
  score: number;
}

export interface TalkRatio {
  rep: number;
  customer: number;
}

export interface CallAnalysisSummary {
  callId: string;
  sentimentTimeline: SentimentPoint[];
  overallSentiment: SentimentLabel;
  keywords: string[];
  talkRatio: TalkRatio;
  summary: string;
}
