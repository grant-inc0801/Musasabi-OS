import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  SCHEDULED_ROUTINES,
  SCHEDULE_FREQUENCIES,
  buildSchedulerSummary,
  filterRoutines,
} from "./scheduler";

test("スケジューラサマリーは頻度別件数と自動化数を集計する", () => {
  const s = buildSchedulerSummary();
  assert.equal(s.total, SCHEDULED_ROUTINES.length);
  assert.equal(s.daily + s.weekly + s.monthly, SCHEDULED_ROUTINES.filter((r) => r.frequency !== "随時").length);
  assert.equal(s.automated, SCHEDULED_ROUTINES.filter((r) => r.automated).length);
  assert.ok(s.automated >= 1);
});

test("filterRoutines は頻度で絞り込む", () => {
  const weekly = filterRoutines(SCHEDULED_ROUTINES, "毎週");
  assert.ok(weekly.length >= 1);
  assert.ok(weekly.every((r) => r.frequency === "毎週"));
  assert.equal(filterRoutines(SCHEDULED_ROUTINES, "all").length, SCHEDULED_ROUTINES.length);
});

test("全定例業務の頻度は定義済みの値", () => {
  for (const r of SCHEDULED_ROUTINES) {
    assert.ok(SCHEDULE_FREQUENCIES.includes(r.frequency));
    assert.ok(r.nextRun.length > 0);
  }
});
