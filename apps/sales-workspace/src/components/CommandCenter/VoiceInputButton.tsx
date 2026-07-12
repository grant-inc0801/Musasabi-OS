import { useEffect, useRef, useState } from "react";
import { detectStt, startRecording } from "../../lib/stt";

// 音声入力ボタン(本番実装・無課金)。ローカル whisper サーバ
// (whisper.cpp server 等・http://127.0.0.1:8080)を自動検出し、
// 押して録音→もう一度押して停止→実文字起こし結果を onText で返す。
// サーバ未検出時は従来どおり Mock 表示(導入方法は README 参照)。
// 音声は端末内の localhost でのみ処理され、外部送信はしない。

export function VoiceInputButton({ onText }: { onText?: (text: string) => void }) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const sessionRef = useRef<{ stop(): Promise<string> } | null>(null);

  useEffect(() => {
    void detectStt().then(setAvailable);
  }, []);

  async function handleClick(): Promise<void> {
    if (busy) return;
    setNote(null);
    if (available !== true) {
      setNote("ローカル音声認識(whisper)未検出。README の手順で導入すると本物になります。");
      return;
    }
    if (!recording) {
      try {
        sessionRef.current = await startRecording();
        setRecording(true);
      } catch (e) {
        setNote(`マイクを開始できませんでした: ${String(e)}`);
      }
      return;
    }
    setRecording(false);
    setBusy(true);
    try {
      const text = await sessionRef.current?.stop();
      sessionRef.current = null;
      if (text && text !== "") {
        onText?.(text);
      } else {
        setNote("音声を認識できませんでした(無音の可能性)。");
      }
    } catch (e) {
      setNote(`文字起こしに失敗しました: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={recording ? "active" : undefined}
        onClick={() => void handleClick()}
        disabled={busy}
        title={
          available === true
            ? "ローカル音声認識(whisper)接続済み。押して話す→もう一度押して確定"
            : "ローカル音声認識サーバ未検出(README参照)"
        }
      >
        🎤 {busy ? "認識中…" : recording ? "⏹ 停止して文字起こし" : available === true ? "音声入力(押して話す)" : "音声入力(whisper未検出)"}
      </button>
      {note && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{note}</span>}
    </>
  );
}
