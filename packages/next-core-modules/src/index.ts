// Musasabi Next Core Modules(docs/ai-handoff/MUSASABI_NEXT_CORE_MODULES.md / D-20260709-002)。
// AIカンパニーOSを強化する次のコアモジュール12種を Mock サービス/UIパネルとして提供する。
// 既存アーキテクチャを拡張、desktop安定、外部本番接続なし、secretsなし。ガバナンス/監査を尊重。

/** モジュールID(優先順)。 */
export type NextModuleId =
  | "ai_constitution"
  | "mission_control"
  | "situation_room"
  | "digital_twin"
  | "relationship_graph"
  | "memory_engine"
  | "customer_brain"
  | "quality_assurance"
  | "security_center"
  | "cost_optimizer"
  | "competitor_center"
  | "innovation_lab";

export type ModuleForm = "mock" | "service";

export interface ModuleHighlight {
  label: string;
  value: string;
}

export interface NextCoreModule {
  id: NextModuleId;
  /** 優先順位(1-12)。 */
  priority: number;
  name: string;
  purpose: string;
  form: ModuleForm;
  highlights: readonly ModuleHighlight[];
  /** アバター要約に使う短い状態(重要モジュールのみ)。 */
  keyStatus?: string;
}

export const NEXT_CORE_MODULES: readonly NextCoreModule[] = [
  {
    id: "ai_constitution",
    priority: 1,
    name: "AI Constitution",
    purpose: "最上位の運用原則。変更は人間承認必須で、CEO・役員・部門・AI社員が参照する。",
    form: "mock",
    highlights: [
      { label: "原則数", value: "5" },
      { label: "変更承認", value: "人間必須" },
      { label: "参照者", value: "全AI社員" },
    ],
  },
  {
    id: "mission_control",
    priority: 2,
    name: "AI Mission Control",
    purpose: "AI CEOの指令画面。全社状態・役員・部門・優先順位・承認を表示する。",
    form: "mock",
    highlights: [
      { label: "稼働部門", value: "6 / 9" },
      { label: "承認待ち", value: "3 件" },
      { label: "本日の優先", value: "5 件" },
    ],
    keyStatus: "承認待ち3件",
  },
  {
    id: "situation_room",
    priority: 3,
    name: "AI Situation Room",
    purpose: "リアルタイム運用ビュー。KPI・タスク・アラート・保留・役員メッセージを表示。",
    form: "mock",
    highlights: [
      { label: "アラート", value: "2 件" },
      { label: "保留", value: "4 件" },
      { label: "役員メッセージ", value: "3 件" },
    ],
    keyStatus: "アラート2件",
  },
  {
    id: "digital_twin",
    priority: 4,
    name: "AI Digital Twin",
    purpose: "会社のMockシミュレーション。リソース・予算・部門変更の影響を推定する。",
    form: "service",
    highlights: [
      { label: "シナリオ", value: "3 本" },
      { label: "推定売上変化", value: "+8%" },
      { label: "感度", value: "±10%" },
    ],
  },
  {
    id: "relationship_graph",
    priority: 5,
    name: "AI Relationship Graph",
    purpose: "人・部門・案件・顧客・文書・Issue・ワークフローを関係づけるグラフ。",
    form: "mock",
    highlights: [
      { label: "ノード", value: "128" },
      { label: "エッジ", value: "342" },
      { label: "中心性トップ", value: "営業部門" },
    ],
  },
  {
    id: "memory_engine",
    priority: 6,
    name: "AI Memory Engine",
    purpose: "AI社員の経験・教訓・成功事例・改善履歴を蓄積する。",
    form: "service",
    highlights: [
      { label: "教訓", value: "42 件" },
      { label: "成功事例", value: "18 件" },
      { label: "改善履歴", value: "63 件" },
    ],
  },
  {
    id: "customer_brain",
    priority: 7,
    name: "AI Customer Brain",
    purpose: "営業・サポート向けの顧客ナレッジ層(Mock顧客データ)。",
    form: "mock",
    highlights: [
      { label: "顧客", value: "56 社" },
      { label: "重要顧客", value: "8 社" },
      { label: "要フォロー", value: "5 社" },
    ],
    keyStatus: "要フォロー5社",
  },
  {
    id: "quality_assurance",
    priority: 8,
    name: "AI Quality Assurance",
    purpose: "UI・テスト・ドキュメント・ワークフローの部門横断品質チェック。",
    form: "service",
    highlights: [
      { label: "チェック項目", value: "24" },
      { label: "合格", value: "21" },
      { label: "要対応", value: "3" },
    ],
    keyStatus: "品質要対応3件",
  },
  {
    id: "security_center",
    priority: 9,
    name: "AI Security Center",
    purpose: "権限・secret取扱いポリシー・アクセスレビュー・コネクタ安全性の総覧。",
    form: "mock",
    highlights: [
      { label: "ポリシー遵守", value: "100%" },
      { label: "secret保存", value: "なし" },
      { label: "本番コネクタ", value: "0(承認待ち)" },
    ],
    keyStatus: "セキュリティ正常",
  },
  {
    id: "cost_optimizer",
    priority: 10,
    name: "AI Cost Optimizer",
    purpose: "モデル利用・API利用・計算コストを追跡し、節約案を推奨する。",
    form: "service",
    highlights: [
      { label: "今月コスト(Mock)", value: "¥180,000" },
      { label: "節約候補", value: "3 件" },
      { label: "想定削減", value: "¥42,000" },
    ],
    keyStatus: "節約候補3件",
  },
  {
    id: "competitor_center",
    priority: 11,
    name: "AI Competitor Center",
    purpose: "競合・差別化・強み・弱みを追跡する。",
    form: "mock",
    highlights: [
      { label: "追跡競合", value: "5 社" },
      { label: "差別化ポイント", value: "4" },
      { label: "注視", value: "1 社" },
    ],
  },
  {
    id: "innovation_lab",
    priority: 12,
    name: "AI Innovation Lab",
    purpose: "新サービス案・改善案・実験提案を生成する。",
    form: "service",
    highlights: [
      { label: "新サービス案", value: "6 件" },
      { label: "改善案", value: "9 件" },
      { label: "実験提案", value: "3 件" },
    ],
  },
];

