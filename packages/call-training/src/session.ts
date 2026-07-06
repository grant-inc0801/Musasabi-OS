import type {
  AutoCallGate,
  CallMode,
  TalkFeedback,
  TalkFeedbackCategory,
  TestCallSession,
  TestCallTurn,
} from "./types";
import { AUTOCALL_GATES } from "./types";
import type { CallAdapter } from "./MockCallAdapter";

// テストコールのセッション操作と AutoCall 安全ゲート判定(Directive D-20260705-003)。
// すべて決定論的な純粋関数(Development Bible: 決定論を優先)。実架電・実音声はしない。

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/** 新しいテストコールセッションを開始する。AIの最初の発話を含む。 */
export function startTestCall(
  contact: string,
  adapter: CallAdapter,
  nowMs = 0,
): TestCallSession {
  const trimmed = contact.trim();
  if (trimmed.length === 0) {
    throw new Error("連絡先が入力されていません。");
  }
  const opening = adapter.startCall(trimmed);
  return {
    id: nextId("session"),
    contact: trimmed,
    status: "in_progress",
    startedAtMs: nowMs,
    endedAtMs: null,
    turns: [opening],
    feedback: [],
  };
}

/** 人間の発話を追加し、AIの応答を返す(セッションを更新した新オブジェクトを返す)。 */
export function addHumanTurn(
  session: TestCallSession,
  humanText: string,
  adapter: CallAdapter,
  nowMs: number,
): TestCallSession {
  if (session.status !== "in_progress") {
    throw new Error("このセッションは進行中ではありません。");
  }
  const humanTurn: TestCallTurn = { speaker: "human", text: humanText, timestampMs: nowMs };
  const aiTurn = adapter.respond(humanText, nowMs + 1);
  return { ...session, turns: [...session.turns, humanTurn, aiTurn] };
}

/** セッションを終了する。 */
export function endTestCall(session: TestCallSession, nowMs: number): TestCallSession {
  return { ...session, status: "completed", endedAtMs: nowMs };
}

/** 指摘(トーク修正の指導)を追加する。 */
export function addFeedback(
  session: TestCallSession,
  input: { turnIndex: number | null; comment: string; category: TalkFeedbackCategory; nowMs: number },
): TestCallSession {
  const feedback: TalkFeedback = {
    id: nextId("fb"),
    turnIndex: input.turnIndex,
    comment: input.comment,
    category: input.category,
    timestampMs: input.nowMs,
  };
  return { ...session, feedback: [...session.feedback, feedback] };
}

/**
 * AutoCall Mode を有効化できるか判定する。Directive の全ゲートが充足された場合のみ true。
 * 現フェーズでは充足済みゲートが揃わないため、常に false を返す想定。
 */
export function canEnableAutoCall(satisfiedGates: readonly AutoCallGate[]): boolean {
  const satisfied = new Set(satisfiedGates);
  return AUTOCALL_GATES.every((gate) => satisfied.has(gate));
}

/**
 * 指定モードで実架電(本番発信)を実行してよいか。AutoCall 本番実行は禁止のため、
 * learning/test は常に false(Mock のみ)、autocall もゲート未充足では false。
 * 現フェーズでは全モードで false を返す(実架電は一切しない)。
 */
export function canPlaceRealCall(mode: CallMode, satisfiedGates: readonly AutoCallGate[]): boolean {
  if (mode !== "autocall") {
    return false;
  }
  return canEnableAutoCall(satisfiedGates);
}
