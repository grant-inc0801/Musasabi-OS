// コール機能の三段階運用の型定義(Directive D-20260705-003)。
// Learning Mode → Test Mode → AutoCall Mode。現フェーズでは AutoCall 本番実行は禁止。
// 実架電・実音声接続はしない(Mock のみ)。

/** コール運用モード。 */
export type CallMode = "learning" | "test" | "autocall";

export const CALL_MODES: readonly CallMode[] = ["learning", "test", "autocall"];

export const CALL_MODE_LABEL_JA: Record<CallMode, string> = {
  learning: "ラーニングモード",
  test: "テストモード",
  autocall: "オートコールモード",
};

/**
 * AutoCall Mode を有効化するために揃える必要のある安全ゲート(Directive の
 * AutoCall Mode 有効化条件)。現フェーズではすべて未充足で、本番実行はできない。
 */
export type AutoCallGate =
  | "admin_approval" // 管理者承認
  | "legal_check" // 法令・運用ルール確認
  | "call_list_approval" // 架電先リスト承認
  | "working_hours_limit" // 稼働時間制限
  | "emergency_stop" // 緊急停止ボタン
  | "audit_log" // 監査ログ
  | "test_pass_criteria" // テストモード合格基準
  | "real_account_link"; // 実アカウント連携

export const AUTOCALL_GATES: readonly AutoCallGate[] = [
  "admin_approval",
  "legal_check",
  "call_list_approval",
  "working_hours_limit",
  "emergency_stop",
  "audit_log",
  "test_pass_criteria",
  "real_account_link",
];

export const AUTOCALL_GATE_LABEL_JA: Record<AutoCallGate, string> = {
  admin_approval: "管理者承認",
  legal_check: "法令・運用ルール確認",
  call_list_approval: "架電先リスト承認",
  working_hours_limit: "稼働時間制限",
  emergency_stop: "緊急停止ボタン",
  audit_log: "監査ログ",
  test_pass_criteria: "テストモード合格基準",
  real_account_link: "実アカウント連携",
};

/** テスト会話の1発話。 */
export interface TestCallTurn {
  speaker: "ai" | "human";
  text: string;
  timestampMs: number;
}

/** テスト架電中に人間がAIへ与えた指摘(トーク修正の指導)。 */
export interface TalkFeedback {
  id: string;
  /** 対象の発話(TestCallTurn)を指すインデックス。全体への指摘は null。 */
  turnIndex: number | null;
  comment: string;
  /** 指摘のカテゴリ(話し方・切り返し・トーク内容など)。 */
  category: TalkFeedbackCategory;
  timestampMs: number;
}

export type TalkFeedbackCategory = "tone" | "rebuttal" | "script" | "other";

export const TALK_FEEDBACK_CATEGORY_LABEL_JA: Record<TalkFeedbackCategory, string> = {
  tone: "話し方",
  rebuttal: "切り返し",
  script: "トーク内容",
  other: "その他",
};

/** テストコールのセッション。Mock 架電の1回分。 */
export interface TestCallSession {
  id: string;
  /** 連絡先の自由入力値(ダミー/テスト用。実架電はしない)。 */
  contact: string;
  status: TestCallStatus;
  startedAtMs: number;
  endedAtMs: number | null;
  turns: TestCallTurn[];
  feedback: TalkFeedback[];
}

export type TestCallStatus = "idle" | "in_progress" | "completed";
