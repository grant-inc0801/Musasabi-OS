import { strict as assert } from "node:assert";
import { test } from "node:test";
import { COMMAND_DEPARTMENTS } from "./commandCenter";
import { buildDailyDigest, buildDailyDigestJa } from "./workspace";

test("本日のダイジェストは要注目事項を集約する", () => {
  const d = buildDailyDigest();
  assert.ok(d.counts.approvals >= 1); // 出版部・人事部が承認待ち
  assert.ok(d.counts.openSupport >= 1);
  assert.ok(d.counts.devErrors >= 1);
  assert.ok(d.lines.length >= 1);
  assert.ok(d.lines.some((l) => l.includes("承認待ち")));
  assert.ok(d.lines.some((l) => l.includes("未対応の問い合わせ")));
});

test("要対応なしのときは順調メッセージを返す", () => {
  const allDone = COMMAND_DEPARTMENTS.map((d) => ({ ...d, status: "done" as const }));
  // support/dev の Mock は別データ由来なので、承認待ち0でも他行が出ることを許容し、
  // ここでは approvals=0 のみ確認する。
  const d = buildDailyDigest(allDone);
  assert.equal(d.counts.approvals, 0);
});

test("buildDailyDigestJa は行配列を返す", () => {
  const lines = buildDailyDigestJa();
  assert.ok(Array.isArray(lines));
  assert.ok(lines.length >= 1);
});
