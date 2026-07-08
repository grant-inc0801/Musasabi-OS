// 営業部門の日次活動(Directive D-20260708-001 §5)。
// 本日の架電予定・アポ目標/獲得・改善対象トーク・よくある反論と推奨切り返し・
// 営業資料作成依頼・次の営業アクションを Mock 表示する。
// 将来の Zoom Phone / FileMaker 連携は後続フェーズ扱い。現フェーズでは実接続しない。

/** よくある反論と、それに対する推奨切り返し(Mock)。 */
export interface Rebuttal {
  objection: string;
  response: string;
}

/** 営業資料の作成依頼(Mock)。企画部門・出版部門/保管庫連携を想定。 */
export interface SalesMaterialRequest {
  id: string;
  title: string;
  requestedBy: string;
  status: "依頼中" | "作成中" | "レビュー待ち" | "完了";
}

export const SALES_MATERIAL_STATUS_COLOR: Record<SalesMaterialRequest["status"], string> = {
  依頼中: "#6b7280",
  作成中: "#FACC15",
  レビュー待ち: "#A855F7",
  完了: "#22C55E",
};

/** 営業部門の本日の活動サマリー(Mock・決定論)。 */
export interface SalesActivity {
  /** 本日の架電予定件数。 */
  plannedCalls: number;
  /** 本日のアポ目標件数。 */
  appointmentGoal: number;
  /** 本日の獲得アポ数(現時点)。 */
  appointmentsWon: number;
  /** 改善対象トーク(スクリプト名)。 */
  improvementTargets: string[];
  /** よくある反論と推奨切り返し。 */
  rebuttals: readonly Rebuttal[];
  /** 営業資料作成依頼。 */
  materialRequests: readonly SalesMaterialRequest[];
  /** 次の営業アクション。 */
  nextActions: string[];
}

/** 本日の営業活動Mock。決定的。 */
export const SALES_ACTIVITY: SalesActivity = {
  plannedCalls: 20,
  appointmentGoal: 4,
  appointmentsWon: 2,
  improvementTargets: ["初回架電スクリプト(冒頭15秒)", "価格提示後のクロージング"],
  rebuttals: [
    { objection: "今は忙しい", response: "2分だけお時間をいただき、要点だけお伝えします。ご不要ならすぐに切ります。" },
    { objection: "他社を使っている", response: "併用されている企業さまも多いです。現状の課題を1点だけ伺えますか。" },
    { objection: "価格が高い", response: "削減できる工数と時給で換算すると、多くの場合3か月で回収できています。" },
    { objection: "検討する", response: "承知しました。判断材料として、貴社に近い事例を1件だけお送りしてもよいですか。" },
  ],
  materialRequests: [
    { id: "mat-1", title: "飲食店向け導入事例1枚もの", requestedBy: "営業リーダーAI", status: "作成中" },
    { id: "mat-2", title: "料金比較表(競合3社)", requestedBy: "営業リーダーAI", status: "レビュー待ち" },
    { id: "mat-3", title: "導入後サポート体制の説明資料", requestedBy: "AIセールス担当", status: "依頼中" },
  ],
  nextActions: [
    "未架電リストの上位20件へ本日中に架電する",
    "改善対象トークをテストコールで練習し、AIコーチのフィードバックを受ける",
    "レビュー待ちの料金比較表を確認し、承認後に保管庫へ保存する",
    "獲得アポ2件の商談資料を企画部門へ依頼する",
  ],
};

/** アポ目標の達成率(%)。目標0のとき0を返す。 */
export function appointmentAchievementPct(activity: SalesActivity = SALES_ACTIVITY): number {
  if (activity.appointmentGoal <= 0) return 0;
  return Math.round((activity.appointmentsWon / activity.appointmentGoal) * 100);
}

/** アバター吹き出し用: 営業部門の要約行(Mock・決定的)。 */
export function buildSalesActivitySummaryJa(activity: SalesActivity = SALES_ACTIVITY): string[] {
  const lines: string[] = [];
  lines.push(
    `営業部門は本日${activity.plannedCalls}件の架電予定があります。アポ目標${activity.appointmentGoal}件に対し現在${activity.appointmentsWon}件を獲得しています。`,
  );
  const reviewing = activity.materialRequests.filter((m) => m.status === "レビュー待ち");
  if (reviewing.length > 0) {
    lines.push(`営業資料「${reviewing.map((m) => m.title).join("・")}」がレビュー待ちです。`);
  }
  return lines;
}
