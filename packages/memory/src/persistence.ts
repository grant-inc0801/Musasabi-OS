import type { MemoryRecord } from "./types";
import { MEMORY_CATEGORIES } from "./types";
import type { MemoryCategory } from "./types";

// Memory のローカル永続化(JSON直列化・検証)。保存先はアプリ側
// (localStorage / SQLite)。壊れた要素は捨てる。外部送信はしない。

export const MEMORY_SCHEMA_VERSION = 1;

function isRecord(value: unknown): value is MemoryRecord {
  const v = value as MemoryRecord;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.id === "string" &&
    MEMORY_CATEGORIES.includes(v.category as MemoryCategory) &&
    typeof v.actor === "string" &&
    typeof v.action === "string" &&
    typeof v.detail === "string" &&
    typeof v.timestampMs === "number" &&
    Array.isArray(v.tags) &&
    v.tags.every((t) => typeof t === "string")
  );
}

export function serializeMemory(records: readonly MemoryRecord[]): string {
  return JSON.stringify({ version: MEMORY_SCHEMA_VERSION, records });
}

export function parseMemory(value: unknown): MemoryRecord[] {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (typeof value !== "object" || value === null) {
    return [];
  }
  const records = (value as { records?: unknown }).records;
  if (!Array.isArray(records)) {
    return [];
  }
  return records.filter(isRecord);
}
