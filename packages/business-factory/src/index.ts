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
  /** テンプレート由来: 配置される AI社員(Mock)。テンプレート未指定時は空。 */
  aiEmployees?: readonly string[];
  /** テンプレート由来: 必要ドキュメント(Mock)。 */
  requiredDocuments?: readonly string[];
  /** テンプレート由来: ダッシュボードカード(Mock)。 */
  dashboardCards?: readonly string[];
  /** テンプレート由来: レポートフォーマット(Mock)。 */
  reportingFormat?: string;
  /** 生成元テンプレートID(テンプレートから作成された場合)。 */
  templateId?: string;
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

// ─────────────────────────────────────────────────────────────────────────────
// Business Template Catalog(docs/ai-handoff/BUSINESS_TEMPLATE_CATALOG_DIRECTIVE.md)
// 選択式テンプレートから事業ユニットを生成する。AI_BUSINESS_FACTORY_DIRECTIVE の拡張。
// すべて Mock・決定論。実外部接続・secrets なし。
// ─────────────────────────────────────────────────────────────────────────────

/** 事業テンプレート。選択すると事業ユニットを Mock で生成する。 */
export interface BusinessTemplate {
  id: string;
  /** テンプレート名(業種)。 */
  name: string;
  /** 事業ユニットの既定名(Mock)。 */
  unitName: string;
  /** 業種の説明(表示用)。 */
  summary: string;
  /** AI事業部長ロール。 */
  director: string;
  /** 必要チーム。 */
  teams: readonly string[];
  /** 配置される AI社員(Mock)。 */
  aiEmployees: readonly string[];
  /** 月間KPI例。 */
  monthlyKpi: readonly { label: string; value: string }[];
  /** ワークフロー例。 */
  workflows: readonly string[];
  /** 必要ドキュメント。 */
  requiredDocuments: readonly string[];
  /** ナレッジワークスペース(Mock)。 */
  knowledgeWorkspace: string;
  /** ダッシュボードカード。 */
  dashboardCards: readonly string[];
  /** リスクチェック項目。 */
  riskChecks: readonly string[];
  /** レポートフォーマット。 */
  reportingFormat: string;
}

const AUDIT_LIAISON = "AI監査リエゾン";

