import { test } from "node:test";
import assert from "node:assert/strict";
import { MOCK_FINDINGS } from "./index";
import {
  AUDIT_LOG_EVENT_LABEL_JA,
  appendAuditLog,
  deriveAuditLog,
  type AuditLogEntry,
} from "./auditLog";

test("appendAuditLog は最新を先頭に追記(イミュータブル)", () => {
  const a: AuditLogEntry = { timestampMs: 1, eventType: "review_requested", actor: "AI監査", target: "d", detail: "x" };
  const b: AuditLogEntry = { timestampMs: 2, eventType: "approval", actor: "AI CEO", target: "d", detail: "y" };
  const log1 = appendAuditLog([], a);
  const log2 = appendAuditLog(log1, b);
  assert.equal(log2[0].timestampMs, 2);
  assert.equal(log2.length, 2);
  assert.equal(log1.length, 1); // 元は不変
});

test("deriveAuditLog は高/重大未是正で一時停止提案とエスカレーションを記録", () => {
  const log = deriveAuditLog(MOCK_FINDINGS);
  // f-01(high,reviewing) と f-03(critical,open) → 各2イベント = 4
  const pause = log.filter((e) => e.eventType === "pause_recommended");
  const esc = log.filter((e) => e.eventType === "escalation");
  assert.equal(pause.length, 2);
  assert.equal(esc.length, 2);
  assert.ok(esc.every((e) => e.detail.includes("エスカレーション") || e.target.includes("CEO")));
});

test("deriveAuditLog は未是正(中低)にレビュー要求、是正済みに是正記録", () => {
  const log = deriveAuditLog(MOCK_FINDINGS);
  // f-02, f-05 (medium open) → review_requested 2
  assert.equal(log.filter((e) => e.eventType === "review_requested").length, 2);
  // f-04 corrected → corrective_action 1
  assert.equal(log.filter((e) => e.eventType === "corrective_action").length, 1);
});

test("すべてのイベント種別にラベルがある", () => {
  const log = deriveAuditLog(MOCK_FINDINGS);
  for (const e of log) {
    assert.ok(AUDIT_LOG_EVENT_LABEL_JA[e.eventType], `${e.eventType} のラベル`);
  }
});

test("findingId が各エントリに紐づく", () => {
  const log = deriveAuditLog(MOCK_FINDINGS);
  assert.ok(log.every((e) => typeof e.findingId === "string"));
});
