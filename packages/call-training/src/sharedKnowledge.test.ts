import { test } from "node:test";
import * as assert from "node:assert/strict";
import { MockCallAdapter } from "./MockCallAdapter";
import { startTestCall, addFeedback } from "./session";
import { SharedTalkKnowledge } from "./sharedKnowledge";

const adapter = new MockCallAdapter();

test("ingestSession collects all feedback from a session", () => {
  let s = startTestCall("テスト太郎", adapter);
  s = addFeedback(s, { turnIndex: 0, comment: "もっと明るい声で", category: "tone", nowMs: 100 });
  s = addFeedback(s, { turnIndex: null, comment: "切り返しを丁寧に", category: "rebuttal", nowMs: 200 });
  const knowledge = new SharedTalkKnowledge();
  knowledge.ingestSession(s);
  assert.equal(knowledge.size, 2);
});

test("getEntries filters by category and returns copies", () => {
  const knowledge = new SharedTalkKnowledge();
  knowledge.ingestFeedback(
    { id: "fb-1", turnIndex: null, comment: "トーンを上げる", category: "tone", timestampMs: 1 },
    "session-1",
  );
  knowledge.ingestFeedback(
    { id: "fb-2", turnIndex: null, comment: "台本を短く", category: "script", timestampMs: 2 },
    "session-1",
  );
  const toneEntries = knowledge.getEntries("tone");
  assert.equal(toneEntries.length, 1);
  assert.equal(toneEntries[0].category, "tone");
  toneEntries[0].comment = "改変";
  assert.equal(knowledge.getEntries("tone")[0].comment, "トーンを上げる");
});

test("countByCategory tallies every category", () => {
  const knowledge = new SharedTalkKnowledge();
  knowledge.ingestFeedback(
    { id: "fb-1", turnIndex: null, comment: "a", category: "tone", timestampMs: 1 },
    "s",
  );
  knowledge.ingestFeedback(
    { id: "fb-2", turnIndex: null, comment: "b", category: "tone", timestampMs: 2 },
    "s",
  );
  knowledge.ingestFeedback(
    { id: "fb-3", turnIndex: null, comment: "c", category: "rebuttal", timestampMs: 3 },
    "s",
  );
  const counts = knowledge.countByCategory();
  assert.equal(counts.tone, 2);
  assert.equal(counts.rebuttal, 1);
  assert.equal(counts.script, 0);
  assert.equal(counts.other, 0);
});

test("knowledge is shared across sessions (all AI staff)", () => {
  const knowledge = new SharedTalkKnowledge();
  let a = startTestCall("A社", adapter);
  a = addFeedback(a, { turnIndex: null, comment: "共通1", category: "script", nowMs: 1 });
  let b = startTestCall("B社", adapter);
  b = addFeedback(b, { turnIndex: null, comment: "共通2", category: "script", nowMs: 2 });
  knowledge.ingestSession(a);
  knowledge.ingestSession(b);
  assert.equal(knowledge.getEntries("script").length, 2);
});
