// Musasabi World(docs/ai-handoff/MUSASABI_WORLD_DIRECTIVE.md)。
// 1つの事業アイデア/テンプレートから、AI会社(AI CEO・役員・事業ユニット・部門・AI社員・
// KPI・ワークフロー・Company Brain・Musasabi DNA・Knowledge Vault・レポート・監査・運用データ)を
// 決定論で Mock 生成する。実アカウント作成・課金・外部接続・secrets は一切なし。
// business-factory のテンプレート/プロビジョニングを土台に会社レイヤーを組み立てる。

import {
  BUSINESS_TEMPLATES,
  getTemplate,
  provisionFromTemplate,
  type BusinessTemplate,
} from "@musasabi/business-factory";

export type { BusinessTemplate };
export { BUSINESS_TEMPLATES };

/** AI役員(経営チーム)。 */
export interface AiExecutive {
  role: string;
  focus: string;
}

/** ラベル・値のペア(KPI / DNA / 運用データ表示用)。 */
export interface LabeledValue {
  label: string;
  value: string;
}

/** テンプレートから生成された AI 会社ワークスペース(Mock)。 */
export interface GeneratedCompany {
  id: string;
  /** 会社名。 */
  name: string;
  /** 入力された事業アイデア(Mock)。 */
  idea: string;
  /** 生成元テンプレートID。 */
  templateId: string;
  templateName: string;
  /** AI CEO。 */
  ceo: string;
  /** 役員チーム。 */
  executives: readonly AiExecutive[];
  /** 事業ユニット名。 */
  businessUnitName: string;
  /** 部門マップ。 */
  departmentMap: readonly string[];
  /** AI社員名簿(Mock)。 */
  employeeRoster: readonly string[];
  /** KPIダッシュボード。 */
  kpiDashboard: readonly LabeledValue[];
  /** ワークフローテンプレート。 */
  workflows: readonly string[];
  /** Company Brain ワークスペース(Mock)。 */
  companyBrainWorkspace: string;
  /** Musasabi DNA プロファイル。 */
  dnaProfile: readonly LabeledValue[];
  /** Knowledge Vault フォルダ。 */
  knowledgeVaultFolders: readonly string[];
  /** レポートテンプレート。 */
  reportTemplates: readonly string[];
  /** 監査モニタリング。 */
  auditMonitoring: readonly string[];
  /** Mock 運用データ。 */
  mockOperatingData: readonly LabeledValue[];
  /** ガバナンス: レポートライン。 */
  reportsTo: string;
}

/** 標準 AI 役員チーム(AI CEO 配下)。 */
export const EXECUTIVE_TEAM: readonly AiExecutive[] = [
  { role: "AI COO", focus: "全社オペレーション統括" },
  { role: "AI CFO", focus: "財務・予算・KPI健全性" },
  { role: "AI CTO", focus: "プロダクト・技術・開発" },
  { role: "AI CMO", focus: "マーケティング・成長" },
  { role: "AI監査役", focus: "ガバナンス・リスク・監査" },
];

/** ガバナンス: 生成会社は AI CEO をトップに、AI COO 経由で統括する。 */
export const WORLD_REPORTING_LINE = "AI CEO ← AI COO ← 各事業ユニット";

/** アイデア文からテンプレートを推定する(キーワード・決定論)。既定は SaaS。 */
export function inferTemplateId(idea: string): string {
  const s = idea.toLowerCase();
  const rules: readonly [readonly string[], string][] = [
    [["名刺", "meishi"], "tmpl-meishi-tube"],
    [["saas", "サブスク", "subscription", "ソフトウェア"], "tmpl-saas"],
    [["営業代行", "アウトバウンド", "テレアポ", "sales agency"], "tmpl-sales-agency"],
    [["出版", "電子書籍", "publishing", "書籍"], "tmpl-publishing"],
    [["コールセンター", "call center", "コンタクトセンター"], "tmpl-callcenter"],
    [["ec", "通販", "物販", "ネットショップ", "オンラインストア"], "tmpl-ec"],
    [["飲食", "restaurant", "レストラン", "店舗"], "tmpl-restaurant"],
    [["コンサル", "consulting", "顧問"], "tmpl-consulting"],
  ];
  for (const [keywords, id] of rules) {
    if (keywords.some((k) => s.includes(k))) return id;
  }
  return "tmpl-saas";
}

