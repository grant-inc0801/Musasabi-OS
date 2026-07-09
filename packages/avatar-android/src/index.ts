// Musasabi Android アバター制作仕様(指示書 完全版)。
// モノアイ発光カラー・制御パラメータ・ライトアニメーション・3Dモデル制作仕様・カラーパレット・
// モーションカタログ・Tripo3D 連携フロー(Mock)を宣言的に定義する。
//
// 重要: 実モデル生成(Tripo3D API)は APIキー + 人間承認が必要なため本モジュールでは実行しない。
// 本モジュールは「決定論的なプロンプト/リクエスト・ペイロードの生成」と「仕様の可視化」のみを担う。
// 実際の外部接続・課金は承認まで一切行わない(TRIPO_GENERATION_LOCKED=true)。

/** 感情ステート(モノアイ発光の8種)。 */
export type AndroidEmotion =
  | "neutral"
  | "happy"
  | "thinking"
  | "working"
  | "surprised"
  | "worried"
  | "sleepy"
  | "error";

/** ライトアニメーションのモード。 */
export type LightAnimation = "steady" | "slow_blink" | "scan" | "blink";

export const LIGHT_ANIMATION_LABEL_JA: Record<LightAnimation, string> = {
  steady: "点灯(一定)",
  slow_blink: "ゆっくり点滅",
  scan: "スキャン(左右に流れる)",
  blink: "点滅",
};

/** 1つのモノアイ感情ステートの定義。 */
export interface MonoEyeState {
  id: AndroidEmotion;
  labelJa: string;
  labelEn: string;
  /** モノアイ発光カラー(HEX)。 */
  eyeColor: string;
  /** ライトアニメーション。 */
  light: LightAnimation;
  /** 対応するモーションキー(avatar-2d 感情ステートと整合)。 */
  motion: string;
  /** 再生時間(ms)。null はループ(明示遷移まで継続)。 */
  duration: number | null;
  /** 完了後に自動で通常へ戻るか。 */
  autoReturn: boolean;
  /** 動作の説明(表情+モーション)。 */
  note: string;
}

/** モノアイ発光カラー一覧(指示書「感情ごとのライトカラー」)。 */
export const MONO_EYE_STATES: readonly MonoEyeState[] = [
  { id: "neutral",   labelJa: "通常",    labelEn: "neutral",   eyeColor: "#00E0FF", light: "slow_blink", motion: "idle_float",            duration: null, autoReturn: false, note: "ゆっくり上下に浮遊しながら待機。" },
  { id: "happy",     labelJa: "喜び",    labelEn: "happy",     eyeColor: "#00FF7F", light: "steady",     motion: "jump_light",            duration: 1800, autoReturn: true,  note: "両手を上げて軽くジャンプ、尻尾を振る。" },
  { id: "thinking",  labelJa: "考え中",  labelEn: "thinking",  eyeColor: "#FFD700", light: "scan",       motion: "head_tilt",             duration: 3500, autoReturn: true,  note: "首をかしげて片手を頭に触れる。" },
  { id: "working",   labelJa: "作業中",  labelEn: "working",   eyeColor: "#00BFFF", light: "scan",       motion: "typing_or_processing",  duration: null, autoReturn: false, note: "ホログラム操作しながら集中(手を動かす)。" },
  { id: "surprised", labelJa: "驚き",    labelEn: "surprised", eyeColor: "#FF00FF", light: "blink",      motion: "quick_pop",             duration: 1200, autoReturn: true,  note: "体をピクッと反らせてビックリ。" },
  { id: "worried",   labelJa: "困り",    labelEn: "worried",   eyeColor: "#FF9800", light: "steady",     motion: "shrink",                duration: 2000, autoReturn: true,  note: "耳を少し倒し肩を落として困った表情。" },
  { id: "sleepy",    labelJa: "眠い",    labelEn: "sleepy",    eyeColor: "#9B59B6", light: "slow_blink", motion: "sway_slow",             duration: null, autoReturn: false, note: "目のライトを暗く、ゆっくり揺れてうとうと。" },
  { id: "error",     labelJa: "エラー",  labelEn: "error",     eyeColor: "#FF3B30", light: "blink",      motion: "shake_small",           duration: 1500, autoReturn: true,  note: "ライトが赤点滅、小刻みに震えて警告表示。" },
];

/** 通常(idle)ステート。autoReturn の戻り先。 */
export const DEFAULT_EMOTION: AndroidEmotion = "neutral";

/** モノアイ制御パラメータ(指示書「モノアイ制御パラメータ」)。 */
export interface MonoEyeControls {
  /** 発光カラー(HEX)。 */
  color: string;
  /** 明るさ(0-100)。 */
  brightness: number;
  /** 点滅の強さ(0-100、0=点滅なし)。 */
  blink: number;
  /** スキャン(左右に流れる発光)ON/OFF。 */
  scan: boolean;
}

