import type { TestCallSession, TalkFeedback, TestCallTurn } from "./types";
import { TALK_FEEDBACK_CATEGORY_LABEL_JA } from "./types";
import type { KnowledgeEntry } from "./sharedKnowledge";
import { SharedTalkKnowledge } from "./sharedKnowledge";

// テストコール履歴のローカル永続化(JSON直列化・検証)。
// 保存先はアプリ側(localStorage / ファイル)に任せ、ここでは
// 「保存値(unknown)→ 検証済みの TestCallSession[]」の復元を決定論的に行う。
// 実DB接続・外部送信はしない。

/** 保存形式のバージョン(将来のスキーマ変更に備える)。 */
export const CALL_LOG_SCHEMA_VERSION = 1;

export interface CallLogFile {
  version: number;
  sessions: TestCallSession[];
}

function isTurn(value: unknown): value is TestCallTurn {
  const v = value as TestCallTurn;
  return (
    typeof v === "object" &&
    v !== null &&
    (v.speaker === "ai" || v.speaker === "human") &&
    typeof v.text === "string" &&
    typeof v.timestampMs === "number"
  );
}

function isFeedback(value: unknown): value is TalkFeedback {
  const v = value as TalkFeedback;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.id === "string" &&
    (v.turnIndex === null || typeof v.turnIndex === "number") &&
    typeof v.comment === "string" &&
    typeof v.timestampMs === "number" &&
    Object.prototype.hasOwnProperty.call(TALK_FEEDBACK_CATEGORY_LABEL_JA, v.category)
  );
}

function isSession(value: unknown): value is TestCallSession {
  const v = value as TestCallSession;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.id === "string" &&
    typeof v.contact === "string" &&
    (v.status === "idle" || v.status === "in_progress" || v.status === "completed") &&
    typeof v.startedAtMs === "number" &&
    (v.endedAtMs === null || typeof v.endedAtMs === "number") &&
    Array.isArray(v.turns) &&
    v.turns.every(isTurn) &&
    Array.isArray(v.feedback) &&
    v.feedback.every(isFeedback)
  );
}

/** セッション履歴をJSON文字列へ直列化する。 */
export function serializeCallLog(sessions: readonly TestCallSession[]): string {
  const file: CallLogFile = { version: CALL_LOG_SCHEMA_VERSION, sessions: [...sessions] };
  return JSON.stringify(file);
}

/** 保存値(unknown)からセッション履歴を復元する。壊れた要素は捨てる。 */
export function parseCallLog(value: unknown): TestCallSession[] {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (typeof value !== "object" || value === null) {
    return [];
  }
  const sessions = (value as CallLogFile).sessions;
  if (!Array.isArray(sessions)) {
    return [];
  }
  return sessions.filter(isSession);
}

/**
 * 履歴へセッションを追記/更新する(同IDは置き換え)。新しい順に並べ、
 * maxSessions を超えた古い履歴は捨てる。イミュータブル。
 */
export function upsertSession(
  sessions: readonly TestCallSession[],
  session: TestCallSession,
  maxSessions = 100,
): TestCallSession[] {
  const rest = sessions.filter((s) => s.id !== session.id);
  return [session, ...rest]
    .sort((a, b) => b.startedAtMs - a.startedAtMs)
    .slice(0, maxSessions);
}

/** 保存済みセッション履歴から全AI社員共通ナレッジを再構築する。 */
export function knowledgeFromSessions(
  sessions: readonly TestCallSession[],
): SharedTalkKnowledge {
  const knowledge = new SharedTalkKnowledge();
  for (const session of sessions) {
    knowledge.ingestSession(session);
  }
  return knowledge;
}

/** ナレッジ項目の総数など、Sales Brain 表示用の集計。 */
export function callLogStats(sessions: readonly TestCallSession[]): {
  sessionCount: number;
  completedCount: number;
  turnCount: number;
  feedbackCount: number;
} {
  return {
    sessionCount: sessions.length,
    completedCount: sessions.filter((s) => s.status === "completed").length,
    turnCount: sessions.reduce((sum, s) => sum + s.turns.length, 0),
    feedbackCount: sessions.reduce((sum, s) => sum + s.feedback.length, 0),
  };
}

export type { KnowledgeEntry };
