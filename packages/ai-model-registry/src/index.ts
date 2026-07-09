// AI モデルレジストリ(AI統合センター内)。docs/ai-handoff/AI_MODEL_REGISTRY_DIRECTIVE.md。
// すべてのAIモデルを一元管理し、選択・ルーティング・比較・アップグレード評価・監査・コスト管理を Mock で提供。
// すべて Mock・決定論。実外部接続・課金なし。APIキーは保持しない(論理参照名のみ・実値は表示/記録しない)。
// 本番接続・実行時 secrets は Production Readiness 承認まで無効(AI Secret Center 経由)。

// ───────────────────────── プロバイダ ─────────────────────────

/** 初期プロバイダ(プラグインで追加可能)。 */
export type Provider =
  | "openai" | "anthropic" | "google" | "microsoft" | "meta"
  | "mistral" | "xai" | "ollama" | "lmstudio";

export const PROVIDER_LABEL: Record<Provider, string> = {
  openai: "OpenAI", anthropic: "Anthropic", google: "Google", microsoft: "Microsoft",
  meta: "Meta", mistral: "Mistral", xai: "xAI", ollama: "Ollama", lmstudio: "LM Studio",
};

/** 表示順(将来プロバイダはプラグインで追記)。 */
export const PROVIDERS: readonly Provider[] = [
  "openai", "anthropic", "google", "microsoft", "meta", "mistral", "xai", "ollama", "lmstudio",
];

// ─────────────────────── 能力スコア(14軸) ───────────────────────

/** モデル能力スコア(0-100)。指示書 Model Capability Scores の14軸。 */
export interface CapabilityScores {
  reasoning: number;
  coding: number;
  japanese: number;
  english: number;
  longContext: number;
  summarization: number;
  research: number;
  imageUnderstanding: number;
  imageGeneration: number;
  voiceSupport: number;
  apiStability: number;
  responseSpeed: number;
  costEfficiency: number;
  internalRecommendation: number;
}

export const CAPABILITY_LABEL_JA: Record<keyof CapabilityScores, string> = {
  reasoning: "推論", coding: "コーディング", japanese: "日本語", english: "英語",
  longContext: "長文脈", summarization: "要約", research: "リサーチ",
  imageUnderstanding: "画像理解", imageGeneration: "画像生成", voiceSupport: "音声対応",
  apiStability: "API安定性", responseSpeed: "応答速度", costEfficiency: "コスト効率",
  internalRecommendation: "社内推奨度",
};

export const CAPABILITY_KEYS = Object.keys(CAPABILITY_LABEL_JA) as Array<keyof CapabilityScores>;

// ───────────────────────── モデル ─────────────────────────

export type ModelStatus = "active" | "preview" | "deprecated";
export const MODEL_STATUS_LABEL_JA: Record<ModelStatus, string> = {
  active: "稼働", preview: "プレビュー", deprecated: "非推奨",
};

export type ApprovalStatus = "mock" | "approved" | "locked";
export const APPROVAL_LABEL_JA: Record<ApprovalStatus, string> = {
  mock: "Mock", approved: "承認済み", locked: "ロック(承認待ち)",
};

/** レジストリの1モデル(指示書 Registry Dashboard の全項目)。 */
export interface AiModel {
  id: string;
  name: string;
  provider: Provider;
  version: string;
  status: ModelStatus;
  /** 主に利用する部署。 */
  department: string;
  /** 担当AI社員。 */
  aiEmployee: string;
  strengths: string;
  /** 平均速度(体感)。 */
  averageSpeed: string;
  /** 推定コスト(表示用の目安)。 */
  estimatedCost: string;
  /** コンテキスト長(トークン)。 */
  contextLength: number;
  /** 総合評価スコア(0-100・能力平均から算出)。 */
  evaluationScore: number;
  lastUpdated: string;
  approvalStatus: ApprovalStatus;
  /** 成功率/失敗率(比較用・Mock)。 */
  successRate: number;
  failureRate: number;
  /**
   * シークレット参照名(論理名のみ)。実際のAPIキーは保持しない。
   * 実行時に AI Secret Center が注入する(値は表示/記録しない)。
   */
  secretRef: string;
  capabilities: CapabilityScores;
}