/** 感情ステート → モノアイ制御パラメータの既定値を導出する(決定論)。 */
export function controlsForEmotion(id: AndroidEmotion): MonoEyeControls {
  const s = resolveMonoEye(id);
  return {
    color: s.eyeColor,
    brightness: id === "sleepy" ? 35 : id === "error" ? 100 : 80,
    blink: s.light === "blink" ? 90 : s.light === "slow_blink" ? 30 : 0,
    scan: s.light === "scan",
  };
}

/** Emotion State オブジェクト(指示書のモーション制御 JSON 例と同形)。 */
export interface EmotionStatePayload {
  state: AndroidEmotion;
  eyeColor: string;
  motion: string;
  duration: number | null;
  expression: string;
  autoReturn: boolean;
}

/** 感情ステートから Emotion State ペイロード(モーション制御用)を生成する。 */
export function emotionStatePayload(id: AndroidEmotion): EmotionStatePayload {
  const s = resolveMonoEye(id);
  return {
    state: s.id,
    eyeColor: s.eyeColor,
    motion: `${s.motion}.glb`,
    duration: s.duration,
    expression: s.labelEn,
    autoReturn: s.autoReturn,
  };
}

/** ID からモノアイ感情ステートを取得する(未知は通常にフォールバック)。 */
export function resolveMonoEye(id: AndroidEmotion): MonoEyeState {
  return MONO_EYE_STATES.find((s) => s.id === id) ?? MONO_EYE_STATES[0];
}

/** 感情名が有効なステートか判定する。 */
export function isAndroidEmotion(value: string): value is AndroidEmotion {
  return MONO_EYE_STATES.some((s) => s.id === value);
}

// --- モーションカタログ -------------------------------------------------------

export interface MotionClip {
  id: string;
  labelJa: string;
  category: "emotion" | "variation" | "idle";
  note: string;
}

/** モーション一式(感情+バリエーション+待機)。 */
export const MOTION_CATALOG: readonly MotionClip[] = [
  { id: "idle_float",           labelJa: "通常(待機)",   category: "idle",      note: "ゆっくり上下に浮遊。" },
  { id: "head_tilt",            labelJa: "考え中",       category: "emotion",   note: "首をかしげる。" },
  { id: "jump_light",           labelJa: "喜び",         category: "emotion",   note: "軽くジャンプ。" },
  { id: "typing_or_processing", labelJa: "作業中",       category: "emotion",   note: "ホログラム操作。" },
  { id: "quick_pop",            labelJa: "驚き",         category: "emotion",   note: "ピクッと反る。" },
  { id: "shrink",               labelJa: "困り",         category: "emotion",   note: "肩を落とす。" },
  { id: "sway_slow",            labelJa: "眠い",         category: "emotion",   note: "ゆっくり揺れる。" },
  { id: "shake_small",          labelJa: "エラー",       category: "emotion",   note: "小刻みに震える。" },
  { id: "walk",                 labelJa: "歩く",         category: "variation", note: "歩行。" },
  { id: "run",                  labelJa: "走る",         category: "variation", note: "走行。" },
  { id: "jump",                 labelJa: "ジャンプ",     category: "variation", note: "跳躍。" },
  { id: "twist_back",           labelJa: "抱き返し",     category: "variation", note: "振り返る。" },
  { id: "ok_sign",              labelJa: "OKサイン",     category: "variation", note: "OKポーズ。" },
  { id: "cheer",                labelJa: "応援/カッツ",  category: "variation", note: "応援ポーズ。" },
  { id: "bow",                  labelJa: "お辞儀",       category: "variation", note: "お辞儀。" },
  { id: "fall",                 labelJa: "転ぶ",         category: "variation", note: "転倒。" },
];

// --- 3Dモデル制作仕様 ---------------------------------------------------------

export interface ModelSpecItem {
  key: string;
  labelJa: string;
  value: string;
}

/** 3Dモデル制作仕様(指示書「3Dモデル制作仕様(必須)」)。 */
export const MODEL_SPEC: readonly ModelSpecItem[] = [
  { key: "format",     labelJa: "出力形式",   value: "GLB(推奨)/ FBX / VRM いずれも対応" },
  { key: "polygons",   labelJa: "ポリゴン数", value: "約60,000(120,000ポリゴン以内。高精細だが軽量)" },
  { key: "texture",    labelJa: "テクスチャ", value: "PBR(Metallic/Roughness)4Kまで対応" },
  { key: "rig",        labelJa: "リグ(ボーン)", value: "フルリグ(頭/耳/尻尾/脚/腕/ゼンマイ可動)" },
  { key: "expression", labelJa: "表情制御",   value: "モノアイの明るさ/点滅/スキャン対応" },
  { key: "animation",  labelJa: "アニメーション", value: "基本動作一式+感情モーション+待機モーション" },
  { key: "material",   labelJa: "材質",       value: "金属=ガンメタ(つや消し+機械傷/使用感)、毛=高品質ファー、ライト=ネオン系発光" },
];

// --- カラーパレット -----------------------------------------------------------

export interface PaletteColor {
  key: string;
  labelJa: string;
  hex: string;
}

