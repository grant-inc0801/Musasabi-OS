import type { AIEmployee } from "./types";
import { RANK_AUTHORITY_LEVEL } from "./types";
import type { EmployeeCallProgress } from "./callIntegration";
import { initialCallProgress } from "./callIntegration";

// AI社員名簿のマスタデータ(D-20260706-001 実装指示2)。
// Epic β-001 で実運用に入った AI営業本部を中心に、Mock のAI社員を定義する。
// 実在の人物・実データではない(すべてダミー)。永続化ストアへの差し替えは次フェーズ。

function employee(
  id: string,
  name: string,
  role: string,
  unitId: string,
  rank: AIEmployee["rank"],
  kpi: Record<string, number>,
  state: AIEmployee["state"] = "idle",
): AIEmployee {
  return { id, name, role, unitId, rank, authorityLevel: RANK_AUTHORITY_LEVEL[rank], kpi, state };
}

/** AI社員名簿(Mockマスタ)。MUSA-001 はCEO、100番台はAI営業本部。 */
export const AI_EMPLOYEES: readonly AIEmployee[] = [
  employee("MUSA-001", "ムサ", "CEO", "musasabi", "ceo", { company_growth: 100 }, "working"),
  employee(
    "MUSA-100",
    "サスケ",
    "営業本部長",
    "hq-sales",
    "headquarters_manager",
    { monthly_revenue: 10000000 },
    "working",
  ),
  employee(
    "MUSA-101",
    "ハヤテ",
    "営業部長",
    "div-sales-main",
    "department_manager",
    { team_appointments: 60 },
    "working",
  ),
  employee(
    "MUSA-102",
    "コハク",
    "第一営業 課長",
    "dept-sales-team-a",
    "section_chief",
    { appointments: 30, calls: 400 },
    "idle",
  ),
  employee(
    "MUSA-103",
    "ツバキ",
    "インサイドセールス担当",
    "div-sales-inside",
    "staff",
    { calls: 600, appointments: 20 },
    "training",
  ),
  employee(
    "MUSA-104",
    "アオイ",
    "営業分析担当",
    "div-sales-analytics",
    "staff",
    { reports: 8 },
    "idle",
  ),
  employee(
    "MUSA-105",
    "カエデ",
    "研修中AI社員",
    "dept-sales-team-a",
    "trainee",
    { training_sessions: 10 },
    "training",
  ),
];

/** IDからAI社員を取得する。存在しなければ null。 */
export function getEmployee(
  id: string,
  employees: readonly AIEmployee[] = AI_EMPLOYEES,
): AIEmployee | null {
  return employees.find((e) => e.id === id) ?? null;
}

/** 指定した組織単位に所属するAI社員を返す。 */
export function getEmployeesByUnit(
  unitId: string,
  employees: readonly AIEmployee[] = AI_EMPLOYEES,
): AIEmployee[] {
  return employees.filter((e) => e.unitId === unitId);
}

/**
 * 名簿の初期コール研修進捗(Mock)。課長以上は Learning 完了+合格済み扱い、
 * 一般社員は Learning 完了、研修社員は未完了とする(いずれも AutoCall は
 * 安全ゲート未充足のため有効化されない)。
 */
export function initialRosterCallProgress(
  employees: readonly AIEmployee[] = AI_EMPLOYEES,
): EmployeeCallProgress[] {
  return employees.map((e) => {
    const progress = initialCallProgress(e.id);
    if (e.authorityLevel >= RANK_AUTHORITY_LEVEL.section_chief) {
      return { ...progress, learningCompleted: true, passedTestCalls: progress.requiredTestCalls };
    }
    if (e.rank === "staff") {
      return { ...progress, learningCompleted: true };
    }
    return progress;
  });
}
