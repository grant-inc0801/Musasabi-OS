// 製品化フェーズ(Phase β-002 優先順位①)のログ管理基盤。
// フレームワーク非依存の純粋な TypeScript として実装し、Tauri/ブラウザいずれの
// WebView からも利用できる。将来、Tauri 側のファイル出力シンク(Rust の
// tauri-plugin-log 等)を LogSink として追加できるよう、出力先を差し替え可能にしている。

export type LogLevel = "debug" | "info" | "warn" | "error";

// 重大度の順序。minLevel によるフィルタリングに使う。
const LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface LogEntry {
  timestampMs: number;
  level: LogLevel;
  message: string;
  /** 任意の構造化コンテキスト(エラー内容・識別子など)。 */
  context?: Record<string, unknown>;
}

/** ログの出力先。console・メモリ・(将来の)ファイルなどを差し替え可能にする。 */
export interface LogSink {
  write(entry: LogEntry): void;
}

export interface LoggerOptions {
  /** これ未満の重大度のログは破棄する(既定: "info")。 */
  minLevel?: LogLevel;
  /** メモリ内リングバッファの保持件数(既定: 500)。 */
  bufferSize?: number;
  /** 追加の出力先。バッファとは別に、確定したログがそのまま渡される。 */
  sinks?: LogSink[];
  /** 現在時刻の取得関数(テスト用に差し替え可能。既定: Date.now)。 */
  now?: () => number;
}

const DEFAULT_BUFFER_SIZE = 500;

/**
 * メモリ内リングバッファ付きのロガー。直近 `bufferSize` 件を保持し、ログ画面
 * (Settings のログビューア)から参照できるようにする。`minLevel` 未満は破棄する。
 */
export class Logger {
  private readonly minSeverity: number;
  private readonly bufferSize: number;
  private readonly sinks: LogSink[];
  private readonly now: () => number;
  private readonly buffer: LogEntry[] = [];

  constructor(options: LoggerOptions = {}) {
    this.minSeverity = LEVEL_SEVERITY[options.minLevel ?? "info"];
    this.bufferSize = Math.max(1, options.bufferSize ?? DEFAULT_BUFFER_SIZE);
    this.sinks = options.sinks ?? [];
    this.now = options.now ?? Date.now;
  }

  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (LEVEL_SEVERITY[level] < this.minSeverity) {
      return;
    }
    const entry: LogEntry = { timestampMs: this.now(), level, message };
    if (context !== undefined) {
      entry.context = context;
    }
    this.buffer.push(entry);
    if (this.buffer.length > this.bufferSize) {
      // 最古の1件を捨ててリングバッファを維持する。
      this.buffer.shift();
    }
    for (const sink of this.sinks) {
      sink.write(entry);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log("error", message, context);
  }

  /** 保持中のログを古い順のコピーで返す(ログ画面表示用)。 */
  getEntries(): LogEntry[] {
    return [...this.buffer];
  }

  /** バッファを空にする(ログ画面の「クリア」操作用)。 */
  clear(): void {
    this.buffer.length = 0;
  }
}

/** ブラウザ/WebView の console にログを流すシンク。 */
export class ConsoleLogSink implements LogSink {
  write(entry: LogEntry): void {
    const line = `[${entry.level}] ${entry.message}`;
    // レベルに応じた console メソッドへ振り分ける。
    if (entry.level === "error") {
      console.error(line, entry.context ?? "");
    } else if (entry.level === "warn") {
      console.warn(line, entry.context ?? "");
    } else {
      console.log(line, entry.context ?? "");
    }
  }
}
