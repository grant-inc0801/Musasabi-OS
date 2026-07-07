// IPC プロトコル・型定義・共通ユーティリティを置く場所。
//
// Tauri移行(docs/ARCHITECTURE.md 第0.2章・第4.2章)以前は、Electronのメイン
// プロセスとレンダラー間のIPCチャンネル名としてこれらの識別子を使っていた。
// Tauriでは@musasabi/*のビジネスロジックパッケージをWebView(メインウィンドウ)側から
// 直接呼び出せるため、getAppVersion/getLeads/runDemoCallAnalysis/speakCoachingMessageの
// ようなリクエスト/レスポンス用チャンネルは不要になった。唯一Rustを介した複数
// ウィンドウ間の連携が必要なMUSAアバターの状態同期だけが、Tauriのイベント名として
// 引き続き必要(apps/sales-workspace: メインウィンドウ⇔アバターオーバーレイウィンドウ)。
export const AVATAR_EVENTS = {
  setState: "musasabi://avatar/set-state",
  stateChanged: "musasabi://avatar/state-changed",
} as const;

// 製品化フェーズ(Phase β-002 優先順位①)の共通ユーティリティ。
export {
  Logger,
  ConsoleLogSink,
  type LogLevel,
  type LogEntry,
  type LogSink,
  type LoggerOptions,
} from "./logger";
export {
  SETUP_STEPS,
  initialSetupState,
  isStepComplete,
  nextIncompleteStep,
  isSetupComplete,
  markStepComplete,
  parseSetupState,
  type SetupStepId,
  type SetupState,
} from "./setupState";
export * from "./dataBackup";
