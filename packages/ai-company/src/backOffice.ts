// 管理部門(マーケティング部/経理部/人事部)のMockデータ(コア部署の完成フェーズ)。
// β版はすべてMock: 実広告出稿・実SNS投稿・実会計データ連携・実採用活動は行わない。
// 人数は COMMAND_DEPARTMENTS(marketing 4 / accounting 2 / hr 2)と整合させる。

// ---------------------------------------------------------------------------
// マーケティング部
// ---------------------------------------------------------------------------

/** キャンペーン(Mock)。 */
export interface MarketingCampaign {
  name: string;
  channel: string;
  status: "配信中" | "計画中" | "完了";
  leads: number;
  /** コンバージョン率(%)。 */
  cvrPercent: number;
}

export const MARKETING_CAMPAIGNS: readonly MarketingCampaign[] = [
  { name: "AI社員体験ウェビナー", channel: "メール+LP", status: "配信中", leads: 46, cvrPercent: 3.8 },
  { name: "飲食店DX事例紹介", channel: "SNS(X)", status: "配信中", leads: 21, cvrPercent: 2.1 },
  { name: "β版先行案内", channel: "メール", status: "完了", leads: 64, cvrPercent: 5.2 },
  { name: "秋の展示会フォロー", channel: "架電+メール", status: "計画中", leads: 0, cvrPercent: 0 },
];

/** SNS投稿計画(Mock)。実投稿は行わない。 */
export interface SnsPostPlan {
  date: string;
  theme: string;
  status: "下書き" | "承認待ち" | "予約済み" | "投稿済み";
}

export const SNS_POST_PLANS: readonly SnsPostPlan[] = [
  { date: "07/07", theme: "AI社員の一日(営業部編)", status: "投稿済み" },
  { date: "07/08", theme: "架電リスト制作課の紹介", status: "予約済み" },
  { date: "07/09", theme: "保管庫(Knowledge Vault)機能紹介", status: "承認待ち" },
  { date: "07/10", theme: "お客様の声(Mock)", status: "下書き" },
];

export const MARKETING_STAFF: readonly string[] = [
  "AIマーケター(戦略)",
  "AIコンテンツライター",
  "AI SNSプランナー",
  "AIアナリスト(効果測定)",
];

export interface MarketingKpi {
  activeCampaigns: number;
  totalLeads: number;
  averageCvrPercent: number;
  postsPlanned: number;
  postsPublished: number;
}

/** マーケティングKPI(Mockデータから導出)。 */
export function buildMarketingKpi(): MarketingKpi {
  const active = MARKETING_CAMPAIGNS.filter((c) => c.status === "配信中");
  const withLeads = MARKETING_CAMPAIGNS.filter((c) => c.leads > 0);
  const avgCvr =
    withLeads.length === 0
      ? 0
      : withLeads.reduce((s, c) => s + c.cvrPercent, 0) / withLeads.length;
  return {
    activeCampaigns: active.length,
    totalLeads: MARKETING_CAMPAIGNS.reduce((s, c) => s + c.leads, 0),
    averageCvrPercent: Math.round(avgCvr * 10) / 10,
    postsPlanned: SNS_POST_PLANS.length,
    postsPublished: SNS_POST_PLANS.filter((p) => p.status === "投稿済み").length,
  };
}

// ---------------------------------------------------------------------------
// 経理部
// ---------------------------------------------------------------------------

/** 仕訳/経費のMockエントリ。実会計データではない。 */
export interface LedgerEntry {
  date: string;
  item: string;
  category: "売上" | "経費";
  amountJpy: number;
  status: "確定" | "確認中" | "承認待ち";
}

export const LEDGER_ENTRIES: readonly LedgerEntry[] = [
  { date: "07/01", item: "電子書籍売上(6月分)", category: "売上", amountJpy: 120000, status: "確定" },
  { date: "07/02", item: "クラウド利用料", category: "経費", amountJpy: 18000, status: "確定" },
  { date: "07/03", item: "音声API利用料(Mock)", category: "経費", amountJpy: 9500, status: "確認中" },
  { date: "07/05", item: "展示会出展費(前払)", category: "経費", amountJpy: 55000, status: "承認待ち" },
  { date: "07/06", item: "コンサルティング売上", category: "売上", amountJpy: 80000, status: "確定" },
];

