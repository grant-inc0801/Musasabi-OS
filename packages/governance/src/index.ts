// AI Executive Governance(docs/ai-handoff/AI_EXECUTIVE_GOVERNANCE.md)。
// AI経営陣(CEO/COO/CTO/CFO/CMO/CPO/CHRO/PM)が月次予算・KPI・部門目標を持ち、
// 目標達成を予測し、遅延時は自動で再優先付け・リソース再配分・是正提案・CEOエスカレーションを行う。
// 大きな戦略変更にはガバナンス承認が必要。すべて決定論・Mock。実予算執行はしない。

/** 経営役職。 */
export type ExecutiveRole = "ceo" | "coo" | "cto" | "cfo" | "cmo" | "cpo" | "chro" | "pm";

export const EXECUTIVE_ROLES: readonly ExecutiveRole[] = [
  "ceo",
  "coo",
  "cto",
  "cfo",
  "cmo",
  "cpo",
  "chro",
  "pm",
];

export const EXECUTIVE_ROLE_LABEL_JA: Record<ExecutiveRole, string> = {
  ceo: "AI CEO(最高経営責任者)",
  coo: "AI COO(最高執行責任者)",
  cto: "AI CTO(最高技術責任者)",
  cfo: "AI CFO(最高財務責任者)",
  cmo: "AI CMO(最高マーケティング責任者)",
  cpo: "AI CPO(最高製品責任者)",
  chro: "AI CHRO(最高人事責任者)",
  pm: "AI PM(プロジェクト管理)",
};

/** 経営陣メンバー(月次の予算・KPI・部門目標)。 */
export interface Executive {
  role: ExecutiveRole;
  name: string;
  /** 管掌領域。 */
  domain: string;
  /** 月次予算(円・Mock)。 */
  monthlyBudget: number;
  /** 消化済み予算(円)。 */
  budgetUsed: number;
  /** KPI 名。 */
  kpiName: string;
  /** 月次KPI目標。 */
  kpiTarget: number;
  /** 現時点のKPI実績。 */
  kpiActual: number;
}

/** 予算消化率(%)。予算0のとき0。 */
export function budgetUsagePercent(e: Executive): number {
  return e.monthlyBudget <= 0 ? 0 : Math.round((e.budgetUsed / e.monthlyBudget) * 100);
}

/** KPI 達成率(%)。目標0のとき0。 */
export function kpiAttainmentPercent(e: Executive): number {
  return e.kpiTarget <= 0 ? 0 : Math.round((e.kpiActual / e.kpiTarget) * 100);
}

/**
 * 月末着地のKPI達成率予測(%)。monthProgress は月の経過割合(0..1)。
 * 現在ペース(実績÷経過割合)を月末目標に対して評価する。
 */
export function forecastAttainmentPercent(e: Executive, monthProgress: number): number {
  const p = Math.min(1, Math.max(0.01, monthProgress));
  if (e.kpiTarget <= 0) return 0;
  const projected = e.kpiActual / p;
  return Math.round((projected / e.kpiTarget) * 100);
}

/** 目標に対して遅延しているか(月末予測が95%未満)。 */
export function isBehindTarget(e: Executive, monthProgress: number): boolean {
  return forecastAttainmentPercent(e, monthProgress) < 95;
}

/** 予算超過ペースか(消化率が経過割合を10ポイント以上上回る)。 */
export function isOverBudget(e: Executive, monthProgress: number): boolean {
  return budgetUsagePercent(e) > Math.round(monthProgress * 100) + 10;
}

export type RiskLevel = "low" | "medium" | "high";

export const RISK_LABEL_JA: Record<RiskLevel, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

/** リスク評価(KPI遅延・予算超過から決定論的に導出)。 */
export function riskLevel(e: Executive, monthProgress: number): RiskLevel {
  const forecast = forecastAttainmentPercent(e, monthProgress);
  const behind = forecast < 95;
  const over = isOverBudget(e, monthProgress);
  if (forecast < 80 || (behind && over)) return "high";
  if (behind || over) return "medium";
  return "low";
}

/** 是正アクションの推奨(遅延・予算超過時)。CEO 以外で大幅遅延なら CEO エスカレーション。 */
export function recommendedActions(e: Executive, monthProgress: number): string[] {
  const actions: string[] = [];
  const forecast = forecastAttainmentPercent(e, monthProgress);
  if (forecast < 95) {
    actions.push("作業を自動で再優先付けする");
    actions.push("利用可能なAIリソースを再配分する");
  }
  if (isOverBudget(e, monthProgress)) {
    actions.push("予算消化を抑制し支出を見直す");
  }
  if (forecast < 80 && e.role !== "ceo") {
    actions.push("AI CEO へエスカレーションする");
  }
  if (actions.length === 0) {
    actions.push("現状維持(目標達成見込み)");
  }
  return actions;
}

// ---- ガバナンス承認 ----

/** 変更の種別。 */
export type ChangeKind =
  | "strategy"
  | "budget_reallocation"
  | "org_change"
  | "pricing"
  | "routine_task";

