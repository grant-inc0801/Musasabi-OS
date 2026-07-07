import type { MemoryCategory, MemoryQuery, MemoryRecord } from "./types";
import { MEMORY_CATEGORIES } from "./types";

// Brain Memory Engine 本体(Development Bible 第9章)。決定論的・イミュータブル志向。
// 短期メモリは prune() で保持期間を過ぎたものを長期へ昇格せず破棄する
// (昇格戦略は Self Improvement Engine フェーズで扱う)。

/** 短期メモリの既定保持期間(24時間)。 */
export const SHORT_TERM_RETENTION_MS = 24 * 60 * 60 * 1000;

/** 既定の最大保持件数(超過分は古いものから破棄)。 */
export const DEFAULT_MAX_RECORDS = 5000;

export interface RecordInput {
  category: MemoryCategory;
  actor: string;
  action: string;
  detail?: string;
  tags?: string[];
  nowMs: number;
}

export class MemoryEngine {
  private records: MemoryRecord[] = [];
  private counter = 0;
  private readonly maxRecords: number;

  constructor(initial: readonly MemoryRecord[] = [], maxRecords = DEFAULT_MAX_RECORDS) {
    this.records = [...initial];
    this.maxRecords = maxRecords;
  }

  /** 行動を記録する。作成したレコードを返す。 */
  record(input: RecordInput): MemoryRecord {
    this.counter += 1;
    const entry: MemoryRecord = {
      id: `mem-${input.nowMs}-${this.counter}`,
      category: input.category,
      actor: input.actor,
      action: input.action,
      detail: input.detail ?? "",
      timestampMs: input.nowMs,
      tags: [...(input.tags ?? [])],
    };
    this.records.push(entry);
    if (this.records.length > this.maxRecords) {
      this.records = this.records.slice(this.records.length - this.maxRecords);
    }
    return entry;
  }

  /** 条件で絞り込んで新しい順に返す(コピー)。 */
  query(query: MemoryQuery = {}): MemoryRecord[] {
    const text = query.text?.toLowerCase();
    const filtered = this.records.filter((r) => {
      if (query.category && r.category !== query.category) return false;
      if (query.actor && r.actor !== query.actor) return false;
      if (query.sinceMs !== undefined && r.timestampMs < query.sinceMs) return false;
      if (
        text &&
        !r.action.toLowerCase().includes(text) &&
        !r.detail.toLowerCase().includes(text) &&
        !r.tags.some((t) => t.toLowerCase().includes(text))
      ) {
        return false;
      }
      return true;
    });
    const sorted = filtered.sort((a, b) => b.timestampMs - a.timestampMs).map((r) => ({ ...r }));
    return query.limit !== undefined ? sorted.slice(0, query.limit) : sorted;
  }

  /** 分類ごとの件数。 */
  countByCategory(): Record<MemoryCategory, number> {
    const counts = Object.fromEntries(MEMORY_CATEGORIES.map((c) => [c, 0])) as Record<
      MemoryCategory,
      number
    >;
    for (const r of this.records) {
      counts[r.category] += 1;
    }
    return counts;
  }

  get size(): number {
    return this.records.length;
  }

  /**
   * 保持期間を過ぎた短期メモリを破棄する。破棄した件数を返す。
   * 他の分類は prune の対象外(長期・会社などは明示削除まで保持)。
   */
  prune(nowMs: number, shortTermRetentionMs = SHORT_TERM_RETENTION_MS): number {
    const before = this.records.length;
    this.records = this.records.filter(
      (r) => r.category !== "short_term" || nowMs - r.timestampMs <= shortTermRetentionMs,
    );
    return before - this.records.length;
  }

  /** 全レコード(新しい順のコピー)。直列化用。 */
  toRecords(): MemoryRecord[] {
    return this.query();
  }
}