/** テンプレートカタログ(8種)。MEISHI-TUBE と SaaS を先頭に配置。 */
export const BUSINESS_TEMPLATES: readonly BusinessTemplate[] = [
  {
    id: "tmpl-meishi-tube",
    name: "MEISHI-TUBE 事業",
    unitName: "MEISHI-TUBE",
    summary: "名刺のデジタル化・管理サービス(第1号事業ユニット)。",
    director: "MEISHI-TUBE AI事業部長",
    teams: ["営業チーム", "マーケティングチーム", "開発チーム", "運用チーム", "カスタマーサクセスチーム", "財務サポート"],
    aiEmployees: ["営業AI 3名", "マーケAI 2名", "開発AI 3名", "運用AI 2名", "CS AI 2名", "監査AI 1名"],
    monthlyKpi: [
      { label: "売上目標(月)", value: "¥800,000(Mock)" },
      { label: "リード獲得", value: "42 件" },
      { label: "稼働率", value: "76%" },
      { label: "解約率", value: "3%" },
    ],
    workflows: ["名刺取込→データ化→納品フロー", "リード→商談→受注フロー", "解約防止フォローフロー"],
    requiredDocuments: ["利用規約(Mock)", "データ化仕様書", "月次レポート雛形"],
    knowledgeWorkspace: "MEISHI-TUBE Company Brain ワークスペース(Mock)",
    dashboardCards: ["月次売上", "リード獲得", "稼働率", "解約率", "納品リードタイム"],
    riskChecks: ["承認遵守チェック", "個人情報取扱いチェック(Mock)", "KPI整合性チェック"],
    reportingFormat: "月次: 売上・リード・稼働率・解約率(Markdown/PDF Mock)",
  },
  {
    id: "tmpl-saas",
    name: "SaaS 事業",
    unitName: "SaaS-UNIT",
    summary: "サブスクリプション型ソフトウェア事業。",
    director: "SaaS AI事業部長",
    teams: ["営業チーム", "マーケティングチーム", "プロダクト開発チーム", "SREチーム", "カスタマーサクセスチーム", "財務サポート"],
    aiEmployees: ["インサイドセールスAI 3名", "グロースAI 2名", "開発AI 4名", "SRE AI 2名", "CS AI 3名", "監査AI 1名"],
    monthlyKpi: [
      { label: "MRR", value: "¥0(Mock)" },
      { label: "新規サインアップ", value: "0 件" },
      { label: "チャーンレート", value: "0%" },
      { label: "NRR", value: "0%" },
    ],
    workflows: ["トライアル→有償転換フロー", "オンボーディングフロー", "リリース承認フロー", "インシデント対応フロー"],
    requiredDocuments: ["SLA(Mock)", "プライシング表", "セキュリティホワイトペーパー(Mock)"],
    knowledgeWorkspace: "SaaS Company Brain ワークスペース(Mock)",
    dashboardCards: ["MRR/ARR", "サインアップ", "チャーン", "NRR", "稼働率(SLO)"],
    riskChecks: ["承認遵守チェック", "SLO/可用性チェック", "セキュリティレビュー(Mock)"],
    reportingFormat: "月次: MRR・チャーン・NRR・SLO(Markdown/PDF Mock)",
  },
  {
    id: "tmpl-sales-agency",
    name: "営業代行 事業",
    unitName: "SALES-AGENCY-UNIT",
    summary: "アウトバウンド営業代行・商談創出サービス。",
    director: "営業代行 AI事業部長",
    teams: ["インサイドセールスチーム", "フィールドセールスチーム", "リストマーケティングチーム", "運用チーム", "財務サポート"],
    aiEmployees: ["架電AI 5名", "商談AI 2名", "リスト制作AI 2名", "監査AI 1名"],
    monthlyKpi: [
      { label: "アポ獲得", value: "0 件" },
      { label: "架電数", value: "0 コール" },
      { label: "受注貢献額", value: "¥0(Mock)" },
      { label: "アポ率", value: "0%" },
    ],
    workflows: ["リスト取込→架電→アポ設定フロー", "商談引継ぎフロー", "成果レポートフロー"],
    requiredDocuments: ["トークスクリプト(Mock)", "KPI定義書", "秘密保持覚書(Mock)"],
    knowledgeWorkspace: "営業代行 Company Brain ワークスペース(Mock)",
    dashboardCards: ["アポ獲得", "架電数", "アポ率", "受注貢献額"],
    riskChecks: ["承認遵守チェック", "架電コンプライアンスチェック(Mock)", "KPI整合性チェック"],
    reportingFormat: "週次: 架電数・アポ数・アポ率、月次: 受注貢献(Markdown Mock)",
  },
  {
    id: "tmpl-publishing",
    name: "出版 事業",
    unitName: "PUBLISHING-UNIT",
    summary: "電子書籍・コンテンツ出版事業。",
    director: "出版 AI事業部長",
    teams: ["編集チーム", "制作チーム", "マーケティングチーム", "営業チーム", "財務サポート"],
    aiEmployees: ["敏腕編集長AI 1名", "編集AI 3名", "校正AI 2名", "販促AI 2名", "監査AI 1名"],
    monthlyKpi: [
      { label: "刊行点数", value: "0 点" },
      { label: "販売部数", value: "0 部" },
      { label: "売上", value: "¥0(Mock)" },
      { label: "返本率", value: "0%" },
    ],
    workflows: ["企画→執筆→編集→校正→刊行フロー", "販促キャンペーンフロー", "増刷判断フロー"],
    requiredDocuments: ["編集ガイドライン(Mock)", "刊行スケジュール", "権利処理チェックリスト(Mock)"],
    knowledgeWorkspace: "出版 Company Brain ワークスペース(Mock)",
    dashboardCards: ["刊行点数", "販売部数", "売上", "返本率", "編集リードタイム"],
    riskChecks: ["承認遵守チェック", "著作権・権利処理チェック(Mock)", "品質(校正)チェック"],
    reportingFormat: "月次: 刊行点数・販売部数・売上・返本率(Markdown/PDF Mock)",
  },
  {
    id: "tmpl-callcenter",
    name: "コールセンター 事業",
    unitName: "CALLCENTER-UNIT",
    summary: "インバウンド/アウトバウンド コールセンター運営。",
    director: "コールセンター AI事業部長",
    teams: ["インバウンドチーム", "アウトバウンドチーム", "品質管理チーム", "運用チーム", "財務サポート"],
    aiEmployees: ["応対AI 6名", "SVAI 1名", "QA AI 2名", "監査AI 1名"],
    monthlyKpi: [
      { label: "応答率", value: "0%" },
      { label: "平均応対時間", value: "0 秒" },
      { label: "CSAT", value: "0%" },
      { label: "一次解決率", value: "0%" },
    ],
    workflows: ["着信→応対→記録フロー", "エスカレーションフロー", "品質モニタリングフロー"],
    requiredDocuments: ["応対マニュアル(Mock)", "エスカレーション基準", "録音取扱い規程(Mock)"],
    knowledgeWorkspace: "コールセンター Company Brain ワークスペース(Mock)",
    dashboardCards: ["応答率", "平均応対時間", "CSAT", "一次解決率", "放棄呼率"],
    riskChecks: ["承認遵守チェック", "録音・個人情報チェック(Mock)", "応対品質チェック"],
    reportingFormat: "日次: 応答率・応対時間、月次: CSAT・一次解決率(Markdown Mock)",
  },
  {
    id: "tmpl-ec",
    name: "EC 事業",
    unitName: "EC-UNIT",
    summary: "オンライン物販・EC ストア運営。",
    director: "EC AI事業部長",
    teams: ["商品企画チーム", "マーケティングチーム", "受注・物流チーム", "CSチーム", "財務サポート"],
    aiEmployees: ["MDAI 2名", "広告運用AI 2名", "受注AI 2名", "CS AI 2名", "監査AI 1名"],
    monthlyKpi: [
      { label: "GMV", value: "¥0(Mock)" },
      { label: "注文数", value: "0 件" },
      { label: "CVR", value: "0%" },
      { label: "リピート率", value: "0%" },
    ],
    workflows: ["商品登録→販売→出荷フロー", "広告→集客→CVフロー", "在庫補充フロー"],
    requiredDocuments: ["特定商取引法表記(Mock)", "在庫管理表", "返品ポリシー(Mock)"],
    knowledgeWorkspace: "EC Company Brain ワークスペース(Mock)",
    dashboardCards: ["GMV", "注文数", "CVR", "リピート率", "在庫回転"],
    riskChecks: ["承認遵守チェック", "在庫整合性チェック", "決済・表示コンプライアンスチェック(Mock)"],
    reportingFormat: "日次: GMV・注文数、月次: CVR・リピート率(Markdown Mock)",
  },
  {
    id: "tmpl-restaurant",
    name: "飲食店 事業",
    unitName: "RESTAURANT-UNIT",
    summary: "飲食店の運営・多店舗展開マネジメント。",
    director: "飲食店 AI事業部長",
    teams: ["店舗運営チーム", "仕入れ・原価チーム", "販促チーム", "採用・シフトチーム", "財務サポート"],
    aiEmployees: ["店舗運営AI 3名", "原価管理AI 1名", "販促AI 2名", "シフトAI 1名", "監査AI 1名"],
    monthlyKpi: [
      { label: "売上", value: "¥0(Mock)" },
      { label: "客数", value: "0 名" },
      { label: "原価率(FL)", value: "0%" },
      { label: "回転率", value: "0 回" },
    ],
    workflows: ["仕入れ→仕込み→提供フロー", "予約→来店→会計フロー", "販促キャンペーンフロー"],
    requiredDocuments: ["衛生管理マニュアル(Mock)", "原価計算表", "シフト表雛形"],
    knowledgeWorkspace: "飲食店 Company Brain ワークスペース(Mock)",
    dashboardCards: ["売上", "客数", "客単価", "原価率(FL)", "回転率"],
    riskChecks: ["承認遵守チェック", "衛生・食品安全チェック(Mock)", "原価率アラート"],
    reportingFormat: "日次: 売上・客数、月次: FL率・回転率(Markdown Mock)",
  },
  {
    id: "tmpl-consulting",
    name: "コンサルティング 事業",
    unitName: "CONSULTING-UNIT",
    summary: "経営・業務コンサルティングサービス。",
    director: "コンサルティング AI事業部長",
    teams: ["デリバリーチーム", "リサーチチーム", "営業チーム", "ナレッジチーム", "財務サポート"],
    aiEmployees: ["コンサルAI 4名", "リサーチAI 2名", "営業AI 1名", "監査AI 1名"],
    monthlyKpi: [
      { label: "受注案件", value: "0 件" },
      { label: "稼働率(ユーティライゼーション)", value: "0%" },
      { label: "売上", value: "¥0(Mock)" },
      { label: "顧客満足度", value: "0%" },
    ],
    workflows: ["提案→受注→デリバリーフロー", "週次進捗レビューフロー", "ナレッジ蓄積フロー"],
    requiredDocuments: ["提案書テンプレート(Mock)", "SOW雛形", "成果報告書雛形"],
    knowledgeWorkspace: "コンサルティング Company Brain ワークスペース(Mock)",
    dashboardCards: ["受注案件", "稼働率", "売上", "顧客満足度", "ナレッジ件数"],
    riskChecks: ["承認遵守チェック", "守秘義務チェック(Mock)", "品質(成果物)チェック"],
    reportingFormat: "月次: 受注・稼働率・売上・満足度(Markdown/PDF Mock)",
  },
];

