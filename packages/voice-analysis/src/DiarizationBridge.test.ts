import { test } from "node:test";
import * as assert from "node:assert/strict";
import { DiarizationBridge } from "./DiarizationBridge";

test("ignores interim (non-final) chunks", () => {
  const bridge = new DiarizationBridge();
  bridge.push({ speaker: "rep", text: "こんに", isFinal: false, timestampMs: 100 });
  assert.deepEqual(bridge.toTranscriptSegments(), []);
});

test("ignores empty final chunks", () => {
  const bridge = new DiarizationBridge();
  bridge.push({ speaker: "rep", text: "", isFinal: true, timestampMs: 100 });
  assert.deepEqual(bridge.toTranscriptSegments(), []);
});

test("estimates duration from character count and derives start time from the end time", () => {
  const bridge = new DiarizationBridge();
  // "はじめまして" は6文字 -> 6 * 120ms = 720ms
  bridge.push({ speaker: "rep", text: "はじめまして", isFinal: true, timestampMs: 2000 });

  const [segment] = bridge.toTranscriptSegments();
  assert.equal(segment.speaker, "rep");
  assert.equal(segment.durationMs, 720);
  assert.equal(segment.timestampMs, 2000 - 720);
});

test("clamps the start time to 0 when the estimated duration exceeds the end timestamp", () => {
  const bridge = new DiarizationBridge();
  // 見積もり時間(6*120=720ms)が終了時刻(500ms)を超える場合、開始時刻は0にクランプする。
  bridge.push({ speaker: "rep", text: "はじめまして", isFinal: true, timestampMs: 500 });

  const [segment] = bridge.toTranscriptSegments();
  assert.equal(segment.timestampMs, 0);
  assert.equal(segment.durationMs, 500);
});

test("interleaves two speakers' channels in chronological order based on their real timestamps", () => {
  const bridge = new DiarizationBridge();
  // customerのチャンクが先にpushされても、repの発話の方が実際には早ければ
  // 時系列順に並び替わる(話者ごとに独立してゼロから数える設計だと、両者の
  // 最初の発話が常に0ms扱いになり、この並び替えができなくなる)。
  bridge.push({ speaker: "customer", text: "少し高いですね", isFinal: true, timestampMs: 4000 });
  bridge.push({ speaker: "rep", text: "ありがとうございます", isFinal: true, timestampMs: 3000 });

  const segments = bridge.toTranscriptSegments();
  assert.equal(segments.length, 2);
  assert.equal(segments[0].speaker, "rep");
  assert.equal(segments[1].speaker, "customer");
  assert.ok(segments[0].timestampMs < segments[1].timestampMs);
});

test("keeps each speaker's own utterances independent (no cross-utterance chaining)", () => {
  const bridge = new DiarizationBridge();
  bridge.push({ speaker: "rep", text: "A", isFinal: true, timestampMs: 5000 });
  bridge.push({ speaker: "rep", text: "B", isFinal: true, timestampMs: 4000 });

  const segments = bridge.toTranscriptSegments();
  // 2件目の発話("B")は1件目("A")より前のtimestampMsを持つため、並び替え後は先に来る。
  assert.equal(segments[0].text, "B");
  assert.equal(segments[1].text, "A");
});
