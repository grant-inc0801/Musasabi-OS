// AI Business Factory(docs/ai-handoff/AI_BUSINESS_FACTORY_DIRECTIVE.md)。
// 標準テンプレートで新規事業ユニットを立ち上げ・運営する。各ユニットは AI COO 経由で
// AI CEO へレポートし、Musasabi 憲章・ガバナンス・監査ポリシーに従う。
// すべて Mock・決定論。実外部接続・secrets なし。

/** 事業ユニットの標準ロール構成(AI事業部長 + 各チーム + AI監査リエゾン)。 */
export const BUSINESS_UNIT_ROLES: readonly string[] = [
  "AI事業部長(AI Business Director)",
  "営業チーム",
  "マーケティングチーム",
  "開発チーム",
  "運用チーム",
  "カスタマーサクセスチーム",
  "財務サポート",
  "AI監査リエゾン",
];

/** 自動プロビジョニングで生成される成果物。 */
export interface BusinessUnitProvisioning {
  departmentStructure: readonly string[];
  kpiDashboard: readonly { label: string; value: string }[];
  executiveDashboardIntegrated: boolean;
  workflowTemplates: readonly string[];
  companyBrainWorkspace: string;
  knowledgeRepository: string;
  reportingTemplates: readonly string[];
  riskMonitoring: readonly string[];
  mockOperatingData: readonly { label: string; value: string }[];
}

export type BusinessUnitStatus = "provisioning" | "operating";

export const BUSINESS_UNIT_STATUS_LABEL_JA: Record<BusinessUnitStatus, string> = {
  provisioning: "構築中",
  operating: "稼働中",
};

/** 事業ユニット。 */
export interface BusinessUnit {
  id: string;
  name: string;
  /** 事業概要(Mock)。 */
  description: string;
  director: string;
  status: BusinessUnitStatus;
  /** レポートライン(ガバナンス)。 */
  reportsTo: string;
  roles: readonly string[];
  provisioning: BusinessUnitProvisioning;
}

/** ガバナンス: 事業ユニットは AI COO 経由で AI CEO へレポートする。 */
export const REPORTING_LINE = "AI COO → AI CEO";

/** 憲章・ガバナンス・監査の遵守方針(表示用)。 */
export const GOVERNANCE_NOTES: readonly string[] = [
  "Musasabi 憲章に従う(人間承認・監査ログ保持・本番デプロイ禁止)。",
  "AI COO 経由で AI CEO へレポートする。",
  "AI監査リエゾンがリスク・ポリシー遵守を監視する。",
];

/**
 * 新規事業ユニットを標準テンプレートでプロビジョニングする(決定論・Mock)。
 * 部門構造・KPI・ワークフロー・Company Brain・ナレッジ・レポート・リスク監視・
 * Mock運用データを自動生成する。実際の作成・外部接続はしない。
 */
export function provisionBusinessUnit(
  name: string,
  options: { id?: string; description?: string; status?: BusinessUnitStatus } = {},
): BusinessUnit {
  const id = options.id ?? `bu-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const provisioning: BusinessUnitProvisioning = {
    departmentStructure: [
      `${name} 営業部`,
      `${name} マーケティング部`,
      `${name} 開発部`,
      `${name} 運用部`,
      `${name} カスタマーサクセス部`,
      `${name} 財務サポート`,
    ],
    kpiDashboard: [
      { label: "売上目標(月)", value: "¥0(Mock)" },
      { label: "リード獲得", value: "0 件" },
      { label: "稼働率", value: "0%" },
      { label: "解約率", value: "0%" },
    ],
    executiveDashboardIntegrated: true,
    workflowTemplates: ["承認ワークフロー", "リード→商談→受注フロー", "リリース承認フロー"],
    companyBrainWorkspace: `${name} Company Brain ワークスペース(Mock)`,
    knowledgeRepository: `${name} ナレッジリポジトリ(Mock)`,
    reportingTemplates: ["日次レポート", "週次レポート", "月次レポート"],
    riskMonitoring: ["承認遵守チェック", "KPI整合性チェック", "運用リスク監視"],
    mockOperatingData: [
      { label: "稼働日数", value: "0 日" },
      { label: "登録顧客", value: "0 社" },
      { label: "処理タスク", value: "0 件" },
    ],
  };
  return {
    id,
    name,
    description: options.description ?? `${name} 事業ユニット(Mock)`,
    director: `${name} AI事業部長`,
    status: options.status ?? "provisioning",
    reportsTo: REPORTING_LINE,
    roles: BUSINESS_UNIT_ROLES,
    provisioning,
  };
}

/** 初期ターゲット: MEISHI-TUBE(第1号事業ユニットテンプレート)。 */
export const MEISHI_TUBE: BusinessUnit = {
  ...provisionBusinessUnit("MEISHI-TUBE", {
    id: "bu-meishi-tube",
    description: "名刺のデジタル化・管理サービス(Mock)。第1号事業ユニット。",
    status: "operating",
  }),
  provisioning: {
    ...provisionBusinessUnit("MEISHI-TUBE").provisioning,
    kpiDashboard: [
      { label: "売上目標(月)", value: "¥800,000(Mock)" },
      { label: "リード獲得", value: "42 件" },
      { label: "稼働率", value: "76%" },
      { label: "解約率", value: "3%" },
    ],
    mockOperatingData: [
      { label: "稼働日数", value: "28 日" },
      { label: "登録顧客", value: "56 社" },
      { label: "処理タスク", value: "184 件" },
    ],
  },
};

export const BUSINESS_UNITS: readonly BusinessUnit[] = [MEISHI_TUBE];

export interface FactorySummary {
  totalUnits: number;
  operating: number;
  provisioning: number;
  rolesPerUnit: number;
}

export function summarizeFactory(units: readonly BusinessUnit[] = BUSINESS_UNITS): FactorySummary {
  return {
    totalUnits: units.length,
    operating: units.filter((u) => u.status === "operating").length,
    provisioning: units.filter((u) => u.status === "provisioning").length,
    rolesPerUnit: BUSINESS_UNIT_ROLES.length,
  };
}
