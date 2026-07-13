// エージェント用プロバイダ構築(タスク別モデルルーティング・本番実装)。
// 頭脳検出結果が Ollama の場合、「報告用モデル」(設定時のみ)を高品質モデルとして
// 計画・報告に使い、行動・観察は通常モデル(高速)で回す。未設定なら単一モデル。

import { OllamaProvider, type DetectedBrain, type LlmProvider } from "@musasabi/agent-runtime";
import { loadLlmSettings, loadReportModel } from "./llmSettings";
import { resolveLlmFetch } from "./llmFetch";

export async function buildReportProvider(brain: DetectedBrain): Promise<LlmProvider | undefined> {
  const reportModel = loadReportModel();
  if (brain.source !== "ollama" || reportModel === "") return undefined;
  const settings = loadLlmSettings();
  if (reportModel === settings.model) return undefined;
  const f = await resolveLlmFetch();
  return new OllamaProvider({ baseUrl: settings.baseUrl, model: reportModel }, f);
}
