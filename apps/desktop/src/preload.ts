import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@musasabi/shared";
import type { AvatarState } from "@musasabi/avatar-2d";
import type { Lead } from "@musasabi/ai-core";
import type { CallAnalysisSummary } from "@musasabi/voice-analysis";

// レンダラープロセスに公開する最小限のAPI(Security Bible 第1章: 最小権限の原則)。
contextBridge.exposeInMainWorld("musasabi", {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.getAppVersion),
  setAvatarState: (state: AvatarState): Promise<AvatarState> =>
    ipcRenderer.invoke(IPC_CHANNELS.avatarSetState, state),
  getLeads: (): Promise<Lead[]> => ipcRenderer.invoke(IPC_CHANNELS.getLeads),
  runDemoCallAnalysis: (): Promise<CallAnalysisSummary> =>
    ipcRenderer.invoke(IPC_CHANNELS.runDemoCallAnalysis),
  speakCoachingMessage: (text: string): Promise<{ durationMs: number; visemeCount: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.speakCoachingMessage, text),
});
