import { test } from "node:test";
import * as assert from "node:assert/strict";
import { generateCallSummary } from "./CallSummaryGenerator";
import type { TranscriptSegment } from "./types";

test("generates a full summary from a sample call transcript", () => {
  const segments: TranscriptSegment[] = [
    { speaker: "rep", text: "本日はお時間ありがとうございます", timestampMs: 0, durationMs: 4000 },
    { speaker: "customer", text: "少し予算的に高いですね", timestampMs: 4000, durationMs: 3000 },
    { speaker: "rep", text: "他社と比較してご検討します", timestampMs: 7000, durationMs: 2000 },
    { speaker: "customer", text: "興味があります、進めてください", timestampMs: 9000, durationMs: 3000 },
  ];

  const result = generateCallSummary("call-001", segments);

  assert.equal(result.callId, "call-001");
  assert.equal(result.sentimentTimeline.length, 4);
  assert.ok(result.keywords.includes("予算"));
  assert.ok(result.keywords.includes("他社"));
  assert.ok(result.keywords.includes("進めてください"));
  assert.ok(result.talkRatio.rep > 0 && result.talkRatio.customer > 0);
  assert.match(result.summary, /検出キーワード/);
  assert.match(result.summary, /担当者の発話比率は\d+%/);
});

test("handles an empty transcript without throwing", () => {
  const result = generateCallSummary("call-empty", []);
  assert.equal(result.overallSentiment, "neutral");
  assert.deepEqual(result.keywords, []);
  assert.deepEqual(result.talkRatio, { rep: 0, customer: 0 });
});
