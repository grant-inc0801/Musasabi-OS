import type { AutomationRoutine, RecordedStep } from "./types";

// ルーチンのローカル永続化(JSON直列化・検証)。保存先はアプリ側(localStorage)。
// 壊れた要素は捨てる。外部送信はしない。

export const AUTOMATION_SCHEMA_VERSION = 1;

const MAX_ROUTINES = 50;

function isStep(value: unknown): value is RecordedStep {
  const v = value as RecordedStep;
  return (
    typeof v === "object" &&
    v !== null &&
    v.kind === "navigate" &&
    typeof v.target === "string" &&
    typeof v.label === "string" &&
    typeof v.timestampMs === "number"
  );
}

function isRoutine(value: unknown): value is AutomationRoutine {
  const v = value as AutomationRoutine;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    Array.isArray(v.steps) &&
    v.steps.length > 0 &&
    v.steps.every(isStep) &&
    typeof v.createdAtMs === "number" &&
    typeof v.runCount === "number"
  );
}

export function serializeRoutines(routines: readonly AutomationRoutine[]): string {
  return JSON.stringify({ version: AUTOMATION_SCHEMA_VERSION, routines });
}

export function parseRoutines(value: unknown): AutomationRoutine[] {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  const routines = (value as { routines?: unknown } | null)?.routines;
  if (!Array.isArray(routines)) {
    return [];
  }
  return routines.filter(isRoutine).slice(0, MAX_ROUTINES);
}

/** ルーチンを追加(同IDは置換)し、新しい順で最大件数に収める。 */
export function upsertRoutine(
  routines: readonly AutomationRoutine[],
  routine: AutomationRoutine,
): AutomationRoutine[] {
  const rest = routines.filter((r) => r.id !== routine.id);
  return [routine, ...rest].slice(0, MAX_ROUTINES);
}
