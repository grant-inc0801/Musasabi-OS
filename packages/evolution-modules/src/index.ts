// Musasabi Evolution Modules(docs/ai-handoff/MUSASABI_EVOLUTION_MODULES_DIRECTIVE.md)。
// 次世代の内部オペレーティングモジュール12種を Mock サービス/UIパネルとして提供する。
// Company Brain・Musasabi DNA・ガバナンス・監査・経営ダッシュボードと統合する(Mock)。
// すべて Mock・決定論。実外部本番接続・secrets なし。

/** モジュールID(指示書の並び順)。 */
export type EvolutionModuleId =
  | "operating_manual"
  | "skill_marketplace"
  | "sandbox"
  | "incident_center"
  | "meeting_room"
  | "simulation_engine"
  | "recruiting"
  | "upgrade_manager"
  | "health_center"
  | "memory_timeline"
  | "command_console"
  | "builder_department";

export type ModuleForm = "mock" | "service";

export interface ModuleHighlight {
  label: string;
  value: string;
}

/** 既存アーキテクチャとの統合ポイント(表示・トレーサビリティ用)。 */
export type IntegrationPoint =
  | "Company Brain"
  | "Musasabi DNA"
  | "ガバナンス"
  | "監査"
  | "経営ダッシュボード";

export interface EvolutionModule {
  id: EvolutionModuleId;
  /** 表示順(1-12)。 */
  order: number;
  name: string;
  /** 日本語名。 */
  nameJa: string;
  purpose: string;
  form: ModuleForm;
  highlights: readonly ModuleHighlight[];
  integrations: readonly IntegrationPoint[];
  /** アバター要約に使う短い状態(主要モジュールのみ)。 */
  keyStatus?: string;
}

export const EVOLUTION_MODULES: readonly EvolutionModule[] = [
  {
    id: "operating_manual",
    order: 1,
    name: "AI Operating Manual",
    nameJa: "AIオペレーティングマニュアル",
    purpose: "部門の運用マニュアルを自動生成・維持する。手順・責任・KPI・エスカレーションを標準化。",
    form: "service",
    highlights: [
      { label: "生成マニュアル", value: "9 部門" },
      { label: "最終更新", value: "自動同期" },
      { label: "レビュー", value: "承認必須" },
    ],
    integrations: ["Company Brain", "ガバナンス"],
  },
  {
    id: "skill_marketplace",
    order: 2,
    name: "AI Skill Marketplace",
    nameJa: "AIスキルマーケットプレイス",
    purpose: "再利用可能なAIスキルを部門横断で共有する。内部限定・審査付き(Mock)。",
    form: "mock",
    highlights: [
      { label: "公開スキル", value: "24 件" },
      { label: "導入部門", value: "6 / 9" },
      { label: "審査待ち", value: "3 件" },
    ],
    integrations: ["Company Brain", "Musasabi DNA"],
    keyStatus: "スキル審査待ち3件",
  },
  {
    id: "sandbox",
    order: 3,
    name: "AI Sandbox",
    nameJa: "AIサンドボックス",
    purpose: "新機能・新部門・新AI社員を隔離環境で試験する。本番へは承認後のみ反映(Mock)。",
    form: "service",
    highlights: [
      { label: "実行中の実験", value: "4 件" },
      { label: "隔離レベル", value: "完全分離" },
      { label: "本番反映", value: "承認ゲート" },
    ],
    integrations: ["ガバナンス", "監査"],
  },
  {
    id: "incident_center",
    order: 4,
    name: "AI Incident Center",
    nameJa: "AIインシデントセンター",
    purpose: "インシデント検知・復旧計画・事後レビューを一元管理する(Mock)。",
    form: "service",
    highlights: [
      { label: "オープン", value: "1 件" },
      { label: "復旧計画", value: "自動起票" },
      { label: "ポストモーテム", value: "2 件完了" },
    ],
    integrations: ["監査", "経営ダッシュボード"],
    keyStatus: "インシデント1件対応中",
  },
  {
    id: "meeting_room",
    order: 5,
    name: "AI Meeting Room",
    nameJa: "AIミーティングルーム",
    purpose: "定例役員会議の要約とアクション追跡を行う(Mock)。",
    form: "service",
    highlights: [
      { label: "次回会議", value: "本日 16:00" },
      { label: "未完アクション", value: "5 件" },
      { label: "要約", value: "自動生成" },
    ],
    integrations: ["経営ダッシュボード", "Company Brain"],
  },
  {
    id: "simulation_engine",
    order: 6,
    name: "AI Simulation Engine",
    nameJa: "AIシミュレーションエンジン",
    purpose: "組織変更・KPI変動をシミュレートし、影響を予測する(決定論・Mock)。",
    form: "service",
    highlights: [
      { label: "シナリオ", value: "3 本保存" },
      { label: "予測期間", value: "3〜12ヶ月" },
      { label: "感度分析", value: "対応" },
    ],
    integrations: ["経営ダッシュボード", "Musasabi DNA"],
  },
  {
    id: "recruiting",
    order: 7,
    name: "AI Recruiting",
    nameJa: "AIリクルーティング",
    purpose: "AI社員の新規作成・再配置を推奨する。実作成は承認後(Mock・ドラフト)。",
    form: "mock",
    highlights: [
      { label: "新設提案", value: "2 名" },
      { label: "再配置提案", value: "3 名" },
      { label: "承認", value: "人間必須" },
    ],
    integrations: ["ガバナンス", "Company Brain"],
  },
  {
    id: "upgrade_manager",
    order: 8,
    name: "AI Upgrade Manager",
    nameJa: "AIアップグレードマネージャ",
    purpose: "新しいAIモデルバージョンを採用前に評価する(Mock・自動採用なし)。",
    form: "service",
    highlights: [
      { label: "評価中バージョン", value: "1 件" },
      { label: "回帰テスト", value: "自動" },
      { label: "採用判断", value: "承認必須" },
    ],
    integrations: ["ガバナンス", "監査"],
  },
  {
    id: "health_center",
    order: 9,
    name: "AI Health Center",
    nameJa: "AIヘルスセンター",
    purpose: "AI社員の稼働健全性を監視し、メンテナンスを推奨する(Mock)。",
    form: "service",
    highlights: [
      { label: "健全", value: "22 / 26" },
      { label: "要注意", value: "3 名" },
      { label: "要メンテ", value: "1 名" },
    ],
    integrations: ["監査", "経営ダッシュボード"],
    keyStatus: "AI社員 要メンテ1名",
  },
  {
    id: "memory_timeline",
    order: 10,
    name: "AI Memory Timeline",
    nameJa: "AIメモリタイムライン",
    purpose: "組織の履歴を検索可能なタイムラインとして保持する(Mock)。",
    form: "mock",
    highlights: [
      { label: "記録イベント", value: "1,284 件" },
      { label: "検索", value: "全文対応" },
      { label: "保持", value: "監査準拠" },
    ],
    integrations: ["Company Brain", "監査"],
  },
  {
    id: "command_console",
    order: 11,
    name: "AI Command Console",
    nameJa: "AIコマンドコンソール",
    purpose: "自然言語で運用コマンドを受け付ける(Mock・実処理/破壊的操作なし)。",
    form: "service",
    highlights: [
      { label: "対応コマンド", value: "運用系" },
      { label: "破壊的操作", value: "禁止" },
      { label: "監査ログ", value: "全件記録" },
    ],
    integrations: ["ガバナンス", "監査"],
  },
  {
    id: "builder_department",
    order: 12,
    name: "AI Builder Department (Musasabi Evolution Lab)",
    nameJa: "AIビルダー部門(Musasabi Evolution Lab)",
    purpose: "Musasabi OS 自体の改善を設計・提案する。重要変更は人間承認(Mock・ドラフト)。",
    form: "mock",
    highlights: [
      { label: "改善提案", value: "7 件" },
      { label: "設計ドラフト", value: "3 件" },
      { label: "本番反映", value: "承認必須" },
    ],
    integrations: ["Musasabi DNA", "ガバナンス"],
    keyStatus: "OS改善提案7件",
  },
];

