import { test } from "node:test";
import * as assert from "node:assert/strict";
import { calculateTalkRatio } from "./TalkRatioCalculator";
import type { TranscriptSegment } from "./types";

function segment(speaker: TranscriptSegment["speaker"], durationMs: number): TranscriptSegment {
  return { speaker, text: "", timestampMs: 0, durationMs };
}

test("computes normalized talk ratio between rep and customer", () => {
  const ratio = calculateTalkRatio([segment("rep", 3000), segment("customer", 1000)]);
  assert.equal(ratio.rep, 0.75);
  assert.equal(ratio.customer, 0.25);
});

test("returns zero/zero for an empty transcript instead of NaN", () => {
  const ratio = calculateTalkRatio([]);
  assert.deepEqual(ratio, { rep: 0, customer: 0 });
});

test("handles a transcript with only one speaker", () => {
  const ratio = calculateTalkRatio([segment("rep", 5000)]);
  assert.deepEqual(ratio, { rep: 1, customer: 0 });
});
