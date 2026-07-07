import type { MemoryRecord } from "@musasabi/memory";

// 短期メモリ → 長期ナレッジへの昇格(Development Bible 第9章の昇格戦略、
// 第18章 Self Evolution)。決定的ロジックのみ。
// ルール: 同じ行動(action)の短期メモリが閾値回数以上繰り返されたら、
// 「繰り返された学習事項」として長期メモリ1件に集約して昇格する。
// (例: 同種のトーク指摘が何度も入る → 恒久的な改善ナレッジへ)

/** 昇格に必要な同一行動の繰り返し回数。 */
export const PROMOTION_THRESHOLD = 2;

export interface PromotionResult {
  /** 新しく作る長期メモリ(昇格先)。 */
  promoted: Array<Pick<MemoryRecord, "category" | "actor" | "action" | "detail" | "tags">>;
  /** 昇格の根拠となった短期メモリのID(昇格済みマークに使える)。 */
  sourceIds: string[];
}

/**
 * 短期メモリのうち、同一 action が閾値以上繰り返されたグループを長期へ昇格する。
 * すでに同じ由来の長期メモリがある場合(tags に "promoted:<action>" を含む)は
 * 二重昇格しない。決定的: 同じ入力からは同じ結果。
 */
export function promoteRepeatedShortTerm(
  records: readonly MemoryRecord[],
  threshold = PROMOTION_THRESHOLD,
): PromotionResult {
  const shortTerm = records.filter((r) => r.category === "short_term");
  const alreadyPromoted = new Set(
    records
      .filter((r) => r.category === "long_term")
      .flatMap((r) => r.tags.filter((t) => t.startsWith("promoted:"))),
  );

  const byAction = new Map<string, MemoryRecord[]>();
  for (const r of shortTerm) {
    const group = byAction.get(r.action) ?? [];
    group.push(r);
    byAction.set(r.action, group);
  }

  const promoted: PromotionResult["promoted"] = [];
  const sourceIds: string[] = [];
  for (const [action, group] of byAction) {
    if (group.length < threshold) continue;
    if (alreadyPromoted.has(`promoted:${action}`)) continue;
    // 古い順に並べ、詳細を要約(最新3件まで)。
    const ordered = [...group].sort((a, b) => a.timestampMs - b.timestampMs);
    const details = ordered
      .slice(-3)
      .map((r) => r.detail)
      .filter((d) => d !== "");
    promoted.push({
      category: "long_term",
      actor: ordered[ordered.length - 1].actor,
      action: `学習事項に昇格: ${action}`,
      detail:
        `短期メモリで${group.length}回繰り返されたため長期ナレッジへ昇格。` +
        (details.length > 0 ? ` 内容: ${details.join(" / ")}` : ""),
      tags: ["self-improvement", `promoted:${action}`],
    });
    sourceIds.push(...ordered.map((r) => r.id));
  }

  return { promoted, sourceIds };
}