/** カラー参照(指示書「カラー参照」)。 */
export const COLOR_PALETTE: readonly PaletteColor[] = [
  { key: "metal-main",  labelJa: "メイン金属",           hex: "#2B2F34" },
  { key: "metal-sub",   labelJa: "サブ金属",             hex: "#6B6F74" },
  { key: "accent",      labelJa: "アクセント(ライト通常)", hex: "#00BFFF" },
  { key: "neutral",     labelJa: "通常",                 hex: "#00E0FF" },
  { key: "happy",       labelJa: "喜び(緑)",           hex: "#00FF7F" },
  { key: "thinking",    labelJa: "考え中(黄)",         hex: "#FFD700" },
  { key: "surprised",   labelJa: "驚き",                 hex: "#FF00FF" },
  { key: "worried",     labelJa: "困り(橙)",           hex: "#FF9800" },
  { key: "sleepy",      labelJa: "眠い(紫)",           hex: "#9B59B6" },
  { key: "error",       labelJa: "エラー(赤)",         hex: "#FF3B30" },
];

// --- Tripo3D 連携フロー(Mock・実生成はロック) --------------------------------

/**
 * 実モデル生成はロック(APIキー+人間承認が必要)。true の間は buildTripoRequest の
 * 結果を「テンプレート(未実行)」として扱い、外部接続・課金は一切行わない。
 */
export const TRIPO_GENERATION_LOCKED = true;

export interface FlowStep {
  id: string;
  labelJa: string;
  tool: string;
  /** APIキー・承認が必要なため未実行のステップか。 */
  gated: boolean;
  note: string;
}

/** Tripo3D 連携フロー(指示書「Tripo3D API 連携フロー」)。 */
export const TRIPO_FLOW: readonly FlowStep[] = [
  { id: "prompt",    labelJa: "プロンプト生成",   tool: "Claude Code",       gated: false, note: "生成プロンプトを決定論的に組み立てる(Mock)。" },
  { id: "generate",  labelJa: "モデル生成",       tool: "Tripo3D API",       gated: true,  note: "text-to-model。APIキー+人間承認が必要なため未実行。" },
  { id: "export",    labelJa: "3Dモデル生成",     tool: "GLB/FBX",           gated: true,  note: "生成物の受領。承認後にのみ実行。" },
  { id: "optimize",  labelJa: "アバター最適化",   tool: "Blender(自動処理)", gated: true,  note: "ポリゴン最適化・リグ調整。承認後にのみ実行。" },
  { id: "implement", labelJa: "アバター実装",     tool: "Three.js / Tauri",  gated: false, note: "既存のレンダラーへ組み込み(仕様は本モジュールで確定済み)。" },
];

/** Tripo3D 生成プロンプトのオプション。 */
export interface TripoPromptOptions {
  /** アシスタント名(既定: Musasabi Android)。 */
  name?: string;
}

/** Tripo3D 用の生成プロンプトを決定論的に組み立てる(指示書テンプレート準拠)。 */
export function buildTripoPrompt(options: TripoPromptOptions = {}): string {
  const name = options.name ?? "Musasabi Android";
  return [
    `A highly detailed 3D character of a robotic flying squirrel (musasabi) as an AI assistant mascot named ${name}. Full body, cute and realistic, android style. Key features:`,
    "- Gray and white fur, fluffy tail with metal segmented base",
    "- Full metal armor body (dark gunmetal), rivets and screws",
    "- Horizontal mono-eye visor across eyes with glowing light",
    "- Wind-up key on the back",
    "- Cute chubby body, short limbs, high detail mechanical joints",
    "- Sci-fi android design, high quality PBR textures",
    "- Clean topology, riggable, game/animation ready",
    "- Render with high quality, studio lighting, full body",
  ].join("\n");
}

/**
 * Tripo3D API リクエストのペイロード・テンプレートを組み立てる(未実行・決定論)。
 * apiKey は含めない(参照名のみ)。TRIPO_GENERATION_LOCKED=true の間は送信しない。
 */
export interface TripoRequestTemplate {
  endpoint: string;
  method: "POST";
  /** 認証は環境変数の参照名のみ(値は含めない)。 */
  authRef: string;
  body: {
    type: "text_to_model";
    prompt: string;
    format: "glb";
    quality: "high";
    pbr: true;
  };
  locked: boolean;
}

export function buildTripoRequest(options: TripoPromptOptions = {}): TripoRequestTemplate {
  return {
    endpoint: "https://api.tripo3d.ai/v2/openapi/task",
    method: "POST",
    authRef: "env:TRIPO3D_API_KEY", // 参照名のみ。実値はコミットしない。
    body: {
      type: "text_to_model",
      prompt: buildTripoPrompt(options),
      format: "glb",
      quality: "high",
      pbr: true,
    },
    locked: TRIPO_GENERATION_LOCKED,
  };
}

/** アバターアバターが仕様状況を要約する日本語文。 */
export function summarizeAndroidSpecJa(): string {
  const gated = TRIPO_GENERATION_LOCKED ? "実生成はロック中(APIキー+人間承認待ち)" : "実生成 解放済み";
  return `Musasabi Android: モノアイ${MONO_EYE_STATES.length}感情・モーション${MOTION_CATALOG.length}種・仕様確定、${gated}。`;
}
