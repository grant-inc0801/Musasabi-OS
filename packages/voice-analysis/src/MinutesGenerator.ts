import { generateCallSummary } from "./CallSummaryGenerator";
import type { CallAnalysisSummary, Speaker, TranscriptSegment } from "./types";

// 議事録生成(Development Bible 第10章「議事録」)。
// KeywordExtractor 同様、決定的なキーワードスポッティングのみでLLM推論は行わない。
// 入力はテストコール等の会話ターン列。実音声・実APIには接続しない。

/** 議事録の入力となる会話ターン(コール機能の TestCallTurn と互換の最小形)。 */
export interface MinutesTurn {
  /** "ai" = AI社員(担当者) / "human" = 顧客役。 */
  speaker: "ai" | "human";
  text: string;
  timestampMs: number;
}

/** 生成された議事録。 */
export interface CallMinutes {
  callId: string;
  /** 参加者表示(担当者/顧客役)。 */
  participants: string[];
  /** 決定事項(顧客の前向き表明を含む発話)。 */
  decisions: string[];
  /** 宿題・フォローアップ(後日対応を約束した発話)。 */
  actionItems: string[];
  /** 解析サマリ(感情・キーワード・トーク比率・要約文)。 */
  analysis: CallAnalysisSummary;
}

// 決定事項とみなす表現(顧客・担当者の合意/前進の表明)。
const DECISION_MARKERS = ["契約します", "申し込みます", "進めてください", "導入します", "決定"];

// 宿題・フォローアップとみなす表現(後日対応の約束)。
const ACTION_MARKERS = [
  "確認します",
  "お送りします",
  "送ります",
  "後日",
  "改めて",
  "再送",
  "見積",
  "資料",
];

/** 発話1文字あたりの推定発話時間(ms)。決定的なトーク比率算出用。 */
const MS_PER_CHAR = 150;

/**
 * 会話ターン列を解析用トランスクリプトへ変換する。
 * AI社員を担当者(rep)、人間(顧客役)を customer として扱い、
 * 発話時間は文字数から決定的に推定する(実音声なしのため)。
 */
export function toTranscriptSegments(turns: readonly MinutesTurn[]): TranscriptSegment[] {
  return turns.map((turn) => ({
    speaker: (turn.speaker === "ai" ? "rep" : "customer") as Speaker,
    text: turn.text,
    timestampMs: turn.timestampMs,
    durationMs: Math.max(turn.text.length, 1) * MS_PER_CHAR,
  }));
}

function pickLines(turns: readonly MinutesTurn[], markers: readonly string[]): string[] {
  const found: string[] = [];
  for (const turn of turns) {
    if (markers.some((m) => turn.text.includes(m)) && !found.includes(turn.text)) {
      found.push(turn.text);
    }
  }
  return found;
}

/**
 * 会話ターン列から議事録を生成する(決定的ロジックのみ)。
 * 決定事項・宿題はキーワードスポッティングで抽出し、
 * 感情・キーワード・トーク比率・要約は既存の解析器に委譲する。
 */
export function generateCallMinutes(callId: string, turns: readonly MinutesTurn[]): CallMinutes {
  const segments = toTranscriptSegments(turns);
  return {
    callId,
    participants: ["AI社員(担当者)", "顧客役"],
    decisions: pickLines(turns, DECISION_MARKERS),
    actionItems: pickLines(turns, ACTION_MARKERS),
    analysis: generateCallSummary(callId, segments),
  };
}
