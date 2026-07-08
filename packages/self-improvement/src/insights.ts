import type { MemoryRecord } from "@musasabi/memory";
import { PROMOTION_THRESHOLD } from "./promoteMemories";

// D-015 AI Self Evolution: Memory(行動記録)から自己進化のインサイトを導出する。
// 繰り返される操作(自動化候補)・頻出アクション・稼働主体・短期/長期の内訳を集計。
// 純粋関数(決定的)・外部送信なし。

export interface CountItem {
  key: string;
  count: number;
}

export interface EvolutionInsights {
  totalRecords: number;
  shortTermCount: number;
  longTermCount: number;
  /** 頻出アクション(上位)。 */
  frequentActions: CountItem[];
  /** 自動化候補: しきい値以上に繰り返された作業アクション。 */
  automationCandidates: CountItem[];
  /** 稼働主体(actor)別の件数(上位)。 */
  topActors: CountItem[];
}

function countBy<T>(items: readonly T[], keyOf: (t: T) => string): CountItem[] {
  const map = new Map<string, number>();
  for (const it of items) {
    const k = keyOf(it);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    // 件数降順 → 同数はキー昇順で決定的に
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

/**
 * 自己進化インサイトを構築する。
 * automationCandidates は「work カテゴリで threshold 回以上繰り返されたアクション」。
 */
export function buildEvolutionInsights(
  records: readonly MemoryRecord[],
  options: { threshold?: number; topN?: number } = {},
): EvolutionInsights {
  const threshold = options.threshold ?? PROMOTION_THRESHOLD;
  const topN = options.topN ?? 5;

  const frequent = countBy(records, (r) => r.action).slice(0, topN);
  const workActions = countBy(
    records.filter((r) => r.category === "work"),
    (r) => r.action,
  );
  const automationCandidates = workActions.filter((c) => c.count >= threshold);
  const topActors = countBy(records, (r) => r.actor).slice(0, topN);

  return {
    totalRecords: records.length,
    shortTermCount: records.filter((r) => r.category === "short_term").length,
    longTermCount: records.filter((r) => r.category === "long_term").length,
    frequentActions: frequent,
    automationCandidates,
    topActors,
  };
}
