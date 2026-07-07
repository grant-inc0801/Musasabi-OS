// Automation Engine(Development Bible 第12章)。操作記録 → 再実行 → 改善。
// 記録は手動オプトイン(記録開始〜停止の間のみ)。対象はアプリ内操作のみで、
// 他アプリ・OS操作は記録しない。外部送信なし。

export * from "./types";
export { RoutineRecorder, markRoutineRun } from "./RoutineRecorder";
export {
  AUTOMATION_SCHEMA_VERSION,
  parseRoutines,
  serializeRoutines,
  upsertRoutine,
} from "./persistence";
