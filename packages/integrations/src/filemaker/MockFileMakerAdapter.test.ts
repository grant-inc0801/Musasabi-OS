import { test } from "node:test";
import * as assert from "node:assert/strict";
import { MockFileMakerAdapter } from "./MockFileMakerAdapter";
import { fromFileMakerRecord, toFileMakerFieldData } from "./LeadFieldMapper";

test("seed + find returns matching records only", async () => {
  const adapter = new MockFileMakerAdapter();
  adapter.seed("Leads", [
    { Name: "田中太郎", Company: "アクメ", Status: "New", PriorityScore: 50 },
    { Name: "佐藤花子", Company: "サンプル商事", Status: "New", PriorityScore: 60 },
  ]);

  const results = await adapter.find({ layout: "Leads", query: [{ Name: "田中" }] });
  assert.equal(results.length, 1);
  assert.equal(results[0].fieldData.Name, "田中太郎");
});

test("find with empty query returns all records on the layout", async () => {
  const adapter = new MockFileMakerAdapter();
  adapter.seed("Leads", [{ Name: "A", Company: "C", Status: "New", PriorityScore: 1 }]);
  const results = await adapter.find({ layout: "Leads", query: [] });
  assert.equal(results.length, 1);
});

test("create then update merges field data and bumps modId", async () => {
  const adapter = new MockFileMakerAdapter();
  const created = await adapter.create("Leads", { Name: "新規", Company: "C", Status: "New", PriorityScore: 10 });

  await adapter.update("Leads", created.recordId, { Status: "Contacted" });

  const [found] = await adapter.find({ layout: "Leads", query: [{ Name: "新規" }] });
  assert.equal(found.fieldData.Status, "Contacted");
  assert.equal(found.fieldData.Company, "C");
  assert.equal(found.modId, "1");
});

test("update throws for an unknown recordId", async () => {
  const adapter = new MockFileMakerAdapter();
  await assert.rejects(() => adapter.update("Leads", "nonexistent", { Status: "Lost" }), /not found/);
});

test("end-to-end: seed FileMaker-shaped data, find, map to Lead, map back, update", async () => {
  const adapter = new MockFileMakerAdapter();
  adapter.seed("Leads", [
    { Name: "鈴木一郎", Company: "テスト工業", Status: "Interested", PriorityScore: 55 },
  ]);

  const [record] = await adapter.find({ layout: "Leads", query: [] });
  const lead = fromFileMakerRecord(record);
  assert.equal(lead.status, "interested");

  const updatedFieldData = toFileMakerFieldData({ status: "negotiating" });
  await adapter.update("Leads", record.recordId, updatedFieldData);

  const [refetched] = await adapter.find({ layout: "Leads", query: [] });
  const updatedLead = fromFileMakerRecord(refetched);
  assert.equal(updatedLead.status, "negotiating");
});
