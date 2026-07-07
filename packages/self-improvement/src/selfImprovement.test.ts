import assert from "node:assert/strict";
import { test } from "node:test";

import type { MemoryRecord } from "@musasabi/memory";
import { PROMOTION_THRESHOLD, promoteRepeatedShortTerm } from "./index";

const T0 = 1_752_100_000_000;

function rec(
  id: string,
  category: MemoryRecord["category"],
  action: string,
  detail: string,
  at: number,
  tags: string[] = [],
): MemoryRecord {
  return { id, category, actor: "user", action, detail, timestampMs: at, tags };
}

test("同一 action が閾値以上繰り返された短期メモリは長期へ昇格される", () => {
  const records = [
    rec("m1", "short_term", "トーク指摘を登録", "クロージングを丁寧に", T0),
    rec("m2", "short_term", "トーク指摘を登録", "事例から切り返す", T0 + 1_000),
    rec("m3", "short_term", "別の行動", "1回だけ", T0 + 2_000),
    rec("m4", "work", "テストコール開始", "", T0 + 3_000),
  ];
  const result = promoteRepeatedShortTerm(records);
  assert.equal(result.promoted.length, 1);
  const p = result.promoted[0];
  assert.equal(p.category, "long_term");
  assert.ok(p.action.includes("トーク指摘を登録"));
  assert.ok(p.detail.includes("2回繰り返された"));
  assert.ok(p.detail.includes("クロージングを丁寧に"));
  assert.ok(p.tags.includes("promoted:トーク指摘を登録"));
  assert.deepEqual(result.sourceIds, ["m1", "m2"]);
  assert.ok(PROMOTION_THRESHOLD >= 2);
});

test("既に昇格済みの action は二重昇格されない", () => {
  const records = [
    rec("m1", "short_term", "トーク指摘を登録", "A", T0),
    rec("m2", "short_term", "トーク指摘を登録", "B", T0 + 1_000),
    rec("L1", "long_term", "学習事項に昇格: トーク指摘を登録", "既存", T0 + 2_000, [
      "self-improvement",
      "promoted:トーク指摘を登録",
    ]),
  ];
  const result = promoteRepeatedShortTerm(records);
  assert.equal(result.promoted.length, 0);
});

test("閾値未満・短期以外は昇格されない", () => {
  const records = [
    rec("m1", "short_term", "トーク指摘を登録", "1回のみ", T0),
    rec("m2", "work", "テストコール開始", "", T0 + 1_000),
    rec("m3", "work", "テストコール開始", "", T0 + 2_000),
  ];
  const result = promoteRepeatedShortTerm(records);
  assert.equal(result.promoted.length, 0);
  assert.deepEqual(result.sourceIds, []);
});

test("決定的: 同じ入力からは同じ結果", () => {
  const records = [
    rec("m1", "short_term", "指摘", "A", T0),
    rec("m2", "short_term", "指摘", "B", T0 + 1_000),
  ];
  assert.deepEqual(promoteRepeatedShortTerm(records), promoteRepeatedShortTerm(records));
});
