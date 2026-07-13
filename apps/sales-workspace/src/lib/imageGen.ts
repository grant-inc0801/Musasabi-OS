// ローカル画像生成(Stable Diffusion WebUI 互換 API・本番実装・無課金)。
// AUTOMATIC1111 系 WebUI(既定: http://127.0.0.1:7860)を自動検出し、
// txt2img でマーケ素材などを実生成する。生成はすべて端末内(GPU性能に依存)・外部送信なし。
// 未検出時は無効(導入すると自動で有効になる)。

export interface ImageGenSettings {
  baseUrl: string;
}

const KEY = "musasabi.imageGen";

export const DEFAULT_IMAGE_GEN: ImageGenSettings = {
  baseUrl: "http://127.0.0.1:7860",
};

export function loadImageGenSettings(): ImageGenSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_IMAGE_GEN };
    const parsed = JSON.parse(raw) as Partial<ImageGenSettings>;
    return { baseUrl: typeof parsed.baseUrl === "string" && parsed.baseUrl ? parsed.baseUrl : DEFAULT_IMAGE_GEN.baseUrl };
  } catch {
    return { ...DEFAULT_IMAGE_GEN };
  }
}

export function saveImageGenSettings(settings: ImageGenSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function localRequest(url: string, method: "GET" | "POST", body?: string): Promise<{ status: number; body: string }> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<{ status: number; body: string }>("local_llm_request", { url, method, body: body ?? null });
  }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), method === "GET" ? 2000 : 300000);
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body,
      signal: ctl.signal,
    });
    return { status: res.status, body: await res.text() };
  } finally {
    clearTimeout(timer);
  }
}

/** SD WebUI の疎通確認(GET /sdapi/v1/sd-models)。 */
export async function detectImageGen(settings: ImageGenSettings = loadImageGenSettings()): Promise<boolean> {
  try {
    const res = await localRequest(`${settings.baseUrl}/sdapi/v1/sd-models`, "GET");
    return res.status >= 200 && res.status < 300;
  } catch {
    return false;
  }
}

export interface GeneratedImage {
  /** PNG の base64(data: プレフィックスなし)。 */
  base64: string;
  elapsedMs: number;
}

/** txt2img で画像を1枚生成する。 */
export async function generateImage(
  prompt: string,
  settings: ImageGenSettings = loadImageGenSettings(),
): Promise<GeneratedImage> {
  const started = Date.now();
  const res = await localRequest(
    `${settings.baseUrl}/sdapi/v1/txt2img`,
    "POST",
    JSON.stringify({ prompt, steps: 20, width: 512, height: 512, batch_size: 1 }),
  );
  if (res.status < 200 || res.status >= 300) throw new Error(`SD WebUI HTTP ${res.status}`);
  const data = JSON.parse(res.body) as { images?: string[] };
  const base64 = data.images?.[0] ?? "";
  if (base64 === "") throw new Error("画像が生成されませんでした");
  return { base64, elapsedMs: Date.now() - started };
}
