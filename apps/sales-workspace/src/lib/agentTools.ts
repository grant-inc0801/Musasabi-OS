// エージェント用ツール構築(エージェント実行センター/定例実行スケジューラで共用)。
// research_snapshot は実RAG(Company Brain 意味検索)へ差し替える(ヒットなしは従来Mock文言)。

import { defaultTools, type AgentTool } from "@musasabi/agent-runtime";
import { searchBrain } from "./brainRag";

export function buildAgentTools(): AgentTool[] {
  return defaultTools().map((t) =>
    t.name === "research_snapshot"
      ? {
          ...t,
          run: async (input: string) => {
            const { hits, state } = await searchBrain(input, 3);
            if (hits.length === 0) {
              return `社内データに関連記録なし(索引 ${state.indexedCount} 件)。市場スナップショット(Mock): 対象セグメントの需要は中〜高。`;
            }
            const lines = hits
              .map((h) => `・${h.doc.text}(関連度 ${(h.score * 100).toFixed(0)}%)`)
              .join("\n");
            return `社内データ検索(${state.providerName}・索引 ${state.indexedCount} 件):\n${lines}`;
          },
        }
      : t,
  );
}
