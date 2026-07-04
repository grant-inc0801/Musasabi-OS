import type { AvatarState } from "@musasabi/avatar-2d";
import type { Lead } from "@musasabi/ai-core";
import type { CallAnalysisSummary } from "@musasabi/voice-analysis";

// apps/desktop/src/preload.ts が exposeInMainWorld する API の型。
// Electron外(ブラウザでの `vite dev` 等)で読み込まれた場合は undefined になりうるため、
// 利用側は必ず存在チェックを行う。
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
