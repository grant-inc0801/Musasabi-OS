import { test } from "node:test";
import * as assert from "node:assert/strict";
import { analyzeSegmentSentiment, buildSentimentTimeline, summarizeOverallSentiment } from "./SentimentAnalyzer";
import type { TranscriptSegment } from "./types";

function segment(overrides: Partial<TranscriptSegment>): TranscriptSegment {
  return { speaker: "customer", text: "", timestampMs: 0, durationMs: 1000, ...overrides };
}

test("classifies a segment with positive keywords as positive", () => {
  const point = analyzeSegmentSentiment(segment({ text: "とても興味があります、ありがとうございます" }));
  assert.equal(point.sentiment, "positive");
  assert.ok(point.score > 0);
});

test("classifies a segment with negative keywords as negative", () => {
  const point = analyzeSegmentSentiment(segment({ text: "少し高いですね、結構です" }));
  assert.equal(point.sentiment, "negative");
  assert.ok(point.score < 0);
});

test("plain segment with no keywords at all is neutral", () => {
  const point = analyzeSegmentSentiment(segment({ text: "本日はお時間をいただきました" }));
  assert.equal(point.sentiment, "neutral");
  assert.equal(point.score, 0);
});

test("summarizeOverallSentiment sums scores across the timeline rather than majority vote", () => {
  const timeline = buildSentimentTimeline([
    segment({ text: "興味があります" }), // +1
    segment({ text: "高い" }), // -1
    segment({ text: "高い" }), // -1
  ]);
  assert.equal(summarizeOverallSentiment(timeline), "negative");
});

test("summarizeOverallSentiment on an empty timeline is neutral", () => {
  assert.equal(summarizeOverallSentiment([]), "neutral");
});
