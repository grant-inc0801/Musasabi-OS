import type { CallRecord, KpiSnapshot } from "./types";

/**
 * Organization Bible 第4章 営業本部KPI(アポ率/受注率/売上/架電数)のうち、
 * 通話記録から計算可能な範囲を集計する。売上金額は別データソース(FileMaker連携後)。
 */
export function calculateKpi(calls: CallRecord[]): KpiSnapshot {
  const callsMade = calls.length;
  const appointmentsSet = calls.filter((c) => c.outcome === "appointment_set").length;
  const dealsWon = calls.filter((c) => c.outcome === "closed_won").length;

  // dealsWon/appointmentsSet はどちらも同じ `calls` の集計期間内に限定されるため、
  // 成約に至った商談のアポイントが期間外(例: 先週設定・今週成約)だと分子が分母を
  // 超えうる。ダッシュボード表示が100%を超えないようクランプする。
  return {
    callsMade,
    appointmentsSet,
    dealsWon,
    appointmentRate: callsMade === 0 ? 0 : Math.min(1, appointmentsSet / callsMade),
    winRate: appointmentsSet === 0 ? 0 : Math.min(1, dealsWon / appointmentsSet),
  };
}
