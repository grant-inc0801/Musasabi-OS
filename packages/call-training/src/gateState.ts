import type { AutoCallGate } from "./types";
import { AUTOCALL_GATES } from "./types";

// AutoCall 安全ゲートの充足状態管理(承認済みフェーズ計画: ゲート管理)。
// 管理者はUIからゲートを個別に充足/解除できるが、`real_account_link`
// (実アカウント連携)は現フェーズでは未実装のためロック(充足不可)。
// ロックゲートが残る限り canPlaceRealCall は false のままで、
// 本番架電は構造的に有効化できない。

/** 充足操作がロックされているゲート(未実装のため充足不可)。 */
export const LOCKED_GATES: readonly AutoCallGate[] = ["real_account_link"];

export const LOCKED_GATE_REASON_JA = "実アカウント連携は未実装のため充足できません";

/** 各ゲートの充足状態。 */
export type GateState = Record<AutoCallGate, boolean>;

export const GATE_STATE_SCHEMA_VERSION = 1;

/** 全ゲート未充足の初期状態。 */
export function emptyGateState(): GateState {
  return Object.fromEntries(AUTOCALL_GATES.map((g) => [g, false])) as GateState;
}

export function isGateLocked(gate: AutoCallGate): boolean {
  return LOCKED_GATES.includes(gate);
}

/**
 * ゲートの充足状態を変更した新しい状態を返す(イミュータブル)。
 * ロックゲートを充足しようとした場合は Error(日本語)を投げる。解除は常に可。
 */
export function setGateSatisfied(state: GateState, gate: AutoCallGate, satisfied: boolean): GateState {
  if (satisfied && isGateLocked(gate)) {
    throw new Error(LOCKED_GATE_REASON_JA);
  }
  return { ...state, [gate]: satisfied };
}

/** 充足済みゲートの一覧(canPlaceRealCall / canEnableAutoCall へ渡す形)。 */
export function satisfiedGates(state: GateState): AutoCallGate[] {
  return AUTOCALL_GATES.filter((g) => state[g]);
}

export function serializeGateState(state: GateState): string {
  return JSON.stringify({ version: GATE_STATE_SCHEMA_VERSION, gates: state });
}

/**
 * 保存値から状態を復元する。壊れた値は初期状態にフォールバックし、
 * ロックゲートは保存値に関わらず必ず未充足へ矯正する(改ざん耐性)。
 */
export function parseGateState(value: unknown): GateState {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return emptyGateState();
    }
  }
  const gates = (value as { gates?: unknown } | null)?.gates;
  const state = emptyGateState();
  if (typeof gates !== "object" || gates === null) {
    return state;
  }
  for (const gate of AUTOCALL_GATES) {
    const v = (gates as Record<string, unknown>)[gate];
    if (typeof v === "boolean" && !isGateLocked(gate)) {
      state[gate] = v;
    }
  }
  return state;
}
