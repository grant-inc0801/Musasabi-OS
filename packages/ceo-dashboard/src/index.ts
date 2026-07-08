// CEO Dashboard Two-Layer UI(docs/ai-handoff/CEO_DASHBOARD_TWO_LAYER_UI_DIRECTIVE.md / D-20260709-003)。
// Layer A(AI CEO 経営ダッシュボード)の追加モジュール: 経営メーター・アラート優先度・
// リアルタイムタイムライン・CEO提案ボックス(承認→Issueドラフト)・AI社員ランキング。
// Layer B(部門インタラクション)の補助データ: 担当AI社員・ブロック項目・監査メモ。
// すべて決定論・Mock。実外部接続・secrets なし。

// ---- 経営メーター(Executive Company Meter) ----

export interface CompanyMeter {
  /** 全社進捗(部門平均、0-100)。 */
  progressPercent: number;
  /** 月次KPI達成率(Mock)。 */
  monthlyKpiPercent: number;
  /** 生産性指標(Mock)。 */
  productivityPercent: number;
  /** 稼働健全性ラベル。 */
  healthLabel: string;
}

export function buildExecutiveCompanyMeter(departmentProgress: readonly number[]): CompanyMeter {
  const progressPercent =
    departmentProgress.length === 0
      ? 0
      : Math.round(departmentProgress.reduce((s, p) => s + p, 0) / departmentProgress.length);
  const monthlyKpiPercent = Math.min(100, Math.round(progressPercent * 0.9 + 8));
  const productivityPercent = Math.min(100, Math.round(progressPercent * 0.85 + 12));
  const healthLabel = progressPercent >= 75 ? "良好" : progressPercent >= 50 ? "順調" : "要注視";
  return { progressPercent, monthlyKpiPercent, productivityPercent, healthLabel };
}

// ---- アラート優先度(Alert Priority) ----

export type AlertLevel = "critical" | "high" | "medium" | "low";

export const ALERT_LEVEL_LABEL_JA: Record<AlertLevel, string> = {
  critical: "重大",
  high: "高",
  medium: "中",
  low: "低",
};

export const ALERT_LEVEL_COLOR: Record<AlertLevel, string> = {
  critical: "#EF4444",
  high: "#F97316",
  medium: "#FACC15",
  low: "#6b7280",
};

const ALERT_LEVEL_WEIGHT: Record<AlertLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export interface CeoAlert {
  id: string;
  level: AlertLevel;
  department: string;
  message: string;
}

export const MOCK_ALERTS: readonly CeoAlert[] = [
  { id: "al-1", level: "critical", department: "開発部門", message: "beta-build のエラー率が閾値を大幅超過。" },
  { id: "al-2", level: "high", department: "管理部門", message: "会計本番連携が承認前に実行キューへ。" },
  { id: "al-3", level: "medium", department: "マーケティング部門", message: "リード獲得数の集計元に欠損の可能性。" },
  { id: "al-4", level: "low", department: "営業部門", message: "テスト記録に軽微な記入漏れ。" },
];

/** 優先度の高い順に並べる(同点は id 昇順)。 */
export function sortAlertsByPriority(alerts: readonly CeoAlert[] = MOCK_ALERTS): CeoAlert[] {
  return [...alerts].sort((a, b) => {
    const d = ALERT_LEVEL_WEIGHT[b.level] - ALERT_LEVEL_WEIGHT[a.level];
    return d !== 0 ? d : a.id.localeCompare(b.id);
  });
}

// ---- リアルタイムタイムライン(Timeline) ----

export interface TimelineEvent {
  id: string;
  timeLabel: string;
  department: string;
  summary: string;
}

export const MOCK_TIMELINE: readonly TimelineEvent[] = [
  { id: "tl-1", timeLabel: "14:32", department: "営業部門", summary: "新規リストへ架電開始。" },
  { id: "tl-2", timeLabel: "14:20", department: "出版部門", summary: "第3巻の類似性チェックを開始。" },
  { id: "tl-3", timeLabel: "14:05", department: "開発部門", summary: "beta-build のエラーを検知(監査へ通知)。" },
  { id: "tl-4", timeLabel: "13:50", department: "管理部門", summary: "月次収支レポートを出力。" },
  { id: "tl-5", timeLabel: "13:30", department: "カスタマーサポート部門", summary: "未対応チケットに一次回答。" },
];

// ---- CEO 提案ボックス(Proposal Box) ----

export type ProposalStatus = "submitted" | "approved" | "issue_created";

export const PROPOSAL_STATUS_LABEL_JA: Record<ProposalStatus, string> = {
  submitted: "提出済み",
  approved: "承認済み",
  issue_created: "Issue作成済み(Mock)",
};

export interface CeoProposal {
  id: string;
  from: string;
  department: string;
  title: string;
  detail: string;
  status: ProposalStatus;
}

export const MOCK_CEO_PROPOSALS: readonly CeoProposal[] = [
  { id: "pr-1", from: "営業リーダーAI", department: "営業部門", title: "架電スクリプトのA/Bテスト自動化", detail: "冒頭15秒の2案を自動比較。", status: "submitted" },
  { id: "pr-2", from: "敏腕編集長AI", department: "出版部門", title: "校正フローに類似性チェック常設", detail: "酷似リスクを出版前に低減。", status: "submitted" },
  { id: "pr-3", from: "AIサポート担当", department: "カスタマーサポート部門", title: "FAQ自動生成", detail: "頻出質問からFAQ草案を生成。", status: "submitted" },
];

