// ローカルLLM(Ollama)接続用の fetch 解決。
// Tauri デスクトップ環境ではネイティブHTTP(@tauri-apps/plugin-http)を使う。
// WebView の origin(http://tauri.localhost)は Ollama の CORS 既定で弾かれる
// ことがあるため、Rust 経由の HTTP なら OLLAMA_ORIGINS の設定なしで接続できる。
// ブラウザ実行時は undefined を返し、agent-runtime 側の既定(window.fetch)を使う。
// 接続先は capabilities(127.0.0.1:11434 / localhost:11434)で制限される。

type LlmFetchLike = (url: string, init?: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export async function resolveLlmFetch(): Promise<LlmFetchLike | undefined> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
      return tauriFetch as unknown as LlmFetchLike;
    } catch {
      // プラグイン未登録などの場合はブラウザ fetch へフォールバック
      return undefined;
    }
  }
  return undefined;
}
