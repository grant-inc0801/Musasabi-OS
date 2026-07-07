import { emptyGateState, parseGateState, serializeGateState } from "@musasabi/call-training";
import type { GateState } from "@musasabi/call-training";
import { appLogger } from "./appLogger";

// AutoCall 安全ゲート状態のローカル永続化(この端末のlocalStorageのみ)。
// 検証・ロックゲート矯正は @musasabi/call-training の gateState(テスト済み)に任せる。

const STORAGE_KEY = "musasabi.autocallGates";

export function loadGateState(): GateState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? emptyGateState() : parseGateState(raw);
  } catch (error) {
    appLogger.warn("failed to load gate state; starting empty", { error: String(error) });
    return emptyGateState();
  }
}

export function saveGateState(state: GateState): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeGateState(state));
  } catch (error) {
    appLogger.warn("failed to persist gate state", { error: String(error) });
  }
}
