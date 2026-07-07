import { MemoryEngine, parseMemory, serializeMemory } from "@musasabi/memory";
import type { MemoryCategory, MemoryRecord } from "@musasabi/memory";
import { appLogger } from "./appLogger";

// Brain Memory のローカル永続化(この端末のlocalStorageのみ。外部送信なし)。
// 「全ての行動はMemoryに保存」(Development Bible 第9章)— 各画面の操作を
// recordMemory() で記録する。エンジン本体は @musasabi/memory(テスト済み)。

const STORAGE_KEY = "musasabi.memory";

function loadEngine(): MemoryEngine {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const engine = new MemoryEngine(raw === null ? [] : parseMemory(raw));
    engine.prune(Date.now());
    return engine;
  } catch (error) {
    appLogger.warn("failed to load memory; starting empty", { error: String(error) });
    return new MemoryEngine();
  }
}

/** 行動を1件記録して保存する。失敗しても業務を止めない(warnのみ)。 */
export function recordMemory(input: {
  category: MemoryCategory;
  actor: string;
  action: string;
  detail?: string;
  tags?: string[];
}): void {
  try {
    const engine = loadEngine();
    engine.record({ ...input, nowMs: Date.now() });
    localStorage.setItem(STORAGE_KEY, serializeMemory(engine.toRecords()));
  } catch (error) {
    appLogger.warn("failed to record memory", { error: String(error) });
  }
}

/** 表示用: 現在のMemory全件(新しい順)。 */
export function loadMemoryRecords(): MemoryRecord[] {
  return loadEngine().toRecords();
}
