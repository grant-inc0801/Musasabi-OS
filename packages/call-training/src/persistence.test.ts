import { test } from "node:test";
import * as assert from "node:assert/strict";
import { MockCallAdapter } from "./MockCallAdapter";
import { startTestCall, addHumanTurn, endTestCall, addFeedback } from "./session";
import {
  serializeCallLog,
  parseCallLog,
  upsertSession,
  knowledgeFromSessions,
  callLogStats,
} from "./persistence";
import { TestCallRepository } from "./TestCallRepository";

const adapter = new MockCallAdapter();

function buildSession(contact: string, nowMs: number) {
  let s = startTestCall(contact, adapter, nowMs);
  s = addHumanTurn(s, "少し予算が高いですね", adapter, nowMs + 1000);
  s = addFeedback(s, { turnIndex: null, comment: "切り返しを丁寧に", category: "rebuttal", nowMs: nowMs + 2000 });
  return endTestCall(s, nowMs + 3000);
}

test("serialize/parse round-trips sessions", () => {
  const a = buildSession("テスト太郎", 1000);
  const b = buildSession("テスト花子", 2000);
  const parsed = parseCallLog(serializeCallLog([a, b]));
  assert.deepEqual(parsed, [a, b]);
});

test("parseCallLog drops garbage and survives broken JSON", () => {
  assert.deepEqual(parseCallLog("{broken"), []);
  assert.deepEqual(parseCallLog(null), []);
  const good = buildSession("テスト太郎", 1000);
  const mixed = JSON.stringify({ version: 1, sessions: [good, { id: 1 }, "x"] });
  assert.deepEqual(parseCallLog(mixed), [good]);
});

test("upsertSession replaces same id, sorts newest first, and caps history", () => {
  const a = buildSession("A", 1000);
  const b = buildSession("B", 2000);
  let sessions = upsertSession([], a);
  sessions = upsertSession(sessions, b);
  assert.deepEqual(sessions.map((s) => s.contact), ["B", "A"]);
  // 同IDは置き換え(重複しない)
  sessions = upsertSession(sessions, { ...b, contact: "B2" });
  assert.equal(sessions.length, 2);
  assert.equal(sessions[0].contact, "B2");
  // 上限を超えた古い履歴は捨てる
  const capped = upsertSession(sessions, buildSession("C", 3000), 2);
  assert.deepEqual(capped.map((s) => s.contact), ["C", "B2"]);
});

test("knowledgeFromSessions rebuilds shared knowledge from history", () => {
  const sessions = [buildSession("A", 1000), buildSession("B", 2000)];
  const knowledge = knowledgeFromSessions(sessions);
  assert.equal(knowledge.size, 2);
  assert.equal(knowledge.getEntries("rebuttal").length, 2);
});

test("callLogStats aggregates counts", () => {
  const stats = callLogStats([buildSession("A", 1000), buildSession("B", 2000)]);
  assert.equal(stats.sessionCount, 2);
  assert.equal(stats.completedCount, 2);
  assert.equal(stats.turnCount, 6); // 開始1+人間1+AI1 = 3ターン × 2
  assert.equal(stats.feedbackCount, 2);
});

test("TestCallRepository saves and lists sessions via SQLite (in-memory)", () => {
  const repo = new TestCallRepository(":memory:");
  const a = buildSession("A", 1000);
  const b = buildSession("B", 2000);
  repo.save(a);
  repo.save(b);
  repo.save({ ...a, contact: "A2" }); // 同IDの更新
  assert.deepEqual(repo.listSessions().map((s) => s.contact), ["B", "A2"]);
  assert.equal(repo.getById(a.id)?.contact, "A2");
  assert.equal(repo.getById("nope"), null);
  repo.close();
});
