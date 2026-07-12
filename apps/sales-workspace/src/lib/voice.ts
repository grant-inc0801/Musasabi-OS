// 音声読み上げ(TTS・本番実装・無課金)。
// Windows 内蔵音声(SpeechSynthesis API・オフライン・無料)で日本語を読み上げる。
// WebView2(デスクトップ)/ Chromium 系ブラウザで動作。外部送信なし。
// ※実STT(音声認識)は whisper.cpp 等のローカル導入が必要なため後続フェーズ。

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