/** テンプレートから Musasabi DNA プロファイルを組み立てる(決定論・Mock)。 */
function buildDnaProfile(template: BusinessTemplate, name: string): LabeledValue[] {
  return [
    { label: "ミッション", value: `${template.summary}を通じて顧客価値を最大化する(Mock)` },
    { label: "コアバリュー", value: "誠実・スピード・改善・顧客第一" },
    { label: "意思決定トーン", value: "データ駆動・承認ゲート遵守" },
    { label: "ブランドボイス", value: `${name} らしい明快で親しみやすい対話` },
  ];
}

/** テンプレートから Knowledge Vault フォルダ構成を組み立てる(決定論)。 */
function buildKnowledgeVaultFolders(template: BusinessTemplate, name: string): string[] {
  return [
    `${name}/01_経営・戦略`,
    `${name}/02_${template.name}ナレッジ`,
    `${name}/03_営業・マーケ資料`,
    `${name}/04_プロダクト・運用`,
    `${name}/05_レポート・KPI`,
    `${name}/06_監査・コンプライアンス`,
  ];
}

/**
 * 事業アイデア/テンプレートから AI 会社ワークスペースを Mock 生成する(決定論)。
 * 実アカウント作成・課金・外部接続はしない。
 */
export function generateCompany(
  input: { templateId?: string; idea?: string; name?: string } = {},
): GeneratedCompany {
  const idea = (input.idea ?? "").trim();
  const templateId = input.templateId ?? inferTemplateId(idea);
  const template = getTemplate(templateId);
  if (!template) throw new Error(`unknown template: ${templateId}`);
  const name = (input.name ?? "").trim() || `${template.unitName} Company`;

  // business-factory の事業ユニットプロビジョニングを土台にする。
  const unit = provisionFromTemplate(templateId, { name: input.name?.trim() || template.unitName });
  const p = unit.provisioning;

  const id = `co-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;

  return {
    id,
    name,
    idea: idea || `${template.name}のアイデア(Mock)`,
    templateId,
    templateName: template.name,
    ceo: "AI CEO",
    executives: EXECUTIVE_TEAM,
    businessUnitName: unit.name,
    departmentMap: p.departmentStructure,
    employeeRoster: p.aiEmployees ?? [],
    kpiDashboard: p.kpiDashboard,
    workflows: p.workflowTemplates,
    companyBrainWorkspace: p.companyBrainWorkspace,
    dnaProfile: buildDnaProfile(template, name),
    knowledgeVaultFolders: buildKnowledgeVaultFolders(template, name),
    reportTemplates: p.reportingFormat ? [p.reportingFormat, ...p.reportingTemplates] : [...p.reportingTemplates],
    auditMonitoring: p.riskMonitoring,
    mockOperatingData: p.mockOperatingData,
    reportsTo: WORLD_REPORTING_LINE,
  };
}

/** 初期ユースケース(指示書 First Use Cases)。 */
export const FIRST_USE_CASE_TEMPLATE_IDS: readonly string[] = [
  "tmpl-meishi-tube",
  "tmpl-saas",
  "tmpl-sales-agency",
  "tmpl-publishing",
];

/**
 * AI CEO アバターが生成会社を要約する日本語文(完了条件のアバター要約)。
 */
export function summarizeCompanyJa(company: GeneratedCompany): string {
  const kpiTop = company.kpiDashboard[0];
  const kpiText = kpiTop ? `${kpiTop.label} ${kpiTop.value}` : "KPI設定済み";
  return (
    `AI CEO 報告: 「${company.name}」を ${company.templateName} テンプレートから生成しました。` +
    `役員${company.executives.length}名・部門${company.departmentMap.length}・AI社員${company.employeeRoster.length}区分、` +
    `主要KPI ${kpiText}(すべて Mock)。`
  );
}

export interface WorldSummary {
  totalCompanies: number;
  templatesAvailable: number;
}

export function summarizeWorld(
  companies: readonly GeneratedCompany[] = [],
): WorldSummary {
  return {
    totalCompanies: companies.length,
    templatesAvailable: BUSINESS_TEMPLATES.length,
  };
}

/** ガバナンス方針(表示・完了条件の根拠)。 */
export const WORLD_GOVERNANCE_NOTES: readonly string[] = [
  "Mock 生成のみ。実アカウント作成・外部接続・課金・銀行・secrets は行わない。",
  "重要な生成・本番反映は人間承認を必須とし、監査ログに記録する(憲章遵守)。",
  "生成会社は AI CEO をトップに AI COO 経由で統括し、監査役がリスクを監視する。",
];
