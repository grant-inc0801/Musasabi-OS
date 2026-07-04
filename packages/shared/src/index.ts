// IPC プロトコル・型定義・共通ユーティリティを置く場所。
export const IPC_CHANNELS = {
  avatarSetState: "musasabi:avatar:setState",
  avatarStateChanged: "musasabi:avatar:stateChanged",
  getAppVersion: "musasabi:getAppVersion",
  getLeads: "musasabi:sales:getLeads",
  runDemoCallAnalysis: "musasabi:voice:runDemoCallAnalysis",
  speakCoachingMessage: "musasabi:voice:speakCoachingMessage",
} as const;
