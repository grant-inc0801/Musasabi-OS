// ローカルLLM(Ollama)接続設定の永続化。localStorage のみ(秘密情報なし:
// localhost の URL とモデル名だけを保存する。APIキーは存在しない)。

import { DEFAULT_LLM_SETTINGS, type LlmSettings } from "@musasabi/agent-runtime";

const KEY = "musasabi.llmSettings";

export function loadLlmSettings(): LlmSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_LLM_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<LlmSettings>;
    return {
      baseUrl: typeof parsed.baseUrl === "string" && parsed.baseUrl ? parsed.baseUrl : DEFAULT_LLM_SETTINGS.baseUrl,
      model: typeof parsed.model === "string" && parsed.model ? parsed.model : DEFAULT_LLM_SETTINGS.model,
    };
  } catch {
    return { ...DEFAULT_LLM_SETTINGS };
  }
}

export function saveLlmSettings(settings: LlmSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
