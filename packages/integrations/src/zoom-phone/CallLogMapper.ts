import type { CallOutcome, CallRecord } from "@musasabi/ai-core";
import type { ZoomCallLogEntry, ZoomCallResult } from "./types";

const UNANSWERED_RESULTS: readonly ZoomCallResult[] = [
  "No Answer",
  "Busy",
  "Voicemail",
  "Call Failed",
  "Missed",
];

/**
 * Zoom Phoneのcall result(接続可否)から確実にわかる範囲でのみ CallOutcome を推定する。
 * 応答済み(Call connected)の通話は、実際の商談結果(アポ獲得/興味なし/成約等)を
 * Zoomのメタデータだけでは判断できないため、ここでは断定せず null を返す
 * (営業担当の入力、またはVoice Analysis(Phase 6)による判定を待つ)。
 */
export function resolveOutcomeFromCallResult(result: ZoomCallResult): CallOutcome | null {
  return UNANSWERED_RESULTS.includes(result) ? "no_answer" : null;
}

/**
 * Zoom通話ログを ai-core の CallRecord に変換する。
 * outcomeが確定できない(応答済みで manualOutcome も無い)場合は null を返し、
 * 呼び出し側が誤ったKPI集計に含めてしまわないようにする。
 */
export function mapCallLogToCallRecord(
  entry: ZoomCallLogEntry,
  leadId: string,
  manualOutcome?: CallOutcome,
): CallRecord | null {
  const outcome = manualOutcome ?? resolveOutcomeFromCallResult(entry.result);
  if (!outcome) {
    return null;
  }
  return { id: entry.id, leadId, occurredAt: entry.dateTime, outcome };
}

/**
 * 電話番号からリードIDを引く。実運用では発信元/着信先の電話番号表記ゆれ
 * (ハイフンの有無等)の正規化が必要になるが、それはFileMaker連携側のデータ品質に
 * 依存するため、このマッパーでは正規化前提のマップをそのまま引く。
 */
export function resolveLeadIdByPhoneNumber(
  phoneNumber: string,
  leadIdByPhoneNumber: Record<string, string>,
): string | null {
  return leadIdByPhoneNumber[phoneNumber] ?? null;
}
