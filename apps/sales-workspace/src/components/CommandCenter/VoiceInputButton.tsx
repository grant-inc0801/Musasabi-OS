import { useState } from "react";

// 音声入力ボタン(D-20260706-007)。β版はMock — 押下で「音声入力準備中」を表示する。
// 実STT接続(Web Speech API / whisper.cpp)は後続フェーズ・承認後。

export function VoiceInputButton() {
  const [active, setActive] = useState(false);
  return (
    <button
      type="button"
      className={active ? "active" : undefined}
      onClick={() => setActive((v) => !v)}
      title="β版はMockです(実音声認識は後続フェーズ)"
    >
      🎤 {active ? "音声入力準備中(Mock)…" : "音声入力(押して話す)"}
    </button>
  );
}
