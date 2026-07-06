import { AI_EMPLOYEES } from "@musasabi/ai-company";
import type { BarSeries } from "../charts/HBarChart";

// 営業部のコール結果Mockデータと系列定義(KPIページ/グラフ共用)。
// 実データ連携は後続フェーズ。系列色は検証済みダークパレット(コントラスト/CVD PASS)。

export const CALL_SERIES: readonly BarSeries[] = [
  { key: "calls", label: "架電数", color: "#3987e5" },
  { key: "appointments", label: "アポ獲得数", color: "#199e70" },
  { key: "deals", label: "成約数", color: "#c98500" },
];

export interface EmployeeCallResult {
  employeeId: string;
  calls: number;
  appointments: number;
  deals: number;
}

/** AI社員別のコール結果(Mock実績)。 */
export const EMPLOYEE_CALL_RESULTS: readonly EmployeeCallResult[] = [
  { employeeId: "MUSA-100", calls: 42, appointments: 6, deals: 2 },
  { employeeId: "MUSA-101", calls: 58, appointments: 9, deals: 3 },
  { employeeId: "MUSA-102", calls: 71, appointments: 11, deals: 4 },
  { employeeId: "MUSA-103", calls: 88, appointments: 10, deals: 3 },
  { employeeId: "MUSA-104", calls: 25, appointments: 3, deals: 1 },
  { employeeId: "MUSA-105", calls: 12, appointments: 1, deals: 0 },
];

export function employeeName(id: string): string {
  return AI_EMPLOYEES.find((e) => e.id === id)?.name ?? id;
}

/** アポ率(アポ/架電)・成約率(成約/アポ)をパーセントで返す(0除算は0)。 */
export function callRates(r: { calls: number; appointments: number; deals: number }): {
  appointmentRatePct: number;
  closeRatePct: number;
} {
  return {
    appointmentRatePct: r.calls === 0 ? 0 : Math.round((r.appointments / r.calls) * 100),
    closeRatePct: r.appointments === 0 ? 0 : Math.round((r.deals / r.appointments) * 100),
  };
}

export function totalCallResults(
  results: readonly EmployeeCallResult[] = EMPLOYEE_CALL_RESULTS,
): { calls: number; appointments: number; deals: number } {
  return results.reduce(
    (sum, r) => ({
      calls: sum.calls + r.calls,
      appointments: sum.appointments + r.appointments,
      deals: sum.deals + r.deals,
    }),
    { calls: 0, appointments: 0, deals: 0 },
  );
}
