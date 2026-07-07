// Brain Memory Engine(Development Bible 第9章)。短期/長期/業務/ユーザー/会社/
// プロジェクトの6分類で全ての行動を記録する。保存はローカルのみ・外部送信なし。

export * from "./types";
export {
  MemoryEngine,
  SHORT_TERM_RETENTION_MS,
  DEFAULT_MAX_RECORDS,
  type RecordInput,
} from "./MemoryEngine";
export { serializeMemory, parseMemory, MEMORY_SCHEMA_VERSION } from "./persistence";
