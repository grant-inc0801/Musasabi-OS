import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CONNECTORS,
  CONNECTOR_CATEGORY_LABEL_JA,
  getConnector,
  evaluateOperation,
  MockConnectorAdapter,
  mockRead,
  toAuditEntry,
  appendAudit,
  summarizeConnectors,
  type ConnectorDescriptor,
  type AuditEntry,
} from "./index";

test("優先6カテゴリのコネクタが定義されている", () => {
  const cats = CONNECTORS.map((c) => c.category);
  for (const c of ["github", "office_excel", "calendar", "zoom_phone", "filemaker", "accounting"] as const) {
    assert.ok(cats.includes(c), `${c} が必要`);
    assert.ok(CONNECTOR_CATEGORY_LABEL_JA[c]);
  }
});

test("初期状態はすべて Mock かつ本番未承認", () => {
  for (const c of CONNECTORS) {
    assert.equal(c.mode, "mock", `${c.id} は mock 既定`);
    assert.equal(c.productionApproved, false, `${c.id} は本番未承認`);
    assert.ok(c.capabilities.includes("read"), `${c.id} は read を持つ`);
  }
});

test("Zoom Phone は読み取り専用(write 非対応)", () => {
  const zoom = getConnector("zoom_phone");
  assert.ok(zoom);
  assert.deepEqual([...zoom.capabilities], ["read"]);
});

test("mock モードでは read/write とも許可・effect は simulated", () => {
  const gh = getConnector("github")!;
  assert.deepEqual(evaluateOperation(gh, "read"), { allowed: true, effect: "simulated" });
  assert.deepEqual(evaluateOperation(gh, "write"), { allowed: true, effect: "simulated" });
});

test("未対応の操作は却下(blocked)", () => {
  const zoom = getConnector("zoom_phone")!;
  const d = evaluateOperation(zoom, "write");
  assert.equal(d.allowed, false);
  assert.equal(d.effect, "blocked");
});

test("production は未承認だと read/write とも却下", () => {
  const prod: ConnectorDescriptor = { ...getConnector("github")!, mode: "production", productionApproved: false };
  assert.equal(evaluateOperation(prod, "read").allowed, false);
  assert.equal(evaluateOperation(prod, "write").allowed, false);
});

test("production 承認済みでも write は承認情報が必須", () => {
  const prod: ConnectorDescriptor = { ...getConnector("github")!, mode: "production", productionApproved: true };
  assert.equal(evaluateOperation(prod, "read").allowed, true); // 読み取りは承認のみでOK
  assert.equal(evaluateOperation(prod, "write").allowed, false); // 承認情報なし → 却下
  const okWrite = evaluateOperation(prod, "write", { approvedBy: "CEO", reason: "月次連携" });
  assert.equal(okWrite.allowed, true);
  assert.equal(okWrite.effect, "production");
});

test("MockConnectorAdapter.read は決定論データを返す", () => {
  const adapter = new MockConnectorAdapter(getConnector("accounting")!);
  const r = adapter.read("2026-07");
  assert.equal(r.ok, true);
  assert.equal(r.effect, "simulated");
  assert.deepEqual((r.data as { revenue: number }).revenue, 1250000);
});

test("MockConnectorAdapter.write はシミュレート(実システム無影響)", () => {
  const adapter = new MockConnectorAdapter(getConnector("filemaker")!);
  const r = adapter.write("Customers", { name: "新規商店" });
  assert.equal(r.ok, true);
  assert.equal(r.effect, "simulated");
  assert.match(r.message, /シミュレート/);
});

test("read 専用コネクタへの write は adapter でも失敗", () => {
  const adapter = new MockConnectorAdapter(getConnector("zoom_phone")!);
  const r = adapter.write("calls", {});
  assert.equal(r.ok, false);
});

test("mockRead はカテゴリごとに異なるデータ形状を返す", () => {
  assert.ok((mockRead(getConnector("github")!, "") as { openIssues: number }).openIssues >= 0);
  assert.ok((mockRead(getConnector("calendar")!, "") as { events: unknown[] }).events.length >= 1);
});

test("監査ログは追記され最新が先頭", () => {
  const adapter = new MockConnectorAdapter(getConnector("github")!);
  let log: AuditEntry[] = [];
  log = appendAudit(log, toAuditEntry(adapter.read("issues"), 1000));
  log = appendAudit(log, toAuditEntry(adapter.write("issues", {}), 2000));
  assert.equal(log.length, 2);
  assert.equal(log[0].timestampMs, 2000);
  assert.equal(log[0].operation, "write");
  assert.equal(log[1].operation, "read");
});

test("summarizeConnectors は集計を返す", () => {
  const s = summarizeConnectors();
  assert.equal(s.total, CONNECTORS.length);
  assert.equal(s.mockCount, CONNECTORS.length); // 全て mock
  assert.equal(s.productionApprovedCount, 0); // 本番未承認
  assert.equal(s.readOnlyCount, 1); // zoom_phone のみ
  assert.ok(s.writeCapableCount >= 4);
});
