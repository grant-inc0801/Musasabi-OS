import type { CallRecord, KpiSnapshot } from "./types";

/**
 * Organization Bible 第4章 営業本部KPI(アポ率/受注率/売上/架電数)のうち、
 * 通話記録から計算可能な範囲を集計する。売上金額は別データソース(FileMaker連携後)。
 */
export function calculateKpi(calls: CallRecord[]): KpiSnapshot {
  const callsMade = calls.length;
  const appointmentsSet = calls.filter((c) => c.outcome === "appointment_set").length;
  const dealsWon = calls.filter((c) => c.outcome === "closed_won").length;

  return {
    callsMade,
    appointmentsSet,
    dealsWon,
    appointmentRate: callsMade === 0 ? 0 : appointmentsSet / callsMade,
    winRate: appointmentsSet === 0 ? 0 : dealsWon / appointmentsSet,
  };
}
