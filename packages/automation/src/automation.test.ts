import assert from "node:assert/strict";
import { test } from "node:test";

import {
  RoutineRecorder,
  markRoutineRun,
  parseRoutines,
  serializeRoutines,
  upsertRoutine,
} from "./index";
import type { RecordedStep } from "./index";

const T0 = 1_752_000_000_000;

function step(target: string, label: string, at: number): RecordedStep {
  return { kind: "navigate", target, label, timestampMs: at };
}

test("記録開始前・停止後の操作は記録されない(常時記録の防止)", () => {
  const rec = new RoutineRecorder();
  rec.record(step("sales_kpi", "営業部 — KPI", T0)); // 開始前 → 無視
  assert.equal(rec.stepCount, 0);
  rec.start(T0);
  rec.record(step("sales_kpi", "営業部 — KPI", T0 + 1_000));
  const routine = rec.stop("朝の確認", T0 + 2_000);
  rec.record(step("plugins", "プラグイン", T0 + 3_000)); // 停止後 → 無視
  assert.equal(routine?.steps.length, 1);
  assert.equal(rec.stepCount, 0);
});

test("stop はルーチンを返し、名前が空なら既定名を付ける", () => {
  const rec = new RoutineRecorder();
  rec.start(T0);
  rec.record(step("sales_kpi", "営業部 — KPI", T0 + 1_000));
  rec.record(step("sales_brain", "営業部 — Sales Brain", T0 + 2_000));
  const routine = rec.stop("  ", T0 + 3_000);
  assert.ok(routine);
  assert.equal(routine.name, "ルーチン(2操作)");
  assert.equal(routine.runCount, 0);
  assert.equal(routine.steps[1].target, "sales_brain");
});

test("同一ページへの連続遷移は1件に畳まれる", () => {
  const rec = new RoutineRecorder();
  rec.start(T0);
  rec.record(step("sales_kpi", "営業部 — KPI", T0 + 1_000));
  rec.record(step("sales_kpi", "営業部 — KPI", T0 + 2_000));
  assert.equal(rec.stepCount, 1);
});

test("操作が1件もなければ stop は null を返す", () => {
  const rec = new RoutineRecorder();
  rec.start(T0);
  assert.equal(rec.stop("空", T0 + 1_000), null);
});

test("markRoutineRun は runCount を増やした新しいルーチンを返す", () => {
  const rec = new RoutineRecorder();
  rec.start(T0);
  rec.record(step("company_brain", "Company Brain", T0 + 1_000));
  const routine = rec.stop("確認", T0 + 2_000)!;
  const run = markRoutineRun(routine);
  assert.equal(run.runCount, 1);
  assert.equal(routine.runCount, 0); // 元は不変
});

test("serialize/parse の往復と upsert(同ID置換・新しい順)", () => {
  const rec = new RoutineRecorder();
  rec.start(T0);
  rec.record(step("sales_kpi", "営業部 — KPI", T0 + 1_000));
  const a = rec.stop("A", T0 + 2_000)!;
  let list = upsertRoutine([], a);
  list = upsertRoutine(list, markRoutineRun(a)); // 同ID → 置換
  assert.equal(list.length, 1);
  assert.equal(list[0].runCount, 1);
  const restored = parseRoutines(serializeRoutines(list));
  assert.deepEqual(restored, list);
});

test("parseRoutines は壊れた値・不正な要素を安全に捨てる", () => {
  assert.deepEqual(parseRoutines("{broken"), []);
  assert.deepEqual(parseRoutines(null), []);
  const mixed = {
    version: 1,
    routines: [
      {
        id: "routine-1",
        name: "正常",
        steps: [step("sales_kpi", "営業部 — KPI", T0)],
        createdAtMs: T0,
        runCount: 0,
      },
      { id: "routine-2", name: "steps空", steps: [], createdAtMs: T0, runCount: 0 },
      { garbage: true },
    ],
  };
  const parsed = parseRoutines(mixed);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, "routine-1");
});
