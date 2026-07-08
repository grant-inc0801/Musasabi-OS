// Advanced Modules Roadmap(docs/ai-handoff/ADVANCED_MODULES_ROADMAP.md)。
// 次世代モジュール群を「まず Mock パネル / サービススタブ」として提供する。
// 外部本番接続・secrets は扱わない。すべて決定論・Mock。

/** モジュールID(12種)。 */
export type AdvancedModuleId =
  | "musasabi_dna"
  | "company_brain_2"
  | "coo_command_center"
  | "knowledge_quality_score"
  | "decision_support"
  | "sales_coaching"
  | "publishing_studio"
  | "development_review"
  | "executive_secretary"
  | "strategy_office"
  | "business_simulator"
  | "learning_lab";

/** 提供状態: mock=表示パネルあり, stub=サービススタブ。 */
export type ModuleStatus = "mock" | "stub";

export interface ModuleHighlight {
  label: string;
  value: string;
}

/** 1モジュールの記述子。 */
export interface AdvancedModule {
  id: AdvancedModuleId;
  name: string;
  category: string;
  purpose: string;
  status: ModuleStatus;
  /** パネルに表示する Mock ハイライト。 */
  highlights: readonly ModuleHighlight[];
  /** サンプル項目(任意)。 */
  sample?: readonly string[];
}

/** 12モジュールの Mock 定義。 */
export const ADVANCED_MODULES: readonly AdvancedModule[] = [
  {
    id: "musasabi_dna",
    name: "Musasabi DNA",
    category: "経営基盤",
    purpose: "企業のミッション・価値観・行動原則を全AI社員へ継承する遺伝子。",
    status: "mock",
    highlights: [
      { label: "ミッション", value: "AIで働き方を再発明する" },
      { label: "コアバリュー", value: "誠実・挑戦・共創" },
      { label: "行動原則数", value: "7" },
    ],
    sample: ["安全第一・承認優先", "Mockから始めて段階的に本番化", "監査可能な意思決定"],
  },
  {
    id: "company_brain_2",
    name: "Company Brain 2.0",
    category: "ナレッジ",
    purpose: "全社ナレッジを構造化し、部門横断で想起・要約する強化版ブレイン。",
    status: "mock",
    highlights: [
      { label: "インデックス済み", value: "1,284 件" },
      { label: "本日の学習", value: "36 件" },
      { label: "想起精度(Mock)", value: "92%" },
    ],
  },
  {
    id: "coo_command_center",
    name: "COO Command Center",
    category: "オペレーション",
    purpose: "全部門の稼働・ボトルネック・本日の指令を一元管理する運用指令室。",
    status: "mock",
    highlights: [
      { label: "稼働部門", value: "6 / 9" },
      { label: "ボトルネック", value: "承認待ち 2 件" },
      { label: "本日の指令", value: "5 件" },
    ],
  },
  {
    id: "knowledge_quality_score",
    name: "Knowledge Quality Score",
    category: "ナレッジ",
    purpose: "ナレッジの鮮度・参照数・内容量から品質を採点し更新要否を判定する。",
    status: "mock",
    highlights: [
      { label: "平均スコア", value: "74 / 100" },
      { label: "A評価", value: "12 件" },
      { label: "要更新", value: "3 件" },
    ],
  },
  {
    id: "decision_support",
    name: "Decision Support",
    category: "意思決定",
    purpose: "保留中の意思決定に対し、選択肢・根拠・推奨案を提示する(人間承認前提)。",
    status: "mock",
    highlights: [
      { label: "保留中の意思決定", value: "4 件" },
      { label: "推奨案あり", value: "3 件" },
      { label: "承認待ち", value: "2 件" },
    ],
    sample: ["会計本番連携: 承認後に有効化を推奨", "広告費再配分: A案(ROI優先)を推奨"],
  },
  {
    id: "sales_coaching",
    name: "Sales Coaching",
    category: "営業",
    purpose: "改善対象トーク・反論切り返しを練習し、AIコーチがフィードバックする。",
    status: "mock",
    highlights: [
      { label: "改善対象トーク", value: "2 本" },
      { label: "練習セッション", value: "8 回" },
      { label: "平均スコア", value: "78%" },
    ],
  },
  {
    id: "publishing_studio",
    name: "Publishing Studio",
    category: "出版",
    purpose: "企画〜校正〜Kindle/note販売準備を支援する制作スタジオ。",
    status: "mock",
    highlights: [
      { label: "制作中作品", value: "6 作品" },
      { label: "編集長指摘", value: "6 件" },
      { label: "販売準備中", value: "2 作品" },
    ],
  },
  {
    id: "development_review",
    name: "Development Review",
    category: "開発",
    purpose: "PR/変更のレビュー待ち・指摘・品質メトリクスを可視化する。",
    status: "mock",
    highlights: [
      { label: "レビュー待ち", value: "3 件" },
      { label: "指摘", value: "7 件" },
      { label: "テスト通過率", value: "100%" },
    ],
  },
  {
    id: "executive_secretary",
    name: "Executive Secretary",
    category: "経営支援",
    purpose: "役員の予定・承認待ち・リマインドを整理する秘書モジュール。",
    status: "stub",
    highlights: [
      { label: "本日の予定", value: "3 件" },
      { label: "承認待ち", value: "2 件" },
      { label: "リマインド", value: "4 件" },
    ],
  },
  {
    id: "strategy_office",
    name: "Strategy Office",
    category: "戦略",
    purpose: "戦略テーマとOKRの進捗を管理する戦略室。",
    status: "stub",
    highlights: [
      { label: "戦略テーマ", value: "3 件" },
      { label: "OKR進捗", value: "58%" },
      { label: "リスク", value: "中 1 件" },
    ],
  },
  {
    id: "business_simulator",
    name: "Business Simulator",
    category: "分析",
    purpose: "シナリオ別に売上・コストを予測する事業シミュレータ。",
    status: "stub",
    highlights: [
      { label: "シナリオ", value: "3 本" },
      { label: "予測売上(基本)", value: "¥1,450,000" },
      { label: "感度", value: "±12%" },
    ],
  },
  {
    id: "learning_lab",
    name: "Learning Lab",
    category: "学習",
    purpose: "A/Bテストや実験から学習結果を蓄積する学習ラボ。",
    status: "stub",
    highlights: [
      { label: "進行中の実験", value: "2 件" },
      { label: "確定した学習", value: "5 件" },
      { label: "採用率", value: "40%" },
    ],
  },
];