/** ID からモジュールを取得する。 */
export function getEvolutionModule(
  id: EvolutionModuleId,
  modules: readonly EvolutionModule[] = EVOLUTION_MODULES,
): EvolutionModule | undefined {
  return modules.find((m) => m.id === id);
}

export interface EvolutionModulesSummary {
  total: number;
  mockPanels: number;
  services: number;
  integrationPoints: number;
}

export function summarizeEvolutionModules(
  modules: readonly EvolutionModule[] = EVOLUTION_MODULES,
): EvolutionModulesSummary {
  const points = new Set<IntegrationPoint>();
  for (const m of modules) for (const p of m.integrations) points.add(p);
  return {
    total: modules.length,
    mockPanels: modules.filter((m) => m.form === "mock").length,
    services: modules.filter((m) => m.form === "service").length,
    integrationPoints: points.size,
  };
}

/**
 * AIアバターが要約する主要モジュール状態(keyStatus を持つモジュールのみ)。
 * 完了条件のダッシュボード連携(アバター要約)を満たす。
 */
export function buildEvolutionSummaryJa(
  modules: readonly EvolutionModule[] = EVOLUTION_MODULES,
): string[] {
  const keyed = modules.filter((m) => m.keyStatus);
  if (keyed.length === 0) return [];
  return [`進化モジュール状況: ${keyed.map((m) => m.keyStatus).join("・")}。`];
}

/** サービス型モジュールのスタブ実行(Mock・実処理/外部接続なし)。 */
export interface ModuleServiceResult {
  moduleId: EvolutionModuleId;
  ok: boolean;
  message: string;
}

export function runEvolutionService(id: EvolutionModuleId, input = ""): ModuleServiceResult {
  const mod = getEvolutionModule(id);
  if (!mod) return { moduleId: id, ok: false, message: "未知のモジュールです。" };
  return {
    moduleId: id,
    ok: true,
    message: `${mod.nameJa} を実行しました(Mock・実処理/外部接続なし)${input ? `: 「${input}」` : ""}。`,
  };
}

/** ガバナンス方針(表示・完了条件の統合根拠)。 */
export const EVOLUTION_GOVERNANCE_NOTES: readonly string[] = [
  "すべて Mock・決定論。実外部本番接続・secrets・実データ書き込みなし。",
  "重要変更・新設・再配置・本番反映は人間承認を必須とする(憲章遵守)。",
  "全操作は監査ログに記録し、AI COO 経由で AI CEO へレポートする。",
];
