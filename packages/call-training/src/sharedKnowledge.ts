import type { TalkFeedback, TalkFeedbackCategory, TestCallSession } from "./types";

// 全AI社員共通のトーク改善ナレッジ(Directive D-20260705-003 実装指示6)。
// テストモードで蓄積した指摘を、AI社員個別ではなく全社共通のナレッジへ反映する土台。
// 現フェーズはインメモリのみ(永続化は次フェーズ)。決定論的に動作する。

/** 共通ナレッジに取り込まれた1件の指摘。 */
export interface KnowledgeEntry {
  category: TalkFeedbackCategory;
  comment: string;
  sourceSessionId: string;
  timestampMs: number;
}

/**
 * 全AI社員が共有するトーク改善ナレッジ。テストセッションの指摘を集約する。
 * インメモリのみ(実DB接続・永続化はしない)。
 */
export class SharedTalkKnowledge {
  private readonly entries: KnowledgeEntry[] = [];

  /** セッション内のすべての指摘を共通ナレッジへ取り込む。 */
  ingestSession(session: TestCallSession): void {
    for (const fb of session.feedback) {
      this.ingestFeedback(fb, session.id);
    }
  }

  /** 単一の指摘を共通ナレッジへ取り込む。 */
  ingestFeedback(feedback: TalkFeedback, sourceSessionId: string): void {
    this.entries.push({
      category: feedback.category,
      comment: feedback.comment,
      sourceSessionId,
      timestampMs: feedback.timestampMs,
    });
  }

  /** 取り込み済みの指摘を返す(カテゴリ指定時はそのカテゴリのみ)。コピーを返す。 */
  getEntries(category?: TalkFeedbackCategory): KnowledgeEntry[] {
    const source = category
      ? this.entries.filter((e) => e.category === category)
      : this.entries;
    return source.map((e) => ({ ...e }));
  }

  /** カテゴリごとの件数を返す。 */
  countByCategory(): Record<TalkFeedbackCategory, number> {
    const counts: Record<TalkFeedbackCategory, number> = {
      tone: 0,
      rebuttal: 0,
      script: 0,
      other: 0,
    };
    for (const e of this.entries) {
      counts[e.category] += 1;
    }
    return counts;
  }

  /** 取り込み済みの総件数。 */
  get size(): number {
    return this.entries.length;
  }
}
