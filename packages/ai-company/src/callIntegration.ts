import type { AutoCallGate, CallMode } from "@musasabi/call-training";
import { canEnableAutoCall } from "@musasabi/call-training";
import type { AIEmployee } from "./types";

// Learning/Test/AutoCall 三段階運用をAI社員モデルへ統合する(D-20260706-001 実装指示4)。
// AI社員ごとにコール研修の進捗を持ち、進捗に応じて利用できるモードを決定論的に判定する。
// AutoCall は全安全ゲート充足が前提で、現フェーズでは本番実行しない(D-20260705-003)。

/** AI社員ごとのコール研修進捗。 */
export interface EmployeeCallProgress {
  employeeId: string;
  /** Learning Mode の基礎学習を完了したか。 */
  learningCompleted: boolean;
  /** Test Mode で合格基準を満たしたテストコール数。 */
  passedTestCalls: number;
  /** Test Mode の合格基準(この数の合格で AutoCall 候補になる)。 */
  requiredTestCalls: number;
}

/** 初期進捗(未学習)を作る。 */
export function initialCallProgress(
  employeeId: string,
  requiredTestCalls = 3,
): EmployeeCallProgress {
  return { employeeId, learningCompleted: false, passedTestCalls: 0, requiredTestCalls };
}

/** Test Mode の合格基準を満たしているか。 */
export function hasPassedTestCriteria(progress: EmployeeCallProgress): boolean {
  return progress.learningCompleted && progress.passedTestCalls >= progress.requiredTestCalls;
}

/**
 * AI社員が現在利用できるコールモードを返す。
 * - learning: 常に利用可能(全AI社員が学習できる)
 * - test: Learning 完了後に利用可能
 * - autocall: 合格基準充足 かつ 全安全ゲート充足 の場合のみ(現フェーズでは充足しない)
 */
export function allowedCallModes(
  progress: EmployeeCallProgress,
  satisfiedGates: readonly AutoCallGate[] = [],
): CallMode[] {
  const modes: CallMode[] = ["learning"];
  if (progress.learningCompleted) {
    modes.push("test");
  }
  if (hasPassedTestCriteria(progress) && canEnableAutoCall(satisfiedGates)) {
    modes.push("autocall");
  }
  return modes;
}

/**
 * AI社員の推奨コールモード(利用可能なうち最も進んだ段階)。
 * UI の既定選択・状態表示に使う。
 */
export function recommendedCallMode(
  progress: EmployeeCallProgress,
  satisfiedGates: readonly AutoCallGate[] = [],
): CallMode {
  const modes = allowedCallModes(progress, satisfiedGates);
  return modes[modes.length - 1];
}

/**
 * コール研修中のAI社員の稼働状態を返す(状態遷移の決定論的ヘルパー)。
 * learning/test 中は training、通話セッション中は on_call。
 */
export function stateDuringCall(mode: CallMode, inSession: boolean): AIEmployee["state"] {
  if (inSession) {
    return "on_call";
  }
  return mode === "autocall" ? "working" : "training";
}
