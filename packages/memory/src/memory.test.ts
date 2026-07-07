import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_MAX_RECORDS,
  MemoryEngine,
  SHORT_TERM_RETENTION_MS,
  parseMemory,
  serializeMemory,
} from "./index";

const T0 = 1_751_800_000_000;

function seeded(): MemoryEngine {
  const engine = new MemoryEngine();
  engine.record({
    category: "work",
    actor: "MUSA-101",
    action: "テストコール開始",
    detail: "顧客A 想定シナリオ",
    tags: ["call", "test-mode"],
    nowMs: T0,
  });
  engine.record({
    category: "short_term",
    actor: "MUSA-101",
    action: "指摘を受領",
    detail: "クロージングが弱い",
    nowMs: T0 + 1_000,
  });
  engine.record({
    category: "user",
    actor: "user",
    action: "アバターサイズ変更",
    nowMs: T0 + 2_000,
  });
  return engine;
}

test("record は入力から完全なレコードを生成し保持する", () => {
  const engine = new MemoryEngine();
  const rec = engine.record({
    category: "company",
    actor: "system",
    action: "プラグイン有効化",
    tags: ["plugin"],
    nowMs: T0,
  });
  assert.equal(rec.category, "company");
  assert.equal(rec.detail, "");
  assert.deepEqual(rec.tags, ["plugin"]);
  assert.ok(rec.id.startsWith("mem-"));
  assert.equal(engine.size, 1);
});

test("query は分類・行動主体・時刻・テキストで絞り込み新しい順に返す", () => {
  const engine = seeded();
  const all = engine.query();
  assert.equal(all.length, 3);
  assert.equal(all[0].action, "アバターサイズ変更"); // 新しい順

  assert.equal(engine.query({ category: "work" }).length, 1);
  assert.equal(engine.query({ actor: "user" }).length, 1);
  assert.equal(engine.query({ sinceMs: T0 + 1_000 }).length, 2);
  // detail への部分一致(小文字比較)
  assert.equal(engine.query({ text: "クロージング" })[0].action, "指摘を受領");
  assert.equal(engine.query({ text: "TEST-MODE" }).length, 1); // タグにも一致
});

test("query の limit は新しい順の先頭から適用される", () => {
  const engine = seeded();
  const limited = engine.query({ limit: 2 });
  assert.equal(limited.length, 2);
  assert.equal(limited[0].action, "アバターサイズ変更");
});

test("countByCategory は6分類すべての件数を返す", () => {
  const counts = seeded().countByCategory();
  assert.equal(counts.work, 1);
  assert.equal(counts.short_term, 1);
  assert.equal(counts.user, 1);
  assert.equal(counts.long_term, 0);
  assert.equal(counts.company, 0);
  assert.equal(counts.project, 0);
});

test("prune は保持期間を過ぎた短期メモリのみ破棄する", () => {
  const engine = seeded();
  // 短期(T0+1000)だけが期限切れになる時刻
  const now = T0 + 1_000 + SHORT_TERM_RETENTION_MS + 1;
  const dropped = engine.prune(now);
  assert.equal(dropped, 1);
  assert.equal(engine.size, 2);
  assert.equal(engine.query({ category: "short_term" }).length, 0);
  // 業務・ユーザーは保持される
  assert.equal(engine.query({ category: "work" }).length, 1);
});

test("最大保持件数を超えると古いものから破棄される", () => {
  const engine = new MemoryEngine([], 3);
  for (let i = 0; i < 5; i += 1) {
    engine.record({ category: "work", actor: "system", action: `行動${i}`, nowMs: T0 + i });
  }
  assert.equal(engine.size, 3);
  const actions = engine.query().map((r) => r.action);
  assert.deepEqual(actions, ["行動4", "行動3", "行動2"]);
  assert.ok(DEFAULT_MAX_RECORDS > 3);
});

test("serializeMemory / parseMemory の往復でレコードが保持される", () => {
  const engine = seeded();
  const json = serializeMemory(engine.toRecords());
  const restored = new MemoryEngine(parseMemory(json));
  assert.equal(restored.size, 3);
  assert.deepEqual(restored.toRecords(), engine.toRecords());
});

test("parseMemory は壊れたJSONや不正な要素を安全に捨てる", () => {
  assert.deepEqual(parseMemory("{broken"), []);
  assert.deepEqual(parseMemory(null), []);
  assert.deepEqual(parseMemory({ records: "not-array" }), []);
  const mixed = {
    version: 1,
    records: [
      {
        id: "mem-1",
        category: "work",
        actor: "system",
        action: "有効",
        detail: "",
        timestampMs: T0,
        tags: [],
      },
      { id: "mem-2", category: "invalid-category", actor: "system" },
      { garbage: true },
    ],
  };
  const parsed = parseMemory(mixed);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, "mem-1");
});
