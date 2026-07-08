// システム開発部のMockデータ(開発部ページ充実フェーズ)。
// β版はすべてMock: 実デプロイ・実外部API接続は行わない。
// AI社員数は COMMAND_DEPARTMENTS(development 6)と整合させる。

/** 開発案件のステータス。 */
export type DevProjectStatus = "要件定義" | "開発中" | "テスト中" | "リリース済み" | "エラー対応";

export const DEV_PROJECT_STATUSES: readonly DevProjectStatus[] = [
  "要件定義",
  "開発中",
  "テスト中",
  "リリース済み",
  "エラー対応",
];

export const DEV_PROJECT_STATUS_COLOR: Record<DevProjectStatus, string> = {
  要件定義: "#A855F7",
  開発中: "#FACC15",
  テスト中: "#3b82f6",
  リリース済み: "#22C55E",
  エラー対応: "#EF4444",
};

/** 開発案件(Mock)。 */
export interface DevProject {
  id: string;
  name: string;
  requester: string;
  status: DevProjectStatus;
  progressPercent: number;
  note: string;
}

export const DEV_PROJECTS: readonly DevProject[] = [
  {
    id: "P-301",
    name: "架電リストツールの改善(媒体検索の精度向上)",
    requester: "営業部",
    status: "開発中",
    progressPercent: 55,
    note: "媒体判定の誤検知を削減中",
  },
  {
    id: "P-302",
    name: "API連携の実装(外部サービス接続基盤)",
    requester: "経営企画",
    status: "エラー対応",
    progressPercent: 42,
    note: "外部APIの認証期限切れの可能性。APIキー更新で再接続予定",
  },
  {
    id: "P-303",
    name: "保管庫の自動アーカイブ提案",
    requester: "企画部",
    status: "テスト中",
    progressPercent: 78,
    note: "容量しきい値の調整中",
  },
  {
    id: "P-304",
    name: "議事録テンプレートの部署別最適化",
    requester: "人事部",
    status: "要件定義",
    progressPercent: 10,
    note: "対象部署のヒアリング中",
  },
  {
    id: "P-305",
    name: "営業リストの重複統合ルール改善",
    requester: "営業部",
    status: "リリース済み",
    progressPercent: 100,
    note: "電話番号優先の重複排除を提供済み",
  },
];

export const DEV_STAFF: readonly string[] = [
  "AIリードエンジニア",
  "AIフロントエンド開発",
  "AIバックエンド開発",
  "AI QAテスター",
  "AI自動化ツール開発",
  "AI SRE(監視・復旧)",
];

export interface DevKpi {
  totalProjects: number;
  inProgress: number;
  released: number;
  errorCount: number;
  averageProgressPercent: number;
}

/** 開発KPI(案件配列から導出)。 */
export function buildDevKpi(projects: readonly DevProject[]): DevKpi {
  const avg =
    projects.length === 0
      ? 0
      : projects.reduce((s, p) => s + p.progressPercent, 0) / projects.length;
  return {
    totalProjects: projects.length,
    inProgress: projects.filter((p) => p.status === "開発中" || p.status === "テスト中").length,
    released: projects.filter((p) => p.status === "リリース済み").length,
    errorCount: projects.filter((p) => p.status === "エラー対応").length,
    averageProgressPercent: Math.round(avg),
  };
}

/** アバター吹き出し用の開発要約(エラー対応案件を知らせる)。 */
export function buildDevSummaryJa(): string[] {
  return DEV_PROJECTS.filter((p) => p.status === "エラー対応").map(
    (p) => `開発部の案件「${p.name}」(${p.id})がエラー対応中です。`,
  );
}
