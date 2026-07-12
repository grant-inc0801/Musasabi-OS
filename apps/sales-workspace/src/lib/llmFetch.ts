// ローカルLLM(Ollama)接続用の fetch 解決。
// Tauri デスクトップ環境では Rust 側のプロキシコマンド(local_llm_request)経由で
// 接続する。WebView からの fetch(plugin-http 含む)は Origin ヘッダ
// (http://tauri.localhost)が付与され、Ollama の許可リストに無いため HTTP 403 で
// 拒否される。Rust から Origin なしで転送することで、OLLAMA_ORIGINS の設定なしに
// 接続できる。接続先は Rust 側で localhost / 127.0.0.1 のみに制限(外部送信なし)。
// ブラウザ実行時は undefined を返し、agent-runtime 側の既定(window.fetch)を使う。

type LlmFetchLike = (url: string, init?: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export async function resolveLlmFetch(): Promise<LlmFetchLike | undefined> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const viaRust: LlmFetchLike = async (url, init) => {
        const res = await invoke<{ status: number; body: string }>("local_llm_request", {
          url,
          method: init?.method ?? "GET",
          body: init?.body ?? null,
        });
        return {
          ok: res.status >= 200 && res.status < 300,
          status: res.status,
          json: async () => JSON.parse(res.body) as unknown,
        };
      };
      return viaRust;
    } catch {
      // Tauri API 読み込み失敗時はブラウザ fetch へフォールバック
      return undefined;
    }
  }
  return undefined;
}
