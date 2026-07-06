// 会社全体・部門別のサマリー(D-20260706-006 追加UI修正指示2・3)。
// 左サイドバーを「ミニ経営ダッシュボード」として機能させるためのデータモデル。
// β版では Mock 値(実データ連携は後続フェーズ)。集計は決定論的な純粋関数。

/** 部門の稼働ステータス。 */
export type DepartmentStatus = "active" | "learning" | "preparing";

export const DEPARTMENT_STATUS_LABEL_JA: Record<DepartmentStatus, string> = {
  active: "稼働中",
  learning: "学習中",
  preparing: "準備中",
};

/** 部門ごとのタスク進捗・作業内容・成果のサマリー。 */
export interface DepartmentSummary {
  id: string;
  name: string;
  /** 割当AI社員数。 */
  employeeCount: number;
  /** 本日のタスク進捗率(0〜100)。 */
  progressPercent: number;
  /** 本日の作業内容の要約(短文)。 */
  todaySummary: string;
  /** 売上または成果指標(円)。 */
  revenueJpy: number;
  status: DepartmentStatus;
}

/** 会社全体のサマリー(部門サマリーから決定論的に集計する)。 */
export interface CompanySummary {
  totalEmployees: number;
  totalRevenueJpy: number;
  /** 本日タスク進捗(全部門の単純平均、0〜100、四捨五入)。 */
  todayProgressPercent: number;
  /** 稼働中(active)部門数。 */
  activeDepartments: number;
}

/**
 * 部門サマリーの Mock マスタ(β版)。実データ連携は後続フェーズ。
 * 営業部は Epic β-001 で実運用に入った部門、出版部は D-20260706-006 で追加。
 */
export const MOCK_DEPARTMENT_SUMMARIES: readonly DepartmentSummary[] = [
  {
    id: "dept-sales",
    name: "営業部",
    employeeCount: 5,
    progressPercent: 72,
    todaySummary: "テストコール改善中",
    revenueJpy: 820000,
    status: "active",
  },
  {
    id: "dept-publishing",
    name: "出版部",
    employeeCount: 3,
    progressPercent: 45,
    todaySummary: "ライトノベル校正中",
    revenueJpy: 120000,
    status: "active",
  },
  {
    id: "dept-development",
    name: "開発部",
    employeeCount: 4,
    progressPercent: 60,
    todaySummary: "β版UI改善・ビルド整備中",
    revenueJpy: 310000,
    status: "active",
  },
  {
    id: "dept-support",
    name: "サポート部",
    employeeCount: 2,
    progressPercent: 30,
    todaySummary: "導入手順ドキュメント学習中",
    revenueJpy: 0,
    status: "learning",
  },
];

/** 部門サマリーから会社全体サマリーを集計する。空配列は全項目0。 */
export function computeCompanySummary(
  departments: readonly DepartmentSummary[] = MOCK_DEPARTMENT_SUMMARIES,
): CompanySummary {
  if (departments.length === 0) {
    return { totalEmployees: 0, totalRevenueJpy: 0, todayProgressPercent: 0, activeDepartments: 0 };
  }
  const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
  const totalRevenueJpy = departments.reduce((sum, d) => sum + d.revenueJpy, 0);
  const todayProgressPercent = Math.round(
    departments.reduce((sum, d) => sum + d.progressPercent, 0) / departments.length,
  );
  const activeDepartments = departments.filter((d) => d.status === "active").length;
  return { totalEmployees, totalRevenueJpy, todayProgressPercent, activeDepartments };
}

/** 金額を「¥1,250,000」形式で整形する。 */
export function formatJpy(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}
