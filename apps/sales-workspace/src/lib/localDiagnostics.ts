// ローカルAI連携の一括診断(本番・完全ローカル)。
// LLM頭脳・意味検索埋め込み・VOICEVOX・whisper(STT)・画像生成(SD)の検出状態を
// 1画面で確認できるようにする。接続できない場合は理由と有効化ヒントを表示し、
// ユーザーが自己解決できる導線にする。外部送信なし。

import { detectBrain } from "@musasabi/agent-runtime";
import { detectEmbeddings } from "@musasabi/brain-rag";
import { loadLlmSettings } from "./llmSettings";
import { resolveLlmFetch } from "./llmFetch";
import { detectVoicevox, isTtsAvailable, loadVoicevoxSettings } from "./voice";
import { detectStt, loadSttSettings } from "./stt";
import { detectImageGen, loadImageGenSettings } from "./imageGen";

export type ServiceState = "ok" | "fallback" | "unavailable";

export interface LocalServiceStatus {
  id: string;
  label: string;
  state: ServiceState;
  /** 現在の状態の説明(接続先・フォールバック内容・失敗理由)。 */
  detail: string;
  /** 有効化のヒント(unavailable / fallback 時)。 */
  hint?: string;
}

/** すべてのローカルAI連携を診断する(並列・各3秒程度)。 */
export async function probeLocalServices(): Promise<LocalServiceStatus[]> {
  const llm = loadLlmSettings();
  const f = await resolveLlmFetch();

  const [brain, embeddings, voicevox, stt, imageGen] = await Promise.all([
    detectBrain(llm, f).catch(() => null),
    detectEmbeddings({ baseUrl: llm.baseUrl, embedModel: "nomic-embed-text" }, f).catch(() => null),
    detectVoicevox(true).catch(() => false),
    detectStt().catch(() => false),
    detectImageGen().catch(() => false),
  ]);

  const statuses: LocalServiceStatus[] = [];

  // 1) LLM頭脳
  if (brain && brain.source === "ollama") {
    statuses.push({ id: "llm", label: "LLM頭脳(Ollama)", state: "ok", detail: `${brain.provider.name} — ${llm.baseUrl}` });
  } else {
    statuses.push({
      id: "llm",
      label: "LLM頭脳(Ollama)",
      state: "fallback",
      detail: `ルールベース頭脳で稼働中${brain?.probeError ? `(検出失敗: ${brain.probeError})` : ""}`,
      hint: `Ollama を起動し「ollama pull ${llm.model}」でモデルを取得(接続先: ${llm.baseUrl})`,
    });
  }

  // 2) 意味検索の埋め込み
  if (embeddings && embeddings.source === "ollama") {
    statuses.push({ id: "embeddings", label: "意味検索の埋め込み", state: "ok", detail: embeddings.provider.name });
  } else {
    statuses.push({
      id: "embeddings",
      label: "意味検索の埋め込み",
      state: "fallback",
      detail: "ハッシュ埋め込みで稼働中(検索精度は簡易)",
      hint: "「ollama pull nomic-embed-text」で実埋め込みに自動切替",
    });
  }

  // 3) 音声合成(VOICEVOX)
  if (voicevox) {
    statuses.push({ id: "voicevox", label: "音声合成(VOICEVOX)", state: "ok", detail: `接続済み — ${loadVoicevoxSettings().baseUrl}` });
  } else if (isTtsAvailable()) {
    statuses.push({
      id: "voicevox",
      label: "音声合成(VOICEVOX)",
      state: "fallback",
      detail: "OS標準音声(speechSynthesis)で読み上げ中",
      hint: `VOICEVOX を起動すると高品質キャラ音声に自動切替(接続先: ${loadVoicevoxSettings().baseUrl})`,
    });
  } else {
    statuses.push({
      id: "voicevox",
      label: "音声合成(VOICEVOX)",
      state: "unavailable",
      detail: "読み上げ手段がありません",
      hint: `VOICEVOX を起動してください(接続先: ${loadVoicevoxSettings().baseUrl})`,
    });
  }

  // 4) 音声入力(whisper)
  statuses.push(
    stt
      ? { id: "stt", label: "音声入力(whisper)", state: "ok", detail: `接続済み — ${loadSttSettings().baseUrl}` }
      : {
          id: "stt",
          label: "音声入力(whisper)",
          state: "unavailable",
          detail: "whisper サーバ未検出(音声入力ボタンは非表示)",
          hint: `whisper.cpp server を起動してください(接続先: ${loadSttSettings().baseUrl})`,
        },
  );

  // 5) 画像生成(Stable Diffusion WebUI)
  statuses.push(
    imageGen
      ? { id: "sd", label: "画像生成(SD WebUI)", state: "ok", detail: `接続済み — ${loadImageGenSettings().baseUrl}` }
      : {
          id: "sd",
          label: "画像生成(SD WebUI)",
          state: "unavailable",
          detail: "SD WebUI 未検出(画像生成は無効)",
          hint: `AUTOMATIC1111 WebUI を「--api」付きで起動してください(接続先: ${loadImageGenSettings().baseUrl})`,
        },
  );

  return statuses;
}
