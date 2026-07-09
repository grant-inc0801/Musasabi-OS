// Musasabi OS Mission Control Dashboard(Phase 1・司令室ホーム画面)。
// AI企業全体の司令室。すべて Mock・決定論のダミーデータで、後から GitHub / Claude Code /
// Codex / Calendar / Database / Workflow / Approval へ差し替えられるオブジェクト設計。
// ハードコード禁止 = 全データをこのモジュールのオブジェクト/配列で管理する。

/** ラベル・値ペア(メーター等の表示用)。 */
export interface LabeledValue {
  label: string;
  value: string;
}

export type LedLevel = "green" | "yellow" | "red";

export const LED_COLOR: Record<LedLevel, string> = {
  green: "#22C55E",
  yellow: "#FACC15",
  red: "#EF4444",
};

// ─────────────────────────────────────────────────────────────────────────────
// ② AI CEO STATUS
// ─────────────────────────────────────────────────────────────────────────────
export interface AiCeoStatus {
  name: string;
  state: string;
  metrics: readonly LabeledValue[];
}

export const AI_CEO_STATUS: AiCeoStatus = {
  name: "AI CEO",
  state: "判断中",
  metrics: [
    { label: "思考速度", value: "1,240 tok/s" },
    { label: "本日判断件数", value: "38 件" },
    { label: "承認待ち", value: "5 件" },
    { label: "実行中", value: "12 タスク" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ③ AI PM(GitHub 連携を想定した設計)
// ─────────────────────────────────────────────────────────────────────────────
export interface AiPmStatus {
  sprint: string;
  metrics: readonly LabeledValue[];
  claudeCode: string;
  githubSync: string;
  codex: string;
}

export const AI_PM_STATUS: AiPmStatus = {
  sprint: "Sprint 14(β UI 刷新)",
  metrics: [
    { label: "オープンIssue", value: "9 件" },
    { label: "レビュー待ち", value: "3 件" },
    { label: "進行中PR", value: "2 件" },
  ],
  claudeCode: "実装中(mission-control)",
  githubSync: "同期済み",
  codex: "待機中",
};

// ─────────────────────────────────────────────────────────────────────────────
// ④ AI社員一覧(横スクロール)
// ─────────────────────────────────────────────────────────────────────────────
export type DeptStatus = "稼働中" | "処理中" | "監視中" | "安定" | "要対応";

export interface DepartmentSummary {
  id: string;
  name: string;
  icon: string;
  headcount: number;
  utilization: number; // 0-100
  taskCount: number;
  processingSpeed: string;
  status: DeptStatus;
  /** クリックで遷移する既存ページのキー(App.tsx の Page 名)。 */
  page: string;
}

export const DEPARTMENT_ROSTER: readonly DepartmentSummary[] = [
  { id: "sales", name: "営業部", icon: "📞", headcount: 6, utilization: 78, taskCount: 14, processingSpeed: "速い", status: "稼働中", page: "sales_kpi" },
  { id: "planning", name: "企画部", icon: "📈", headcount: 3, utilization: 72, taskCount: 8, processingSpeed: "標準", status: "安定", page: "planning" },
  { id: "publishing", name: "出版部", icon: "📚", headcount: 4, utilization: 66, taskCount: 9, processingSpeed: "標準", status: "処理中", page: "publishing" },
  { id: "development", name: "開発部", icon: "💻", headcount: 5, utilization: 84, taskCount: 17, processingSpeed: "速い", status: "処理中", page: "development" },
  { id: "accounting", name: "経理部", icon: "🧮", headcount: 2, utilization: 60, taskCount: 5, processingSpeed: "標準", status: "安定", page: "accounting" },
  { id: "marketing", name: "マーケティング部", icon: "📣", headcount: 3, utilization: 69, taskCount: 7, processingSpeed: "標準", status: "稼働中", page: "marketing" },
  { id: "hr", name: "総務部", icon: "🗂", headcount: 2, utilization: 54, taskCount: 4, processingSpeed: "ゆっくり", status: "安定", page: "hr" },
  { id: "qa", name: "品質保証部", icon: "🛡", headcount: 2, utilization: 81, taskCount: 6, processingSpeed: "標準", status: "監視中", page: "audit" },
  { id: "admin", name: "管理部", icon: "🔗", headcount: 2, utilization: 60, taskCount: 5, processingSpeed: "標準", status: "安定", page: "org_structure" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ⑥ Today's Tasks
// ─────────────────────────────────────────────────────────────────────────────
export type Priority = "high" | "medium" | "low";

export const PRIORITY_LABEL_JA: Record<Priority, string> = {
  high: "高", medium: "中", low: "低",
};
export const PRIORITY_COLOR: Record<Priority, string> = {
  high: "#EF4444", medium: "#FACC15", low: "#22C55E",
};

export interface TodayTask {
  id: string;
  title: string;
  priority: Priority;
  due: string;
  assignee: string;
  progress: number; // 0-100
}

export const TODAY_TASKS: readonly TodayTask[] = [
  { id: "t-1", title: "β UI メタリック刷新のレビュー", priority: "high", due: "本日 17:00", assignee: "AI PM", progress: 72 },
  { id: "t-2", title: "営業アポスクリプトの更新", priority: "medium", due: "本日 15:00", assignee: "営業部AI", progress: 40 },
  { id: "t-3", title: "Kindle 第3巻の校正", priority: "medium", due: "本日 18:00", assignee: "出版部AI", progress: 88 },
  { id: "t-4", title: "月次収支レポートの生成", priority: "low", due: "明日 10:00", assignee: "経理部AI", progress: 15 },
  { id: "t-5", title: "品質監査ログのレビュー", priority: "high", due: "本日 16:30", assignee: "品質保証部AI", progress: 55 },
];

// ─────────────────────────────────────────────────────────────────────────────
// ⑦ Approval Center
// ─────────────────────────────────────────────────────────────────────────────
export interface ApprovalItem {
  id: string;
  title: string;
  from: string;
  priority: Priority;
}

export const APPROVALS: readonly ApprovalItem[] = [
  { id: "a-1", title: "新規事業ユニット CARD-LINK の立ち上げ", from: "AI CEO", priority: "high" },
  { id: "a-2", title: "Sprint 14 リリース計画の承認", from: "AI PM", priority: "high" },
  { id: "a-3", title: "マーケ広告費の増額(Mock)", from: "管理者", priority: "medium" },
  { id: "a-4", title: "FAQ 自動生成の本番反映", from: "AI PM", priority: "low" },
  { id: "a-5", title: "監査指摘の是正計画", from: "AI CEO", priority: "medium" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ⑧ GitHub Development(将来 API 接続を想定)
// ─────────────────────────────────────────────────────────────────────────────
export interface GithubStatus {
  implementingIssues: readonly string[];
  latestCommit: string;
  claudeCode: string;
  codex: string;
  actions: string;
  logs: readonly string[];
}

export const GITHUB_STATUS: GithubStatus = {
  implementingIssues: [
    "#291 AI UI Polish: metallic cylinders",
    "#—  Mission Control Dashboard (Phase 1)",
  ],
  latestCommit: "00f2106 UI: シリンダー窓枠を本体色に統一・反射除去",
  claudeCode: "実装中",
  codex: "待機中",
  actions: "CI: 緑 / Beta Build: 実行中",
  logs: [
    "push → ci.yml verify 起動",
    "verify 成功(2ジョブ)",
    "merge → main",
    "beta-build.yml をディスパッチ",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ⑨ AI Timeline(リアルタイムログ)
// ─────────────────────────────────────────────────────────────────────────────
export interface TimelineEntry {
  time: string;
  dept: string;
  summary: string;
}

export const AI_TIMELINE: readonly TimelineEntry[] = [
  { time: "09:20", dept: "営業部", summary: "アポスクリプト更新" },
  { time: "09:23", dept: "出版部", summary: "Kindle 校正完了" },
  { time: "09:25", dept: "開発部", summary: "Issue 生成" },
  { time: "09:28", dept: "AI CEO", summary: "承認" },
  { time: "09:31", dept: "品質保証部", summary: "監査ログ確認" },
  { time: "09:34", dept: "マーケティング部", summary: "広告レポート更新" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ⑩ System Status(LED)
// ─────────────────────────────────────────────────────────────────────────────
export interface SystemStatusItem {
  name: string;
  level: LedLevel;
  value: string;
}

export const SYSTEM_STATUS: readonly SystemStatusItem[] = [
  { name: "CPU", level: "green", value: "38%" },
  { name: "Memory", level: "green", value: "52%" },
  { name: "Database", level: "green", value: "正常" },
  { name: "API", level: "yellow", value: "レート注意" },
  { name: "GitHub", level: "green", value: "同期済み" },
  { name: "LLM", level: "green", value: "応答良好" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 集計・要約(ヘッダーのAI稼働率など)
// ─────────────────────────────────────────────────────────────────────────────
export interface MissionSummary {
  aiUtilization: number;
  totalHeadcount: number;
  activeTasks: number;
  pendingApprovals: number;
  systemHealth: LedLevel;
}

/** AI稼働率 = 部署稼働率の平均。全体状態も集計する。 */
export function computeMissionSummary(
  roster: readonly DepartmentSummary[] = DEPARTMENT_ROSTER,
  approvals: readonly ApprovalItem[] = APPROVALS,
  system: readonly SystemStatusItem[] = SYSTEM_STATUS,
): MissionSummary {
  const aiUtilization = roster.length === 0
    ? 0
    : Math.round(roster.reduce((s, d) => s + d.utilization, 0) / roster.length);
  const worst: LedLevel = system.some((s) => s.level === "red")
    ? "red"
    : system.some((s) => s.level === "yellow")
      ? "yellow"
      : "green";
  return {
    aiUtilization,
    totalHeadcount: roster.reduce((s, d) => s + d.headcount, 0),
    activeTasks: roster.reduce((s, d) => s + d.taskCount, 0),
    pendingApprovals: approvals.length,
    systemHealth: worst,
  };
}

/** AI CEO アバター等が読む司令室サマリー(日本語)。 */
export function summarizeMissionJa(summary: MissionSummary = computeMissionSummary()): string {
  return (
    `Mission Control: AI稼働率 ${summary.aiUtilization}%、実行中タスク ${summary.activeTasks}、` +
    `承認待ち ${summary.pendingApprovals}件、システム状態 ${summary.systemHealth === "green" ? "正常" : summary.systemHealth === "yellow" ? "注意" : "異常"}。`
  );
}