/** 能力平均から総合評価スコアを算出する(決定論)。 */
export function computeEvaluationScore(caps: CapabilityScores): number {
  const vals = CAPABILITY_KEYS.map((k) => caps[k]);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function model(
  partial: Omit<AiModel, "evaluationScore">,
): AiModel {
  return { ...partial, evaluationScore: computeEvaluationScore(partial.capabilities) };
}

/** AIモデル一覧(Mock・ダミースコア)。 */
export const AI_MODELS: readonly AiModel[] = [
  model({
    id: "anthropic-claude", name: "Claude(汎用)", provider: "anthropic", version: "mock-1", status: "active",
    department: "システム開発部", aiEmployee: "AI PM", strengths: "推論・コーディング・日本語のバランス",
    averageSpeed: "速い", estimatedCost: "中", contextLength: 200000, lastUpdated: "2026-07-01",
    approvalStatus: "mock", successRate: 98, failureRate: 2, secretRef: "secret:anthropic_api_key",
    capabilities: { reasoning: 92, coding: 90, japanese: 88, english: 92, longContext: 90, summarization: 88, research: 86, imageUnderstanding: 80, imageGeneration: 20, voiceSupport: 40, apiStability: 90, responseSpeed: 84, costEfficiency: 74, internalRecommendation: 90 },
  }),
  model({
    id: "openai-gpt", name: "GPT(汎用)", provider: "openai", version: "mock-1", status: "active",
    department: "マーケティング部", aiEmployee: "マーケティングAI", strengths: "生成・画像理解・幅広い対応",
    averageSpeed: "速い", estimatedCost: "中", contextLength: 128000, lastUpdated: "2026-06-28",
    approvalStatus: "mock", successRate: 97, failureRate: 3, secretRef: "secret:openai_api_key",
    capabilities: { reasoning: 88, coding: 86, japanese: 82, english: 92, longContext: 82, summarization: 86, research: 84, imageUnderstanding: 86, imageGeneration: 70, voiceSupport: 70, apiStability: 88, responseSpeed: 86, costEfficiency: 72, internalRecommendation: 82 },
  }),
  model({
    id: "google-gemini", name: "Gemini(汎用)", provider: "google", version: "mock-1", status: "active",
    department: "市場調査部", aiEmployee: "リサーチAI", strengths: "長文脈・リサーチ・マルチモーダル",
    averageSpeed: "普通", estimatedCost: "中", contextLength: 1000000, lastUpdated: "2026-06-20",
    approvalStatus: "mock", successRate: 95, failureRate: 5, secretRef: "secret:google_api_key",
    capabilities: { reasoning: 86, coding: 80, japanese: 80, english: 90, longContext: 96, summarization: 88, research: 90, imageUnderstanding: 84, imageGeneration: 66, voiceSupport: 60, apiStability: 84, responseSpeed: 78, costEfficiency: 76, internalRecommendation: 80 },
  }),
  model({
    id: "mistral-open", name: "Mistral(軽量)", provider: "mistral", version: "mock-1", status: "active",
    department: "サポート部", aiEmployee: "サポートAI", strengths: "低コスト・高速・自ホスト可",
    averageSpeed: "非常に速い", estimatedCost: "低", contextLength: 64000, lastUpdated: "2026-06-10",
    approvalStatus: "mock", successRate: 93, failureRate: 7, secretRef: "secret:mistral_api_key",
    capabilities: { reasoning: 74, coding: 76, japanese: 66, english: 84, longContext: 70, summarization: 78, research: 70, imageUnderstanding: 40, imageGeneration: 10, voiceSupport: 20, apiStability: 80, responseSpeed: 94, costEfficiency: 92, internalRecommendation: 72 },
  }),
  model({
    id: "meta-llama", name: "Llama(オープン)", provider: "meta", version: "mock-1", status: "preview",
    department: "システム開発部", aiEmployee: "AI社員(検証)", strengths: "オープン・オンプレ・カスタム可",
    averageSpeed: "普通", estimatedCost: "低(自ホスト)", contextLength: 128000, lastUpdated: "2026-05-30",
    approvalStatus: "mock", successRate: 90, failureRate: 10, secretRef: "secret:none_selfhosted",
    capabilities: { reasoning: 78, coding: 78, japanese: 64, english: 86, longContext: 78, summarization: 76, research: 72, imageUnderstanding: 50, imageGeneration: 10, voiceSupport: 20, apiStability: 74, responseSpeed: 76, costEfficiency: 88, internalRecommendation: 70 },
  }),
  model({
    id: "xai-grok", name: "Grok(汎用)", provider: "xai", version: "mock-1", status: "preview",
    department: "企画部", aiEmployee: "企画AI", strengths: "最新情報・会話的",
    averageSpeed: "普通", estimatedCost: "中", contextLength: 131072, lastUpdated: "2026-05-15",
    approvalStatus: "mock", successRate: 90, failureRate: 10, secretRef: "secret:xai_api_key",
    capabilities: { reasoning: 82, coding: 78, japanese: 70, english: 88, longContext: 80, summarization: 80, research: 82, imageUnderstanding: 70, imageGeneration: 40, voiceSupport: 30, apiStability: 78, responseSpeed: 80, costEfficiency: 70, internalRecommendation: 72 },
  }),
  model({
    id: "ollama-local", name: "Ollama(ローカル)", provider: "ollama", version: "mock-1", status: "active",
    department: "全社(オフライン)", aiEmployee: "ローカルAI", strengths: "完全ローカル・秘匿・無料",
    averageSpeed: "端末依存", estimatedCost: "無料(ローカル)", contextLength: 32000, lastUpdated: "2026-06-01",
    approvalStatus: "mock", successRate: 88, failureRate: 12, secretRef: "secret:none_local",
    capabilities: { reasoning: 66, coding: 68, japanese: 58, english: 74, longContext: 60, summarization: 66, research: 58, imageUnderstanding: 30, imageGeneration: 5, voiceSupport: 10, apiStability: 70, responseSpeed: 70, costEfficiency: 96, internalRecommendation: 64 },
  }),
];

/** モデルをIDで取得。 */
export function getModel(id: string): AiModel | undefined {
  return AI_MODELS.find((m) => m.id === id);
}

// ───────────────────── AI ルーティング(タスク別推奨) ─────────────────────

export type TaskType =
  | "coding" | "ui_design" | "long_summary" | "market_research"
  | "translation" | "image_generation" | "voice_processing" | "business_planning";

export const TASK_LABEL_JA: Record<TaskType, string> = {
  coding: "コーディング", ui_design: "UIデザイン", long_summary: "長文要約",
  market_research: "市場調査", translation: "翻訳", image_generation: "画像生成",
  voice_processing: "音声処理", business_planning: "事業計画",
};

export const TASK_TYPES = Object.keys(TASK_LABEL_JA) as TaskType[];

/** タスク→重視する能力キーの重み(決定論ルーティングの根拠)。 */
const TASK_WEIGHTS: Record<TaskType, Array<keyof CapabilityScores>> = {
  coding: ["coding", "reasoning", "apiStability"],
  ui_design: ["reasoning", "imageUnderstanding", "english"],
  long_summary: ["longContext", "summarization", "japanese"],
  market_research: ["research", "longContext", "reasoning"],
  translation: ["japanese", "english", "summarization"],
  image_generation: ["imageGeneration", "imageUnderstanding"],
  voice_processing: ["voiceSupport", "responseSpeed", "apiStability"],
  business_planning: ["reasoning", "research", "internalRecommendation"],
};

export interface RoutingResult {
  task: TaskType;
  modelId: string;
  model: AiModel;
  score: number;
  reason: string;
}

/** タスク種別に対する推奨モデルと理由を決定論的に算出する。 */
export function recommendModelForTask(task: TaskType, models: readonly AiModel[] = AI_MODELS): RoutingResult {
  const keys = TASK_WEIGHTS[task];
  const ranked = models
    .filter((m) => m.status !== "deprecated")
    .map((m) => ({ m, score: Math.round(keys.reduce((a, k) => a + m.capabilities[k], 0) / keys.length) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const reasonKeys = keys.map((k) => `${CAPABILITY_LABEL_JA[k]}${best.m.capabilities[k]}`).join("・");
  return {
    task, modelId: best.m.id, model: best.m, score: best.score,
    reason: `${TASK_LABEL_JA[task]}で重視する ${reasonKeys} が最も高いため。`,
  };
}

/** 全タスクの推奨一覧。 */
export function recommendAll(models: readonly AiModel[] = AI_MODELS): RoutingResult[] {
  return TASK_TYPES.map((t) => recommendModelForTask(t, models));
}

// ───────────────────────── モデル比較 ─────────────────────────

export interface ComparisonRow {
  label: string;
  a: string;
  b: string;
}

/** 2モデルを横並び比較(指示書 Model Comparison の項目)。 */
export function compareModels(idA: string, idB: string): ComparisonRow[] {
  const a = getModel(idA);
  const b = getModel(idB);
  if (!a || !b) return [];
  const recA = recommendedUse(a);
  const recB = recommendedUse(b);
  return [
    { label: "コスト", a: a.estimatedCost, b: b.estimatedCost },
    { label: "速度", a: a.averageSpeed, b: b.averageSpeed },
    { label: "精度(総合)", a: `${a.evaluationScore}`, b: `${b.evaluationScore}` },
    { label: "コンテキスト長", a: `${a.contextLength.toLocaleString()}`, b: `${b.contextLength.toLocaleString()}` },
    { label: "成功率", a: `${a.successRate}%`, b: `${b.successRate}%` },
    { label: "失敗率", a: `${a.failureRate}%`, b: `${b.failureRate}%` },
    { label: "推奨用途", a: recA, b: recB },
  ];
}

/** モデルの最高能力軸から推奨用途を導く(決定論)。 */
export function recommendedUse(m: AiModel): string {
  const top = CAPABILITY_KEYS.slice()
    .sort((x, y) => m.capabilities[y] - m.capabilities[x])
    .slice(0, 2)
    .map((k) => CAPABILITY_LABEL_JA[k]);
  return top.join("・");
}

// ─────────────────── AI アップグレードマネージャ ───────────────────

export type AdoptionStatus = "adopt" | "trial" | "hold";
export const ADOPTION_LABEL_JA: Record<AdoptionStatus, string> = {
  adopt: "採用推奨", trial: "試験導入", hold: "保留",
};

/** 新モデル登場時の Mock 評価(AI CEO への承認申請を含む)。 */
export interface UpgradeEvaluation {
  id: string;
  newModel: string;
  baselineModel: string;
  capabilityDiff: string;
  costDiff: string;
  riskNotes: string;
  recommendedAdoption: AdoptionStatus;
  approvalRequest: string;
  /** 実採用は承認までロック。 */
  status: ApprovalStatus;
}

export const UPGRADE_EVALUATIONS: readonly UpgradeEvaluation[] = [
  {
    id: "up-claude-next", newModel: "Claude(次期・Mock)", baselineModel: "Claude(汎用)",
    capabilityDiff: "推論 +4 / 長文脈 +6(Mock想定)", costDiff: "±0(想定)",
    riskNotes: "API仕様変更の可能性。回帰テストが必要。",
    recommendedAdoption: "trial", approvalRequest: "AI CEO へ試験導入の承認を申請(Mock)。", status: "locked",
  },
  {
    id: "up-gemini-long", newModel: "Gemini(長文脈拡張・Mock)", baselineModel: "Gemini(汎用)",
    capabilityDiff: "長文脈 +2 / リサーチ +2(Mock想定)", costDiff: "+小",
    riskNotes: "コスト増の可能性。市場調査タスク限定で評価。",
    recommendedAdoption: "hold", approvalRequest: "コスト影響を精査後に再申請(Mock)。", status: "locked",
  },
];

// ──────────────────── AI 秘書への通知 ────────────────────

export type ModelNotificationType =
  | "new_model" | "recommended_change" | "api_incident" | "deprecated" | "cost_increase" | "usage_limit";

export const NOTIFICATION_LABEL_JA: Record<ModelNotificationType, string> = {
  new_model: "新モデル", recommended_change: "推奨変更", api_incident: "APIインシデント",
  deprecated: "非推奨化", cost_increase: "コスト増", usage_limit: "利用上限警告",
};

export type NotificationPriority = "high" | "medium" | "low";

export interface ModelNotification {
  id: string;
  type: ModelNotificationType;
  modelId: string;
  message: string;
  priority: NotificationPriority;
}

/** AI秘書パネルへ送るモデル通知(Mock)。 */
export const MODEL_NOTIFICATIONS: readonly ModelNotification[] = [
  { id: "nt-new-claude", type: "new_model", modelId: "anthropic-claude", message: "新モデル候補が評価待ちです(Mock)。", priority: "medium" },
  { id: "nt-rec-research", type: "recommended_change", modelId: "google-gemini", message: "市場調査タスクの推奨モデルが更新されました。", priority: "low" },
  { id: "nt-incident-openai", type: "api_incident", modelId: "openai-gpt", message: "APIレイテンシ上昇の兆候(Mock)。監視中。", priority: "high" },
  { id: "nt-cost-xai", type: "cost_increase", modelId: "xai-grok", message: "推定コストが上昇傾向(Mock)。", priority: "medium" },
  { id: "nt-limit-mistral", type: "usage_limit", modelId: "mistral-open", message: "月次利用上限に接近(Mock)。", priority: "medium" },
];

// ─────────────── Company Brain 連携(利用ナレッジ) ───────────────

export interface ModelUsageKnowledge {
  modelId: string;
  strongTasks: readonly string[];
  weakTasks: readonly string[];
  successCases: readonly string[];
  failureCases: readonly string[];
  recommendedPatterns: readonly string[];
}

export const MODEL_USAGE_KNOWLEDGE: readonly ModelUsageKnowledge[] = [
  {
    modelId: "anthropic-claude",
    strongTasks: ["コーディング", "長文要約", "日本語対応"],
    weakTasks: ["画像生成"],
    successCases: ["開発Issueのドラフト生成(Mock)", "議事録要約(Mock)"],
    failureCases: ["画像生成要求で代替提案に切替(Mock)"],
    recommendedPatterns: ["開発・企画の文章タスクはClaudeを既定に"],
  },
  {
    modelId: "google-gemini",
    strongTasks: ["市場調査", "長文脈"],
    weakTasks: ["低コスト用途"],
    successCases: ["競合レポートの一次ドラフト(Mock)"],
    failureCases: ["短文の高速処理はMistralが有利(Mock)"],
    recommendedPatterns: ["超長文脈・調査はGeminiへルーティング"],
  },
];

// ─────────────────────── ガバナンス・ルール ───────────────────────

/** レジストリはAPIキーを保持しない(論理参照名のみ)。 */
export const STORES_API_KEYS = false;
/** 本番接続・実行時secretsは Production Readiness 承認まで無効(AI Secret Center 経由)。 */
export const PRODUCTION_CONNECTIONS_ENABLED = false;

export const SECRET_CENTER_RULES: readonly string[] = [
  "AI Model Registry は API キーを保存しない。",
  "secrets は論理参照名でのみ参照し、実行時に AI Secret Center が注入する。",
  "秘密情報の値は表示・ログ出力しない。",
  "本番接続・実行時secrets・実課金は Production Readiness 承認まで無効。",
];

/** 秘密値らしき文字列が含まれていないか(参照名のみ許可)を検査する(防御的)。 */
export function isSecretReferenceOnly(secretRef: string): boolean {
  // 論理参照名は "secret:" か "secret:none_*" の形式のみ。実キー形式は許可しない。
  if (!/^secret:[a-z0-9_]+$/i.test(secretRef)) return false;
  return !/(sk-|AKIA|ghp_|AIza|-----BEGIN)/.test(secretRef);
}

/** レジストリ要約(アバター/秘書用)。 */
export function summarizeRegistryJa(models: readonly AiModel[] = AI_MODELS): string {
  const active = models.filter((m) => m.status === "active").length;
  const notif = MODEL_NOTIFICATIONS.length;
  return `AIモデルレジストリ: 登録${models.length}(稼働${active})・通知${notif}・本番接続はロック中。`;
}
