import type { AutomationRoutine, RecordedStep } from "./types";

// 操作記録(手動オプトイン)。start() してから stop() するまでの間のみ
// record() を受け付ける。決定的・イミュータブル志向で、UI側の副作用は持たない。

export class RoutineRecorder {
  private recording = false;
  private steps: RecordedStep[] = [];
  private startedAtMs = 0;

  get isRecording(): boolean {
    return this.recording;
  }

  get stepCount(): number {
    return this.steps.length;
  }

  /** 記録を開始する(明示操作)。既に記録中なら何もしない。 */
  start(nowMs: number): void {
    if (this.recording) return;
    this.recording = true;
    this.steps = [];
    this.startedAtMs = nowMs;
  }

  /** 操作を1件記録する。記録中でなければ無視する(常時記録の防止)。 */
  record(step: RecordedStep): void {
    if (!this.recording) return;
    // 同一ページへの連続遷移は1件に畳む(再実行時の無駄を減らす=改善)。
    const last = this.steps[this.steps.length - 1];
    if (last && last.kind === step.kind && last.target === step.target) return;
    this.steps.push({ ...step });
  }

  /**
   * 記録を終了しルーチンを返す。1件も記録がなければ null。
   * 返却後は内部状態をリセットする。
   */
  stop(name: string, nowMs: number): AutomationRoutine | null {
    if (!this.recording) return null;
    this.recording = false;
    const steps = this.steps;
    this.steps = [];
    if (steps.length === 0) return null;
    return {
      id: `routine-${this.startedAtMs}-${steps.length}`,
      name: name.trim() === "" ? `ルーチン(${steps.length}操作)` : name.trim(),
      steps,
      createdAtMs: nowMs,
      runCount: 0,
    };
  }
}

/** 再実行1回分を反映した新しいルーチン(イミュータブル)。 */
export function markRoutineRun(routine: AutomationRoutine): AutomationRoutine {
  return { ...routine, runCount: routine.runCount + 1 };
}
