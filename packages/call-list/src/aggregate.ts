import type { PlaceSearchResult } from "./types";

// 検索結果の件数集計(検索後に表示する集計値)。決定的ロジックのみ。

export interface CallListSummary {
  /** 店舗合計件数。 */
  total: number;
  /** 市区町村ごとの件数。 */
  byCity: Array<{ city: string; count: number }>;
  /** ジャンルごとの件数(多い順・同数は名前順)。 */
  byGenre: Array<{ genre: string; count: number }>;
  /** デリバリー対応の店舗数。 */
  deliveryCount: number;
}

export function summarizeCallList(results: readonly PlaceSearchResult[]): CallListSummary {
  const genreCounts = new Map<string, number>();
  let total = 0;
  let deliveryCount = 0;
  for (const result of results) {
    total += result.records.length;
    for (const record of result.records) {
      genreCounts.set(record.genre, (genreCounts.get(record.genre) ?? 0) + 1);
      if (record.deliveryAvailable) deliveryCount += 1;
    }
  }
  const byGenre = [...genreCounts.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre, "ja"));
  return {
    total,
    byCity: results.map((r) => ({ city: r.city, count: r.records.length })),
    byGenre,
    deliveryCount,
  };
}
