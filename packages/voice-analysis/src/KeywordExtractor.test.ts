import { test } from "node:test";
import * as assert from "node:assert/strict";
import { extractKeywords } from "./KeywordExtractor";
import type { TranscriptSegment } from "./types";

function segment(text: string): TranscriptSegment {
  return { speaker: "customer", text, timestampMs: 0, durationMs: 1000 };
}

test("finds watched keywords across segments, in watchlist order within each segment", () => {
  const keywords = extractKeywords([segment("少し高いですね"), segment("他社も検討します")]);
  assert.deepEqual(keywords, ["高い", "検討します", "他社"]);
});

test("deduplicates repeated keyword mentions", () => {
  const keywords = extractKeywords([segment("予算的に厳しい"), segment("予算がもう少し欲しい")]);
  assert.deepEqual(keywords, ["予算"]);
});

test("returns an empty array when nothing matches", () => {
  assert.deepEqual(extractKeywords([segment("本日はよろしくお願いします")]), []);
});
