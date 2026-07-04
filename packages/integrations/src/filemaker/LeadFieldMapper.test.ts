import { test } from "node:test";
import * as assert from "node:assert/strict";
import { fromFileMakerRecord, toFileMakerFieldData } from "./LeadFieldMapper";
import type { FileMakerRecord } from "./types";

function record(fieldData: FileMakerRecord["fieldData"]): FileMakerRecord {
  return { recordId: "42", modId: "0", fieldData };
}

test("maps a FileMaker record to a Lead using default field mapping", () => {
  const lead = fromFileMakerRecord(
    record({
      Name: "田中太郎",
      Company: "アクメ",
      Status: "Negotiating",
      PriorityScore: 80,
      LastContactedAt: "2026-07-03T00:00:00Z",
      NextCallbackAt: "",
    }),
  );

  assert.equal(lead.id, "42");
  assert.equal(lead.name, "田中太郎");
  assert.equal(lead.status, "negotiating");
  assert.equal(lead.priorityScore, 80);
  assert.equal(lead.lastContactedAt, "2026-07-03T00:00:00Z");
  assert.equal(lead.nextCallbackAt, null);
});

test("throws on an unmapped status value instead of silently defaulting", () => {
  assert.throws(
    () => fromFileMakerRecord(record({ Name: "X", Company: "Y", Status: "SomeUnknownStatus" })),
    /unknown status/,
  );
});

test("round-trips status and priorityScore through toFileMakerFieldData", () => {
  const fieldData = toFileMakerFieldData({ status: "appointment", priorityScore: 90 });
  assert.equal(fieldData.Status, "Appointment");
  assert.equal(fieldData.PriorityScore, 90);
});

test("toFileMakerFieldData omits fields that were not provided", () => {
  const fieldData = toFileMakerFieldData({ name: "田中太郎" });
  assert.deepEqual(Object.keys(fieldData), ["Name"]);
});

test("toFileMakerFieldData throws rather than silently dropping Status for an incomplete custom statusMapping", () => {
  const incompleteMapping = { New: "new" as const }; // "lost" 等が未定義
  assert.throws(
    () => toFileMakerFieldData({ status: "lost" }, undefined, incompleteMapping),
    /No FileMaker status mapping/,
  );
});
