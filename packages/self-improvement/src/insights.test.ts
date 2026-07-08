import { strict as assert } from "node:assert";
import { test } from "node:test";
import type { MemoryRecord } from "@musasabi/memory";
import { buildEvolutionInsights } from "./insights";

function rec(partial: Partial<MemoryRecord>): MemoryRecord {
  return {
    id: partial.id ?? Math.random().toString(36),
    category: partial.category ?? "work",
    actor: partial.actor ?? "user",
    action: partial.action ?? "操作",
    detail: partial.detail ?? "",
    timestampMs: partial.timestampMs ?? 0,
    tags: partial.tags ?? [],
  };
}

test("頻出アクションと自動化候補を集計する", () => {
  const records = [
    rec({ action: "営業リストへ取り込み", actor: "user" }),
    rec({ action: "営業リストへ取り込み", actor: "user" }),
    rec({ action: "営業リストへ取り込み", actor: "user" }),
    rec({ action: "Excel出力", actor: "AI経理" }),
    rec({ action: "設定を変更", category: "user", actor: "user" }),
  ];
  const ins = buildEvolutionInsights(records, { threshold: 2 });
  assert.equal(ins.totalRecords, 5);
  assert.equal(ins.frequentActions[0].key, "営業リストへ取り込み");
  assert.equal(ins.frequentActions[0].count, 3);
  // work カテゴリで2回以上 → 自動化候補
  assert.ok(ins.automationCandidates.some((c) => c.key === "営業リストへ取り込み"));
  // config カテゴリは work ではないので候補外
  assert.ok(!ins.automationCandidates.some((c) => c.key === "設定を変更"));
});

test("短期/長期の内訳と稼働主体を集計する", () => {
  const records = [
    rec({ category: "short_term", actor: "MUSA-101" }),
    rec({ category: "long_term", actor: "MUSA-101" }),
    rec({ category: "work", actor: "user" }),
  ];
  const ins = buildEvolutionInsights(records);
  assert.equal(ins.shortTermCount, 1);
  assert.equal(ins.longTermCount, 1);
  assert.equal(ins.topActors[0].key, "MUSA-101");
  assert.equal(ins.topActors[0].count, 2);
});

test("空入力でも安全に空の集計を返す", () => {
  const ins = buildEvolutionInsights([]);
  assert.equal(ins.totalRecords, 0);
  assert.deepEqual(ins.frequentActions, []);
  assert.deepEqual(ins.automationCandidates, []);
});
