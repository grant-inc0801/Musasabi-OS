// 外部APIへのJSON取得。Tauriデスクトップ環境ではネイティブHTTP
// (@tauri-apps/plugin-http。CORSの制約を受けない)を使い、
// ブラウザ実行時は window.fetch にフォールバックする。
// 接続先は capabilities(serpapi.com のみ)で制限される。

export async function fetchJsonExternal(url: string): Promise<unknown> {
  const doFetch = await resolveFetch();
  const response = await doFetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: 接続に失敗しました`);
  }
  return response.json();
}

type FetchLike = (url: string, init?: { method?: string }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

async function resolveFetch(): Promise<FetchLike> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
    return tauriFetch as unknown as FetchLike;
  }
  return window.fetch.bind(window) as FetchLike;
}