export const CHANGE_KIND_LABEL_JA: Record<ChangeKind, string> = {
  strategy: "戦略変更",
  budget_reallocation: "予算再配分",
  org_change: "組織変更",
  pricing: "価格変更",
  routine_task: "通常タスク",
};

/** 大きな戦略変更はガバナンス承認(人間)が必要。 */
export function requiresGovernanceApproval(kind: ChangeKind): boolean {
  return kind === "strategy" || kind === "org_change" || kind === "pricing";
}

// ---- 経営ダッシュボード ----

export interface ExecutiveStatus {
  executive: Executive;
  budgetUsagePercent: number;
  kpiAttainmentPercent: number;
  forecastPercent: number;
  behindTarget: boolean;
  risk: RiskLevel;
  actions: string[];
}

export interface GovernanceDashboard {
  monthProgressPercent: number;
  totalBudget: number;
  totalBudgetUsed: number;
  behindCount: number;
  highRiskCount: number;
  statuses: ExecutiveStatus[];
  /** 経営サマリー(CEO視点の要約行)。 */
  summaryLines: string[];
}

/** 経営陣の状態から経営ダッシュボードを組み立てる(決定論)。 */
export function buildGovernanceDashboard(
  executives: readonly Executive[],
  monthProgress: number,
): GovernanceDashboard {
  const statuses: ExecutiveStatus[] = executives.map((e) => ({
    executive: e,
    budgetUsagePercent: budgetUsagePercent(e),
    kpiAttainmentPercent: kpiAttainmentPercent(e),
    forecastPercent: forecastAttainmentPercent(e, monthProgress),
    behindTarget: isBehindTarget(e, monthProgress),
    risk: riskLevel(e, monthProgress),
    actions: recommendedActions(e, monthProgress),
  }));
  const totalBudget = executives.reduce((s, e) => s + e.monthlyBudget, 0);
  const totalBudgetUsed = executives.reduce((s, e) => s + e.budgetUsed, 0);
  const behindCount = statuses.filter((s) => s.behindTarget).length;
  const highRiskCount = statuses.filter((s) => s.risk === "high").length;
  const summaryLines: string[] = [];
  summaryLines.push(
    `月の${Math.round(monthProgress * 100)}%が経過。${executives.length}名の経営陣のうち${behindCount}名が目標遅延、高リスク${highRiskCount}名です。`,
  );
  const worst = [...statuses].sort((a, b) => a.forecastPercent - b.forecastPercent)[0];
  if (worst && worst.behindTarget) {
    summaryLines.push(
      `最も遅延しているのは${EXECUTIVE_ROLE_LABEL_JA[worst.executive.role]}(着地見込み${worst.forecastPercent}%)。${worst.actions[0]}を推奨します。`,
    );
  }
  const budgetPct = totalBudget <= 0 ? 0 : Math.round((totalBudgetUsed / totalBudget) * 100);
  summaryLines.push(`全社予算消化率は${budgetPct}%です。`);
  return {
    monthProgressPercent: Math.round(monthProgress * 100),
    totalBudget,
    totalBudgetUsed,
    behindCount,
    highRiskCount,
    statuses,
    summaryLines,
  };
}

// ---- Mock データ ----

export const MOCK_EXECUTIVES: readonly Executive[] = [
  { role: "ceo", name: "ムサビ CEO", domain: "全社経営", monthlyBudget: 0, budgetUsed: 0, kpiName: "全社目標達成率", kpiTarget: 100, kpiActual: 62 },
  { role: "coo", name: "運用 COO", domain: "オペレーション", monthlyBudget: 800000, budgetUsed: 380000, kpiName: "稼働率", kpiTarget: 90, kpiActual: 58 },
  { role: "cto", name: "技術 CTO", domain: "開発", monthlyBudget: 1200000, budgetUsed: 520000, kpiName: "リリース数", kpiTarget: 20, kpiActual: 13 },
  { role: "cfo", name: "財務 CFO", domain: "経理", monthlyBudget: 300000, budgetUsed: 90000, kpiName: "収支改善率", kpiTarget: 15, kpiActual: 9 },
  { role: "cmo", name: "マーケ CMO", domain: "マーケティング", monthlyBudget: 900000, budgetUsed: 720000, kpiName: "リード獲得数", kpiTarget: 400, kpiActual: 150 },
  { role: "cpo", name: "製品 CPO", domain: "プロダクト", monthlyBudget: 600000, budgetUsed: 240000, kpiName: "機能リリース", kpiTarget: 12, kpiActual: 8 },
  { role: "chro", name: "人事 CHRO", domain: "人事", monthlyBudget: 200000, budgetUsed: 70000, kpiName: "AI社員稼働最適化", kpiTarget: 100, kpiActual: 66 },
  { role: "pm", name: "AI PM", domain: "横断管理", monthlyBudget: 100000, budgetUsed: 40000, kpiName: "タスク完了率", kpiTarget: 100, kpiActual: 70 },
];

/** 月の経過割合の既定値(Mock。当月の60%経過を想定)。 */
export const MOCK_MONTH_PROGRESS = 0.6;

export * from "./orgStructure";
