// Phase 8: AI Ecosystem(docs/ai-handoff/PHASE8_AI_ECOSYSTEM.md)。
// Musasabi OS を拡張可能にするエコシステム: 各種テンプレート・内部モジュール
// マーケットプレイス・安定拡張API。Mock ファースト・後方互換・外部本番依存なし。

/** テンプレート種別。 */
export type TemplateKind = "department" | "employee" | "workflow";

export const TEMPLATE_KIND_LABEL_JA: Record<TemplateKind, string> = {
  department: "部門テンプレート",
  employee: "AI社員テンプレート",
  workflow: "ワークフローテンプレート",
};

/** テンプレート定義(Mock)。 */
export interface EcosystemTemplate {
  id: string;
  kind: TemplateKind;
  name: string;
  description: string;
  /** インスタンス化時に生成される要素(表示用)。 */
  provides: readonly string[];
}

export const TEMPLATES: readonly EcosystemTemplate[] = [
  {
    id: "tpl-dept-sales",
    kind: "department",
    name: "営業部門テンプレート",
    description: "架電・アポ管理・トークスクリプトを備えた営業部門の雛形。",
    provides: ["営業リスト", "コールトレーニング", "KPIダッシュボード", "AIセールス担当×3"],
  },
  {
    id: "tpl-dept-publishing",
    kind: "department",
    name: "出版部門テンプレート",
    description: "企画〜校正〜販売準備のパイプラインを備えた出版部門の雛形。",
    provides: ["作品パイプライン", "敏腕編集長AI", "クリーン運営チェック"],
  },
  {
    id: "tpl-emp-sales",
    kind: "employee",
    name: "AIセールス担当テンプレート",
    description: "架電・切り返し・アポ獲得を担うAI社員の雛形。",
    provides: ["トークスクリプト", "反論切り返し集", "コールKPI"],
  },
  {
    id: "tpl-emp-editor",
    kind: "employee",
    name: "AI編集者テンプレート",
    description: "原稿改善・構成確認・酷似回避を担うAI社員の雛形。",
    provides: ["原稿指摘", "物語構成チェック", "類似性チェック"],
  },
  {
    id: "tpl-wf-approval",
    kind: "workflow",
    name: "承認ワークフローテンプレート",
    description: "申請→レビュー→承認→実行の標準フロー。",
    provides: ["申請フォーム", "レビューゲート", "承認ログ"],
  },
  {
    id: "tpl-wf-publish",
    kind: "workflow",
    name: "出版ワークフローテンプレート",
    description: "企画→執筆→校正→類似性チェック→販売準備のフロー。",
    provides: ["ステージ管理", "編集長レビュー", "販売導線"],
  },
];

/** 種別でテンプレートを絞り込む。 */
export function templatesOfKind(
  kind: TemplateKind,
  templates: readonly EcosystemTemplate[] = TEMPLATES,
): EcosystemTemplate[] {
  return templates.filter((t) => t.kind === kind);
}

/** テンプレートをインスタンス化する(Mock・実生成なし)。 */
export interface InstantiateResult {
  templateId: string;
  ok: boolean;
  createdName: string;
  message: string;
}

export function instantiateTemplate(
  templateId: string,
  instanceName = "",
  templates: readonly EcosystemTemplate[] = TEMPLATES,
): InstantiateResult {
  const tpl = templates.find((t) => t.id === templateId);
  if (!tpl) {
    return { templateId, ok: false, createdName: "", message: "テンプレートが見つかりません。" };
  }
  const name = instanceName.trim() || `${tpl.name}(コピー)`;
  return {
    templateId,
    ok: true,
    createdName: name,
    message: `「${name}」を Mock 生成しました(${TEMPLATE_KIND_LABEL_JA[tpl.kind]}・実登録なし)。`,
  };
}

// ---- 内部モジュールマーケットプレイス ----

export type MarketplaceStatus = "installed" | "available";

export interface MarketplaceItem {
  id: string;
  name: string;
  category: string;
  status: MarketplaceStatus;
  description: string;
}

export const MARKETPLACE_ITEMS: readonly MarketplaceItem[] = [
  { id: "mk-accounting", name: "会計ウィジェット", category: "管理", status: "installed", description: "仕訳・収支のMockウィジェット。" },
  { id: "mk-sales-coach", name: "営業コーチング", category: "営業", status: "installed", description: "トーク改善のコーチングモジュール。" },
  { id: "mk-publishing-studio", name: "出版スタジオ", category: "出版", status: "installed", description: "作品制作支援。" },
  { id: "mk-decision", name: "意思決定支援", category: "経営", status: "available", description: "選択肢・根拠・推奨を提示。" },
  { id: "mk-simulator", name: "事業シミュレータ", category: "分析", status: "available", description: "シナリオ別予測。" },
  { id: "mk-learning-lab", name: "学習ラボ", category: "学習", status: "available", description: "A/Bテストと学習蓄積。" },
];

/** 拡張API(安定版)のバージョン情報。後方互換を宣言する。 */
export interface ExtensionApi {
  name: string;
  version: string;
  stable: boolean;
  backwardCompatible: boolean;
}

export const EXTENSION_APIS: readonly ExtensionApi[] = [
  { name: "Plugin SDK", version: "1.0", stable: true, backwardCompatible: true },
  { name: "Template API", version: "1.0", stable: true, backwardCompatible: true },
  { name: "Marketplace API", version: "0.1", stable: false, backwardCompatible: true },
];

export interface EcosystemSummary {
  templates: number;
  departmentTemplates: number;
  employeeTemplates: number;
  workflowTemplates: number;
  installedModules: number;
  availableModules: number;
  stableApis: number;
}

export function summarizeEcosystem(): EcosystemSummary {
  return {
    templates: TEMPLATES.length,
    departmentTemplates: templatesOfKind("department").length,
    employeeTemplates: templatesOfKind("employee").length,
    workflowTemplates: templatesOfKind("workflow").length,
    installedModules: MARKETPLACE_ITEMS.filter((m) => m.status === "installed").length,
    availableModules: MARKETPLACE_ITEMS.filter((m) => m.status === "available").length,
    stableApis: EXTENSION_APIS.filter((a) => a.stable).length,
  };
}
