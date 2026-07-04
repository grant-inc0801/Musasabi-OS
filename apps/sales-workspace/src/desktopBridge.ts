import { filemaker } from "@musasabi/integrations";
import type { Lead } from "@musasabi/ai-core";
import { generateCallSummary } from "@musasabi/voice-analysis";
import type { CallAnalysisSummary, TranscriptSegment } from "@musasabi/voice-analysis";
import { MockTtsProvider } from "@musasabi/voice-engine";
import { isAvatarState } from "@musasabi/avatar-2d";
import type { AvatarState } from "@musasabi/avatar-2d";
import { AVATAR_EVENTS } from "@musasabi/shared";
import type { MusasabiWindowApi } from "./musasabi-window";

// Tauri移行(docs/ARCHITECTURE.md 第0.2章・第4.2章)。Electron時代は
// apps/desktop/src/callOrchestrator.ts がメインプロセス側でこの配線を担っていたが、
// @musasabi/* の各パッケージはOS依存のないフレームワーク非依存ロジックなので、
// Tauriのメインウィンドウ(通常のWebViewコンテキスト)から直接呼び出せる。
// Node/Electron特権プロセスを介す必要がなくなったため、IPC相当の層はここに一本化した。

const fileMakerAdapter = new filemaker.MockFileMakerAdapter();
fileMakerAdapter.seed("Leads", [
  { Name: "田中太郎", Company: "株式会社アクメ", Status: "New", PriorityScore: 85 },
  { Name: "佐藤花子", Company: "サンプル商事", Status: "Negotiating", PriorityScore: 70 },
  { Name: "鈴木一郎", Company: "テスト工業", Status: "Interested", PriorityScore: 55 },
]);

async function getLeads(): Promise<Lead[]> {
  const records = await fileMakerAdapter.find({ layout: "Leads", query: [] });
  return records.map((record) => filemaker.fromFileMakerRecord(record));
}

const SAMPLE_TRANSCRIPT: TranscriptSegment[] = [
  { speaker: "rep", text: "本日はお時間をいただきありがとうございます", timestampMs: 0, durationMs: 4000 },
  { speaker: "customer", text: "少し予算的に高いですね", timestampMs: 4000, durationMs: 3000 },
  { speaker: "rep", text: "他社の事例もご案内しながら検討します", timestampMs: 7000, durationMs: 3000 },
  { speaker: "customer", text: "興味があります、進めてください", timestampMs: 10000, durationMs: 3000 },
];

const ttsProvider = new MockTtsProvider();

const AVATAR_STATE_RESPONSE_TIMEOUT_MS = 3000;

/**
 * MUSAアバターオーバーレイウィンドウ(avatar.html/avatarMain.ts)へ状態遷移を要求し、
 * アバター側が検証・適用した実際の状態が返るまで待つ。AvatarStateMachineの単一の
 * 正本インスタンスはアバターウィンドウ側にあるため、Tauriのイベントで往復する。
 */
async function setAvatarState(state: AvatarState): Promise<AvatarState> {
  if (!isAvatarState(state)) {
    throw new Error(`Unknown avatar state: ${state}`);
  }
  const { emit, once } = await import("@tauri-apps/api/event");
  return new Promise<AvatarState>((resolve, reject) => {
    let unlisten: (() => void) | undefined;
    const timeout = setTimeout(() => {
      // アバターウィンドウが応答しない場合、登録済みのリスナーを解除しておかないと
      // 次にどこかで stateChanged が発火した際に古いPromiseへ届こうとし続け、
      // リスナーが永久に残り続けてしまう(長時間起動するデスクトップアプリでの
      // リーク要因になる)。
      unlisten?.();
      reject(new Error("avatar window did not respond to setAvatarState"));
    }, AVATAR_STATE_RESPONSE_TIMEOUT_MS);

    once<AvatarState>(AVATAR_EVENTS.stateChanged, (event) => {
      clearTimeout(timeout);
      resolve(event.payload);
    })
      .then((unlistenFn) => {
        unlisten = unlistenFn;
        return emit(AVATAR_EVENTS.setState, state);
      })
      .catch((error) => {
        clearTimeout(timeout);
        unlisten?.();
        reject(error);
      });
  });
}

function resolveAvatarStateForSentiment(
  sentiment: CallAnalysisSummary["overallSentiment"],
): AvatarState {
  if (sentiment === "positive") return "goal_achieved";
  if (sentiment === "negative") return "preparing_call";
  return "working";
}

function buildMusasabiApi(): MusasabiWindowApi {
  return {
    async getAppVersion() {
      const { getVersion } = await import("@tauri-apps/api/app");
      return getVersion();
    },
    setAvatarState,
    getLeads,
    async runDemoCallAnalysis(): Promise<CallAnalysisSummary> {
      const summary = generateCallSummary("demo-call-001", SAMPLE_TRANSCRIPT);
      // アバター表示への反映は付随的な演出であり、分析結果そのものではない。
      // アバターウィンドウの起動待ちなどで同期が失敗しても、既に計算済みの
      // 分析結果は呼び出し元に返す(Electron版は同一プロセス内の同期処理だった
      // ため失敗し得なかったが、Tauri版はウィンドウ間のイベント往復になったため
      // タイムアウトし得る)。
      try {
        await setAvatarState(resolveAvatarStateForSentiment(summary.overallSentiment));
      } catch (error) {
        console.warn("avatar state sync failed after demo call analysis", error);
      }
      return summary;
    },
    async speakCoachingMessage(text: string) {
      const result = await ttsProvider.synthesize(text);
      return { durationMs: result.durationMs, visemeCount: result.visemes.length };
    },
  };
}

/**
 * Tauriアプリ内(メインウィンドウ)で実行されている場合のみ `window.musasabi` を設定する。
 * ブラウザ単体の `vite dev` ではTauriのJS APIが存在しないため、既存のモックデータへの
 * フォールバック(App.tsx参照)がそのまま機能する。
 */
export function installDesktopBridge(): void {
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
    return;
  }
  window.musasabi = buildMusasabiApi();
}
