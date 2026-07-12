// エージェント用ツール構築(エージェント実行センター/定例実行スケジューラで共用)。
// research_snapshot は実RAG(Company Brain 意味検索)へ差し替える(ヒットなしは従来Mock文言)。

import { defaultTools, type AgentTool } from "@musasabi/agent-runtime";
import { searchBrain } from "./brainRag";
import { fetchAllHeadlines } from "./rssFeeds";

export function buildAgentTools(): AgentTool[] {
  return defaultTools().map((t) =>
    t.name === "research_snapshot"
      ? {
          ...t,
          run: async (input: string) => {
            const parts: string[] = [];
            // 外部実データ(登録済みRSSフィードの最新見出し。未登録なら取得しない)
            const headlines = await fetchAllHeadlines(3).catch(() => []);
            if (headlines.length > 0) {
              parts.push(
                `外部実データ(RSS ${headlines.length} 件):\n` +
                  headlines.slice(0, 5).map((h) => `・${h.title}(${h.feedLabel})`).join("\n"),
              );
            }
            // 社内データ(Company Brain 意味検索)
            const { hits, state } = await searchBrain(input, 3);
            if (hits.length > 0) {
              parts.push(
                `社内データ検索(${state.providerName}・索引 ${state.indexedCount} 件):\n` +
                  hits.map((h) => `・${h.doc.text}(関連度 ${(h.score * 100).toFixed(0)}%)`).join("\n"),
              );
            }
            if (parts.length === 0) {
              return `関連する実データなし(RSS未登録・Brain索引 ${state.indexedCount} 件)。市場スナップショット(Mock): 対象セグメントの需要は中〜高。`;
            }
            return parts.join("\n");
          },
        }
      : t,
  );
}