export const ACCOUNTING_STAFF: readonly string[] = ["AI経理(仕訳・月次)", "AI経費チェッカー"];

export interface AccountingSummary {
  incomeJpy: number;
  expenseJpy: number;
  balanceJpy: number;
  pendingCount: number;
}

/** 収支サマリー(確定分のみ集計。確認中/承認待ちは pendingCount へ)。 */
export function buildAccountingSummary(): AccountingSummary {
  const fixed = LEDGER_ENTRIES.filter((e) => e.status === "確定");
  const income = fixed.filter((e) => e.category === "売上").reduce((s, e) => s + e.amountJpy, 0);
  const expense = fixed.filter((e) => e.category === "経費").reduce((s, e) => s + e.amountJpy, 0);
  return {
    incomeJpy: income,
    expenseJpy: expense,
    balanceJpy: income - expense,
    pendingCount: LEDGER_ENTRIES.filter((e) => e.status !== "確定").length,
  };
}

// ---------------------------------------------------------------------------
// 人事部
// ---------------------------------------------------------------------------

/** AI社員の稼働・評価レコード(Mock)。 */
export interface HrMemberRecord {
  name: string;
  dept: string;
  utilizationPercent: number;
  evaluation: "S" | "A" | "B" | "C";
  note: string;
}

export const HR_MEMBER_RECORDS: readonly HrMemberRecord[] = [
  { name: "AIセールス(鈴木)", dept: "営業部", utilizationPercent: 92, evaluation: "S", note: "アポ獲得率が高水準" },
  { name: "AIリサーチャー(調査1号)", dept: "市場調査部", utilizationPercent: 85, evaluation: "A", note: "新サービス発見に貢献" },
  { name: "AI編集長", dept: "出版部", utilizationPercent: 74, evaluation: "A", note: "クリーン運営チェックを主導" },
  { name: "AIドキュメントライター", dept: "企画部", utilizationPercent: 68, evaluation: "B", note: "保管庫フロー整備中" },
  { name: "AIサポート(1号)", dept: "カスタマーサポート部", utilizationPercent: 61, evaluation: "B", note: "FAQ更新を担当" },
];

/** 採用計画(Mock)。実採用活動は行わない。 */
export interface HiringPlan {
  role: string;
  dept: string;
  headcount: number;
  status: "承認待ち" | "計画中" | "承認済み";
}

export const HIRING_PLANS: readonly HiringPlan[] = [
  { role: "AIインサイドセールス", dept: "営業部", headcount: 2, status: "承認待ち" },
  { role: "AIカスタマーサクセス", dept: "カスタマーサポート部", headcount: 1, status: "計画中" },
  { role: "AI QAエンジニア", dept: "システム開発部", headcount: 1, status: "承認済み" },
];

export const HR_STAFF: readonly string[] = ["AI人事(採用・配置)", "AI評価コーディネーター"];

export interface HrKpi {
  averageUtilizationPercent: number;
  topEvaluations: number;
  hiringPlanned: number;
  hiringPendingApproval: number;
}

/** 人事KPI(Mockデータから導出)。 */
export function buildHrKpi(): HrKpi {
  const avg =
    HR_MEMBER_RECORDS.reduce((s, r) => s + r.utilizationPercent, 0) / HR_MEMBER_RECORDS.length;
  return {
    averageUtilizationPercent: Math.round(avg),
    topEvaluations: HR_MEMBER_RECORDS.filter((r) => r.evaluation === "S" || r.evaluation === "A")
      .length,
    hiringPlanned: HIRING_PLANS.reduce((s, p) => s + p.headcount, 0),
    hiringPendingApproval: HIRING_PLANS.filter((p) => p.status === "承認待ち").length,
  };
}
