// 実STT(音声認識・本番実装・無課金)。
// ローカルの whisper 系サーバ(whisper.cpp server / OpenAI互換 /v1/audio/transcriptions)を
// 自動検出し、マイク録音を WAV(16kHz mono)へ変換して文字起こしする。
// 音声はこの端末内の localhost サーバでのみ処理(外部送信なし)。未検出時は無効(Mock表示)。
// デスクトップでは Rust プロキシ(local_stt_request・localhost限定)経由で接続する。

export interface SttSettings {
  /** whisper サーバURL(既定: whisper.cpp server の http://127.0.0.1:8080)。 */
  baseUrl: string;
}

const KEY = "musasabi.sttSettings";

export const DEFAULT_STT_SETTINGS: SttSettings = {
  baseUrl: "http://127.0.0.1:8080",
};

export function loadSttSettings(): SttSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<SttSettings>;
    return { baseUrl: typeof parsed.baseUrl === "string" && parsed.baseUrl ? parsed.baseUrl : DEFAULT_STT_SETTINGS.baseUrl };
  } catch {
    return { ...DEFAULT_STT_SETTINGS };
  }
}

export function saveSttSettings(settings: SttSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** whisper サーバの疎通確認(GET /health → GET /)。 */
export async function detectStt(settings: SttSettings = loadSttSettings()): Promise<boolean> {
  const tryGet = async (path: string): Promise<boolean> => {
    try {
      if (isTauri()) {
        const { invoke } = await import("@tauri-apps/api/core");
        const res = await invoke<{ status: number }>("local_llm_request", {
          url: `${settings.baseUrl}${path}`,
          method: "GET",
          body: null,
        });
        return res.status >= 200 && res.status < 500;
      }
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 1500);
      const res = await fetch(`${settings.baseUrl}${path}`, { signal: ctl.signal });
      clearTimeout(timer);
      return res.status >= 200 && res.status < 500;
    } catch {
      return false;
    }
  };
  return (await tryGet("/health")) || (await tryGet("/"));
}

// ─────────────── 録音 → WAV(16kHz mono)変換 ───────────────

function encodeWav16kMono(samples: Float32Array, sampleRate: number): Uint8Array {
  // 16kHz へ間引き(簡易リサンプリング)
  const targetRate = 16000;
  const ratio = sampleRate / targetRate;
  const length = Math.floor(samples.length / ratio);
  const pcm = new Int16Array(length);
  for (let i = 0; i < length; i++) {
    const v = samples[Math.floor(i * ratio)];
    pcm[i] = Math.max(-1, Math.min(1, v)) * 0x7fff;
  }
  const buffer = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, pcm.length * 2, true);
  new Int16Array(buffer, 44).set(pcm);
  return new Uint8Array(buffer);
}

/** 録音済み音声Blob(webm等)をデコードして WAV 16kHz mono に変換する。 */
export async function blobToWav(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    // モノラル化(チャンネル平均)
    const ch0 = decoded.getChannelData(0);
    const mono = new Float32Array(ch0.length);
    mono.set(ch0);
    for (let c = 1; c < decoded.numberOfChannels; c++) {
      const ch = decoded.getChannelData(c);
      for (let i = 0; i < mono.length; i++) mono[i] = (mono[i] + ch[i]) / 2;
    }
    return encodeWav16kMono(mono, decoded.sampleRate);
  } finally {
    void ctx.close();
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** WAV音声を whisper サーバで文字起こしする。 */
export async function transcribeWav(wav: Uint8Array, settings: SttSettings = loadSttSettings()): Promise<string> {
  const endpoints = ["/inference", "/v1/audio/transcriptions"];
  let lastError = "";
  for (const path of endpoints) {
    try {
      const url = `${settings.baseUrl}${path}`;
      let status: number;
      let bodyText: string;
      if (isTauri()) {
        const { invoke } = await import("@tauri-apps/api/core");
        const res = await invoke<{ status: number; body: string }>("local_stt_request", {
          url,
          audioBase64: bytesToBase64(wav),
          fileName: "audio.wav",
        });
        status = res.status;
        bodyText = res.body;
      } else {
        const form = new FormData();
        form.append("file", new Blob([wav.buffer as ArrayBuffer], { type: "audio/wav" }), "audio.wav");
        form.append("response_format", "json");
        const res = await fetch(url, { method: "POST", body: form });
        status = res.status;
        bodyText = await res.text();
      }
      if (status === 404) continue; // 別エンドポイントを試す
      if (status < 200 || status >= 300) throw new Error(`STT HTTP ${status}`);
      const data = JSON.parse(bodyText) as { text?: string };
      return (data.text ?? "").trim();
    } catch (e) {
      lastError = String(e);
    }
  }
  throw new Error(lastError || "STTサーバに接続できませんでした");
}

/** マイク録音を開始する。stop() で終了し文字起こし結果を返す。 */
export async function startRecording(): Promise<{ stop(): Promise<string> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.start();
  return {
    stop: () =>
      new Promise<string>((resolve, reject) => {
        recorder.onstop = () => {
          for (const track of stream.getTracks()) track.stop();
          void (async () => {
            try {
              const wav = await blobToWav(new Blob(chunks, { type: recorder.mimeType }));
              resolve(await transcribeWav(wav));
            } catch (e) {
              reject(e instanceof Error ? e : new Error(String(e)));
            }
          })();
        };
        recorder.stop();
      }),
  };
}
