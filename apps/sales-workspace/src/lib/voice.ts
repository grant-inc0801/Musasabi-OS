// 音声読み上げ(TTS・本番実装・無課金)。
// 第一候補: VOICEVOX(無料・ローカル・http://127.0.0.1:50021)を自動検出して高品質キャラ音声。
// 未検出時: Windows 内蔵音声(SpeechSynthesis API・オフライン・無料)へフォールバック。
// どちらも外部送信なし。

let cachedVoice: SpeechSynthesisVoice | null | undefined;

export function isTtsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickJaVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => v.lang.startsWith("ja") && v.localService) ??
    voices.find((v) => v.lang.startsWith("ja")) ??
    null;
  return cachedVoice;
}

/** 日本語テキストを読み上げる(長文は先頭のみ)。読み上げ開始できたら true。 */
export function speakJa(text: string, maxChars = 400): boolean {
  if (!isTtsAvailable()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.slice(0, maxChars));
  u.lang = "ja-JP";
  const voice = pickJaVoice();
  if (voice) u.voice = voice;
  u.rate = 1.05;
  synth.speak(u);
  return true;
}

export function stopSpeaking(): void {
  if (isTtsAvailable()) window.speechSynthesis.cancel();
}

// voiceschanged 後にキャッシュを再取得できるようにする
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
  };
}


// ─────────────── VOICEVOX(高品質ローカルTTS)───────────────

export interface VoicevoxSettings {
  baseUrl: string;
  /** 話者ID(既定 1 = ずんだもん あまあま 等、VOICEVOX 側の一覧に依存)。 */
  speaker: number;
}

const VOICEVOX_KEY = "musasabi.voicevox";

export const DEFAULT_VOICEVOX_SETTINGS: VoicevoxSettings = {
  baseUrl: "http://127.0.0.1:50021",
  speaker: 1,
};

export function loadVoicevoxSettings(): VoicevoxSettings {
  try {
    const raw = localStorage.getItem(VOICEVOX_KEY);
    if (!raw) return { ...DEFAULT_VOICEVOX_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<VoicevoxSettings>;
    return {
      baseUrl: typeof parsed.baseUrl === "string" && parsed.baseUrl ? parsed.baseUrl : DEFAULT_VOICEVOX_SETTINGS.baseUrl,
      speaker: typeof parsed.speaker === "number" ? parsed.speaker : DEFAULT_VOICEVOX_SETTINGS.speaker,
    };
  } catch {
    return { ...DEFAULT_VOICEVOX_SETTINGS };
  }
}

export function saveVoicevoxSettings(settings: VoicevoxSettings): void {
  localStorage.setItem(VOICEVOX_KEY, JSON.stringify(settings));
}

let voicevoxAvailable: boolean | null = null;

function isTauriEnv(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** VOICEVOX エンジンの疎通確認(GET /version)。結果はセッション内キャッシュ。 */
export async function detectVoicevox(force = false): Promise<boolean> {
  if (!force && voicevoxAvailable !== null) return voicevoxAvailable;
  const { baseUrl } = loadVoicevoxSettings();
  try {
    if (isTauriEnv()) {
      const { invoke } = await import("@tauri-apps/api/core");
      const res = await invoke<{ status: number }>("local_llm_request", {
        url: `${baseUrl}/version`,
        method: "GET",
        body: null,
      });
      voicevoxAvailable = res.status >= 200 && res.status < 300;
    } else {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 1500);
      const res = await fetch(`${baseUrl}/version`, { signal: ctl.signal });
      clearTimeout(timer);
      voicevoxAvailable = res.ok;
    }
  } catch {
    voicevoxAvailable = false;
  }
  return voicevoxAvailable;
}

async function speakWithVoicevox(text: string): Promise<boolean> {
  const settings = loadVoicevoxSettings();
  try {
    let wavBase64: string;
    if (isTauriEnv()) {
      const { invoke } = await import("@tauri-apps/api/core");
      wavBase64 = await invoke<string>("local_tts_synthesis", {
        baseUrl: settings.baseUrl,
        text: text.slice(0, 400),
        speaker: settings.speaker,
      });
    } else {
      const q = await fetch(`${settings.baseUrl}/audio_query?speaker=${settings.speaker}&text=${encodeURIComponent(text.slice(0, 400))}`, { method: "POST" });
      if (!q.ok) return false;
      const queryJson = await q.text();
      const s = await fetch(`${settings.baseUrl}/synthesis?speaker=${settings.speaker}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: queryJson,
      });
      if (!s.ok) return false;
      const buf = new Uint8Array(await s.arrayBuffer());
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < buf.length; i += chunk) binary += String.fromCharCode(...buf.subarray(i, i + chunk));
      wavBase64 = btoa(binary);
    }
    const audio = new Audio(`data:audio/wav;base64,${wavBase64}`);
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

/**
 * 高品質読み上げ: VOICEVOX 検出時はキャラ音声、未検出/失敗時は端末内TTSへフォールバック。
 * 読み上げ開始できたら true。
 */
export async function speakJaBest(text: string): Promise<boolean> {
  if (await detectVoicevox()) {
    if (await speakWithVoicevox(text)) return true;
  }
  return speakJa(text);
}
