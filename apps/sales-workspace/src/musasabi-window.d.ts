import type { AvatarState } from "@musasabi/avatar-2d";
import type { Lead } from "@musasabi/ai-core";
import type { CallAnalysisSummary } from "@musasabi/voice-analysis";

// apps/sales-workspace/src/desktopBridge.ts がTauriアプリ内でのみ設定するAPIの型。
// デスクトップアプリ外(ブラウザでの `vite dev` 等)で読み込まれた場合は undefined に
// なりうるため、利用側は必ず存在チェックを行う。
export interface MusasabiWindowApi {
  getAppVersion(): Promise<string>;
  setAvatarState(state: AvatarState): Promise<AvatarState>;
  getLeads(): Promise<Lead[]>;
  runDemoCallAnalysis(): Promise<CallAnalysisSummary>;
  speakCoachingMessage(text: string): Promise<{ durationMs: number; visemeCount: number }>;
}

declare global {
  interface Window {
    musasabi?: MusasabiWindowApi;
  }
}