/** テンプレートIDからテンプレートを取得する。 */
export function getTemplate(id: string): BusinessTemplate | undefined {
  return BUSINESS_TEMPLATES.find((t) => t.id === id);
}

/**
 * テンプレートを選択して事業ユニットを Mock 生成する(決定論)。
 * 部門・AI社員・KPIダッシュボード・ワークフロー・レポート・監査監視を自動生成する。
 * 実際の作成・外部接続はしない。
 */
export function provisionFromTemplate(
  templateId: string,
  options: { name?: string; status?: BusinessUnitStatus } = {},
): BusinessUnit {
  const t = getTemplate(templateId);
  if (!t) throw new Error(`unknown template: ${templateId}`);
  const name = options.name?.trim() || t.unitName;
  const id = `bu-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const roles = [t.director, ...t.teams, AUDIT_LIAISON];
  const provisioning: BusinessUnitProvisioning = {
    departmentStructure: t.teams.map((team) => `${name} ${team}`),
    kpiDashboard: t.monthlyKpi,
    executiveDashboardIntegrated: true,
    workflowTemplates: t.workflows,
    companyBrainWorkspace: t.knowledgeWorkspace,
    knowledgeRepository: `${name} ナレッジリポジトリ(Mock)`,
    reportingTemplates: ["日次レポート", "週次レポート", "月次レポート"],
    riskMonitoring: t.riskChecks,
    mockOperatingData: [
      { label: "稼働日数", value: "0 日" },
      { label: "登録顧客", value: "0 社" },
      { label: "処理タスク", value: "0 件" },
    ],
    aiEmployees: t.aiEmployees,
    requiredDocuments: t.requiredDocuments,
    dashboardCards: t.dashboardCards,
    reportingFormat: t.reportingFormat,
    templateId: t.id,
  };
  return {
    id,
    name,
    description: t.summary,
    director: t.director,
    status: options.status ?? "provisioning",
    reportsTo: REPORTING_LINE,
    roles,
    provisioning,
  };
}
