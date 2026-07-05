import { Logger, ConsoleLogSink } from "@musasabi/shared";

// アプリ全体で共有するロガー(Phase β-002 優先順位①)。
// 現状は console 出力のみ。将来 Tauri 内で動作している場合は、Rust 側の
// ファイルログ(tauri-plugin-log)へ転送する LogSink をここに追加する。
export const appLogger = new Logger({
  minLevel: "debug",
  sinks: [new ConsoleLogSink()],
});
