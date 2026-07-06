import { test } from "node:test";
import * as assert from "node:assert/strict";
import { addWorkLogEntry, listWorkLogEntries, parseWorkLogEntries } from "./workLog";

test("addWorkLogEntry appends a trimmed entry immutably", () => {
  const e0 = addWorkLogEntry([], { departmentId: "dept-sales", text: "  切り返し集を整理  ", nowMs: 10 });
  assert.equal(e0.length, 1);
  assert.equal(e0[0].text, "切り返し集を整理");
  const e1 = addWorkLogEntry(e0, { departmentId: null, text: "全社: 日報の書き方統一", nowMs: 20 });
  assert.equal(e0.length, 1);
  assert.equal(e1.length, 2);
});

test("addWorkLogEntry ignores empty input", () => {
  assert.equal(addWorkLogEntry([], { departmentId: null, text: "   ", nowMs: 1 }).length, 0);
});

test("listWorkLogEntries filters by department and sorts newest first", () => {
  let entries = addWorkLogEntry([], { departmentId: "dept-sales", text: "a", nowMs: 1 });
  entries = addWorkLogEntry(entries, { departmentId: "dept-publishing", text: "b", nowMs: 2 });
  entries = addWorkLogEntry(entries, { departmentId: "dept-sales", text: "c", nowMs: 3 });
  const sales = listWorkLogEntries(entries, "dept-sales");
  assert.deepEqual(sales.map((e) => e.text), ["c", "a"]);
  assert.equal(listWorkLogEntries(entries).length, 3);
});

test("parseWorkLogEntries restores valid entries and drops garbage", () => {
  const valid = { id: "worklog-1-1", departmentId: null, text: "x", timestampMs: 1 };
  assert.equal(parseWorkLogEntries([valid, { bad: true }, "nope"]).length, 1);
  assert.deepEqual(parseWorkLogEntries("broken"), []);
});
