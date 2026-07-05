// 初回セットアップ(Phase β-002 優先順位①)の状態管理ロジック。
// 決定論的な純粋関数として実装し(Development Bible: 決定論的挙動を優先)、
// 永続化(localStorage / Tauri store)や UI からは分離する。実 credential は
// ここでは一切扱わない(セットアップの進捗フラグのみ)。

/** 初回セットアップのステップ識別子。順序は SETUP_STEPS で定義する。 */
export type SetupStepId = "welcome" | "avatar" | "integrations" | "done";

/** 初回セットアップの実行順。nextIncompleteStep はこの順で最初の未完了を返す。 */
export const SETUP_STEPS: readonly SetupStepId[] = ["welcome", "avatar", "integrations", "done"];

export interface SetupState {
  /** 完了済みステップの集合。順不同で保持する。 */
  completedSteps: SetupStepId[];
}

/** まだ何も完了していない初期状態。 */
export function initialSetupState(): SetupState {
  return { completedSteps: [] };
}

/** 指定ステップが完了済みかを判定する。 */
export function isStepComplete(state: SetupState, step: SetupStepId): boolean {
  return state.completedSteps.includes(step);
}

/**
 * SETUP_STEPS の順で最初の未完了ステップを返す。すべて完了していれば null。
 * ウィザードが「次にどの画面を出すか」を決めるのに使う。
 */
export function nextIncompleteStep(state: SetupState): SetupStepId | null {
  for (const step of SETUP_STEPS) {
    if (!isStepComplete(state, step)) {
      return step;
    }
  }
  return null;
}

/** SETUP_STEPS のすべてが完了しているか(=初回セットアップ完了)。 */
export function isSetupComplete(state: SetupState): boolean {
  return nextIncompleteStep(state) === null;
}

/**
 * ステップを完了済みにした新しい state を返す(元の state は変更しない)。
 * 既に完了済みなら同一内容の新オブジェクトを返す(冪等)。
 */
export function markStepComplete(state: SetupState, step: SetupStepId): SetupState {
  if (isStepComplete(state, step)) {
    return { completedSteps: [...state.completedSteps] };
  }
  return { completedSteps: [...state.completedSteps, step] };
}

/**
 * 永続化された不明な値から SetupState を安全に復元する。壊れた/古いデータは
 * 無視して初期状態にフォールバックし、未知のステップ識別子は捨てる。
 */
export function parseSetupState(raw: unknown): SetupState {
  if (typeof raw !== "object" || raw === null || !("completedSteps" in raw)) {
    return initialSetupState();
  }
  const candidate = (raw as { completedSteps: unknown }).completedSteps;
  if (!Array.isArray(candidate)) {
    return initialSetupState();
  }
  const valid = candidate.filter(
    (step): step is SetupStepId => typeof step === "string" && SETUP_STEPS.includes(step as SetupStepId),
  );
  // 重複を除去して安定させる。
  return { completedSteps: [...new Set(valid)] };
}