/** 提案を承認する(submitted → approved)。人間承認の Mock。 */
export function approveProposal(p: CeoProposal): CeoProposal {
  if (p.status !== "submitted") return p;
  return { ...p, status: "approved" };
}

/** 承認済み提案から Issue を作成する Mock(submitted のままは作成不可)。 */
export interface IssueDraft {
  title: string;
  body: string;
}

export function proposalToIssueDraft(p: CeoProposal): IssueDraft | null {
  if (p.status === "submitted") return null;
  return {
    title: `[提案] ${p.title}`,
    body: [`## 発案`, `${p.from}(${p.department})`, ``, `## 内容`, p.detail, ``, `> Mock: 実際のIssueは作成しません。`].join("\n"),
  };
}

// ---- AI社員ランキング(Employee Ranking) ----

export interface EmployeeScore {
  name: string;
  department: string;
  /** 貢献度・速度・品質・提案数・稼働率(0-100 or 件数)。 */
  contribution: number;
  speed: number;
  quality: number;
  proposals: number;
  operatingRate: number;
}

export const MOCK_EMPLOYEE_SCORES: readonly EmployeeScore[] = [
  { name: "営業リーダーAI", department: "営業部門", contribution: 92, speed: 88, quality: 85, proposals: 4, operatingRate: 90 },
  { name: "敏腕編集長AI", department: "出版部門", contribution: 84, speed: 76, quality: 95, proposals: 3, operatingRate: 82 },
  { name: "AIエンジニア", department: "開発部門", contribution: 88, speed: 90, quality: 80, proposals: 2, operatingRate: 86 },
  { name: "AIサポート担当", department: "カスタマーサポート部門", contribution: 70, speed: 82, quality: 78, proposals: 3, operatingRate: 74 },
  { name: "AIマーケ担当", department: "マーケティング部門", contribution: 66, speed: 70, quality: 72, proposals: 1, operatingRate: 68 },
];

/** 総合スコア(貢献・速度・品質・稼働率の加重 + 提案数ボーナス)。決定論。 */
export function compositeScore(e: EmployeeScore): number {
  return Math.round(
    e.contribution * 0.3 + e.speed * 0.2 + e.quality * 0.3 + e.operatingRate * 0.2 + e.proposals * 2,
  );
}

/** 総合スコア降順で並べる(同点は名前昇順)。 */
export function rankEmployees(list: readonly EmployeeScore[] = MOCK_EMPLOYEE_SCORES): EmployeeScore[] {
  return [...list].sort((a, b) => {
    const d = compositeScore(b) - compositeScore(a);
    return d !== 0 ? d : a.name.localeCompare(b.name);
  });
}

// ---- Layer B: 部門インタラクションの補助データ ----

/** 部門の担当AI社員(Mock・決定論)。 */
export function deptAssignedEmployees(deptId: string): string[] {
  const base: Record<string, string[]> = {
    sales: ["営業リーダーAI", "AIセールス担当", "AIコールコーチ"],
    publishing: ["敏腕編集長AI", "AI校正担当", "AI類似性チェッカー"],
    development: ["AIエンジニア", "AIビルド管理担当"],
    support: ["AIサポート担当", "AIナレッジ担当"],
    marketing: ["AIマーケティング担当"],
  };
  return base[deptId] ?? ["担当AI社員A", "担当AI社員B"];
}

/** 部門のブロック項目(承認待ち・依存待ち等の Mock)。 */
export function deptBlockedItems(deptId: string): string[] {
  const base: Record<string, string[]> = {
    publishing: ["類似性チェックの承認待ち", "出版可否判定(未着手)"],
    development: ["beta-build エラーの対応待ち"],
    sales: ["料金比較表のレビュー待ち"],
  };
  return base[deptId] ?? [];
}

/** 部門の監査メモ(AI監査の所見要約・Mock)。 */
export function deptAuditNotes(deptId: string): string[] {
  const base: Record<string, string[]> = {
    development: ["異常検知: エラー率超過(重大)。一時停止を提案(承認待ち)。"],
    management: ["承認遵守: 承認前実行の疑い(レビュー中)。"],
    marketing: ["KPI整合性: 集計元の欠損を確認中。"],
  };
  return base[deptId] ?? ["現時点で重大な監査所見はありません。"];
}

// ---- アバター要約(Avatar can summarize dashboard state) ----

export function buildDashboardSummaryJa(
  companyMeter: CompanyMeter,
  alerts: readonly CeoAlert[] = MOCK_ALERTS,
  proposals: readonly CeoProposal[] = MOCK_CEO_PROPOSALS,
): string[] {
  const lines: string[] = [];
  lines.push(`全社進捗は約${companyMeter.progressPercent}%(稼働健全性: ${companyMeter.healthLabel})です。`);
  const critical = alerts.filter((a) => a.level === "critical" || a.level === "high").length;
  if (critical > 0) lines.push(`優先度の高いアラートが${critical}件あります。`);
  const submitted = proposals.filter((p) => p.status === "submitted").length;
  if (submitted > 0) lines.push(`AI社員からの提案が${submitted}件、承認待ちです。`);
  return lines;
}
