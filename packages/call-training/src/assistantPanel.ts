import type { CallMode } from "./types";
import { CALL_MODE_LABEL_JA, CALL_MODES } from "./types";

// 右下常駐アバターのミニパネル状態管理(D-20260706-004)。
// パネル開閉・モード切替・チャット・吹き出し提案を決定論的な純粋関数で扱う。
// AutoCall 本番実行は不可のまま(モード表示の切替のみで、実架電はしない)。

/** ミニパネルのチャット1件。 */
export interface AssistantChatMessage {
  speaker: "user" | "musa";
  text: string;
  timestampMs: number;
}

/** ミニパネルのUI状態(イミュータブルに更新する)。 */
export interface AssistantPanelState {
  panelOpen: boolean;
  mode: CallMode;
  chat: AssistantChatMessage[];
  /** 吹き出しに表示する提案・通知(null なら非表示)。 */
  bubble: string | null;
}

/** モードごとの吹き出し提案(Directive の例文に準拠)。 */
export const MODE_SUGGESTION_JA: Record<CallMode, string> = {
  learning: "Learning内容をSales Brainへ反映しました",
  test: "次はTest Modeでロールプレイ確認しましょう",
  autocall: "AutoCallは承認待ちです",
};

/**
 * 初期状態を作る。吹き出しは非表示(null)で始める — 最小化・常駐時は
 * 「アバター以外を表示しない」ため(D-20260706-006)。提案はモード切替や
 * パネル操作のタイミングで表示する。
 */
export function createAssistantPanelState(defaultMode: CallMode = "test"): AssistantPanelState {
  return {
    panelOpen: false,
    mode: defaultMode,
    chat: [],
    bubble: null,
  };
}

/** パネルの開閉を切り替える。 */
export function togglePanel(state: AssistantPanelState): AssistantPanelState {
  return { ...state, panelOpen: !state.panelOpen };
}

/**
 * モードを切り替える。autocall へ切り替えた場合は承認待ちである旨を吹き出しに出す
 * (本番実行はできない。表示上の切替のみ)。
 */
export function switchMode(state: AssistantPanelState, mode: CallMode): AssistantPanelState {
  if (!CALL_MODES.includes(mode)) {
    return state;
  }
  return { ...state, mode, bubble: MODE_SUGGESTION_JA[mode] };
}

/** 吹き出しを閉じる。 */
export function dismissBubble(state: AssistantPanelState): AssistantPanelState {
  return { ...state, bubble: null };
}

/** 吹き出しに任意の通知を表示する(提案・注意事項の短文)。 */
export function showBubble(state: AssistantPanelState, text: string): AssistantPanelState {
  return { ...state, bubble: text };
}

/**
 * チャット入力を送信する。ユーザー発話と、決定論的なMUSAの応答を追加する。
 * 応答はルールベース(LLM・外部API不使用)。空文字は無視する。
 */
export function sendChat(
  state: AssistantPanelState,
  text: string,
  nowMs: number,
): AssistantPanelState {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return state;
  }
  const userMessage: AssistantChatMessage = { speaker: "user", text: trimmed, timestampMs: nowMs };
  const reply: AssistantChatMessage = {
    speaker: "musa",
    text: composeAssistantReply(trimmed, state.mode),
    timestampMs: nowMs + 1,
  };
  return { ...state, chat: [...state.chat, userMessage, reply] };
}

/** ユーザー指示への決定論的な応答文を作る。 */
export function composeAssistantReply(text: string, mode: CallMode): string {
  if (/オートコール|autocall|本番/i.test(text)) {
    return "オートコールは全安全ゲート充足まで承認待ちです。まずはテストモードで品質を確認しましょう。";
  }
  if (/テスト|ロールプレイ|練習/.test(text)) {
    return "テストモードを開きますね。メイン画面のコールトレーニングからテストコールを開始できます。";
  }
  if (/学習|ラーニング|ナレッジ/.test(text)) {
    return "ラーニングモードの内容はSales Brainの共通ナレッジへ反映されます。";
  }
  if (/状況|進捗|ステータス/.test(text)) {
    return `現在のモードは${CALL_MODE_LABEL_JA[mode]}です。詳細はメイン管理画面をご確認ください。`;
  }
  return `承知しました(現在: ${CALL_MODE_LABEL_JA[mode]})。詳しい操作はメイン管理画面から実行できます。`;
}