/** ID からモジュールを取得する。 */
export function getNextModule(
  id: NextModuleId,
  modules: readonly NextCoreModule[] = NEXT_CORE_MODULES,
): NextCoreModule | undefined {
  return modules.find((m) => m.id === id);
}

export interface NextModulesSummary {
  total: number;
  mockPanels: number;
  services: number;
}

export function summarizeNextModules(
  modules: readonly NextCoreModule[] = NEXT_CORE_MODULES,
): NextModulesSummary {
  return {
    total: modules.length,
    mockPanels: modules.filter((m) => m.form === "mock").length,
    services: modules.filter((m) => m.form === "service").length,
  };
}

/**
 * AIアバターが要約する主要モジュール状態(keyStatus を持つモジュールのみ)。
 * 完了条件「AI avatar can summarize key module status」を満たす。
 */
export function buildNextModulesSummaryJa(
  modules: readonly NextCoreModule[] = NEXT_CORE_MODULES,
): string[] {
  const keyed = modules.filter((m) => m.keyStatus);
  if (keyed.length === 0) return [];
  return [`コアモジュール状況: ${keyed.map((m) => m.keyStatus).join("・")}。`];
}

/** サービス型モジュールのスタブ実行(Mock・実処理なし)。 */
export interface ModuleServiceResult {
  moduleId: NextModuleId;
  ok: boolean;
  message: string;
}

export function runModuleService(id: NextModuleId, input = ""): ModuleServiceResult {
  const mod = getNextModule(id);
  if (!mod) return { moduleId: id, ok: false, message: "未知のモジュールです。" };
  return {
    moduleId: id,
    ok: true,
    message: `${mod.name} を実行しました(Mock・実処理/外部接続なし)${input ? `: 「${input}」` : ""}。`,
  };
}