/** ID からモジュールを取得する。 */
export function getModule(
  id: AdvancedModuleId,
  modules: readonly AdvancedModule[] = ADVANCED_MODULES,
): AdvancedModule | undefined {
  return modules.find((m) => m.id === id);
}

export interface ModulesSummary {
  total: number;
  mockPanels: number;
  serviceStubs: number;
  categories: number;
}

/** モジュール群のサマリー(決定論)。 */
export function summarizeModules(modules: readonly AdvancedModule[] = ADVANCED_MODULES): ModulesSummary {
  return {
    total: modules.length,
    mockPanels: modules.filter((m) => m.status === "mock").length,
    serviceStubs: modules.filter((m) => m.status === "stub").length,
    categories: new Set(modules.map((m) => m.category)).size,
  };
}

/** サービススタブの応答(決定論・実処理なし)。 */
export interface StubResponse {
  moduleId: AdvancedModuleId;
  ok: boolean;
  message: string;
}

/**
 * モジュールのサービススタブを実行する(Mock)。実際の処理・外部接続はしない。
 * 未知IDは ok=false。
 */
export function runModuleStub(id: AdvancedModuleId, input = ""): StubResponse {
  const mod = getModule(id);
  if (!mod) {
    return { moduleId: id, ok: false, message: "未知のモジュールです。" };
  }
  return {
    moduleId: id,
    ok: true,
    message: `${mod.name} のスタブを実行しました(Mock・実処理なし)${input ? `: 入力「${input}」` : ""}。`,
  };
}
