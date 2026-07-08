import { deptIcon } from "./commandCenter";

// D-019 Scheduler & Routines: 会社の定例業務(スケジュール)をモデル化する。
// 各部署の繰り返し業務を頻度・次回予定つきで一覧化する。実行はしない(表示のみ・Mock)。

export type ScheduleFrequency = "毎日" | "毎週" | "毎月" | "随時";

export const SCHEDULE_FREQUENCIES: readonly ScheduleFrequency[] = ["毎日", "毎週", "毎月", "随時"];

/** 定例業務(ルーチン)1件。 */
export interface ScheduledRoutine {
  id: string;
  deptId: string;
  deptName: string;
  title: string;
  frequency: ScheduleFrequency;
  /** 次回予定(表示用の相対文言。Mock)。 */
  nextRun: string;
  /** 自動化されているか(Automationルーチン化済みか)。 */
  automated: boolean;
}

export const SCHEDULED_ROUTINES: readonly ScheduledRoutine[] = [
  {
    id: "R-1",
    deptId: "sales",
    deptName: "営業部",
    title: "新規リストへの架電(テストコール)",
    frequency: "毎日",
    nextRun: "本日 14:00",
    automated: false,
  },
  {
    id: "R-2",
    deptId: "development",
    deptName: "架電リスト制作課",
    title: "飲食店リストの定期抽出",
    frequency: "毎週",
    nextRun: "月曜 10:00",
    automated: true,
  },
  {
    id: "R-3",
    deptId: "support",
    deptName: "カスタマーサポート部",
    title: "FAQの見直し・更新",
    frequency: "毎週",
    nextRun: "金曜 16:00",
    automated: false,
  },
  {
    id: "R-4",
    deptId: "accounting",
    deptName: "経理部",
    title: "月次仕訳の締めと収支レポート",
    frequency: "毎月",
    nextRun: "月末 17:00",
    automated: false,
  },
  {
    id: "R-5",
    deptId: "planning",
    deptName: "企画部",
    title: "保管庫の整理・容量チェック",
    frequency: "毎週",
    nextRun: "水曜 11:00",
    automated: true,
  },
  {
    id: "R-6",
    deptId: "market_research",
    deptName: "市場調査部",
    title: "AI最新情報の収集",
    frequency: "毎日",
    nextRun: "本日 09:00",
    automated: false,
  },
  {
    id: "R-7",
    deptId: "publishing",
    deptName: "出版部",
    title: "クリーン運営チェック(出版前)",
    frequency: "随時",
    nextRun: "案件発生時",
    automated: false,
  },
];

export interface SchedulerSummary {
  total: number;
  daily: number;
  weekly: number;
  monthly: number;
  automated: number;
}

/** スケジュールのサマリー。 */
export function buildSchedulerSummary(
  routines: readonly ScheduledRoutine[] = SCHEDULED_ROUTINES,
): SchedulerSummary {
  return {
    total: routines.length,
    daily: routines.filter((r) => r.frequency === "毎日").length,
    weekly: routines.filter((r) => r.frequency === "毎週").length,
    monthly: routines.filter((r) => r.frequency === "毎月").length,
    automated: routines.filter((r) => r.automated).length,
  };
}

/** 頻度で定例業務を絞り込む。 */
export function filterRoutines(
  routines: readonly ScheduledRoutine[],
  frequency: ScheduleFrequency | "all",
): ScheduledRoutine[] {
  if (frequency === "all") return [...routines];
  return routines.filter((r) => r.frequency === frequency);
}

/** 定例業務の部署アイコン(表示補助)。 */
export function routineIcon(routine: ScheduledRoutine): string {
  return deptIcon(routine.deptId);
}
