import { test } from "node:test";
import * as assert from "node:assert/strict";
import { MockSttProvider } from "@musasabi/voice-engine";
import type { TranscriptChunk } from "@musasabi/voice-engine";
import { DiarizationBridge } from "./DiarizationBridge";
import { generateCallSummary } from "./CallSummaryGenerator";
import type { Speaker } from "./types";

/**
 * Issue #182 の受け入れ基準: Voice Engine の (モック) 通話音声ストリームから
 * 話者分離済みの TranscriptSegment[] が生成され、そのまま generateCallSummary に
 * 渡せることを確認する結合テスト。Zoom Phoneの発信/着信チャネル分離を想定し、
 * 担当者(rep)・顧客(customer)それぞれ専用の SttSession を1つずつ駆動する。
 */
test("bridges two channel-separated STT sessions into a summarizable transcript", () => {
  const bridge = new DiarizationBridge();

  function wireChannel(speaker: Speaker, fullTranscript: string, chunksToComplete: number): void {
    const provider = new MockSttProvider(fullTranscript, chunksToComplete);
    const session = provider.startStreaming((chunk: TranscriptChunk) => {
      bridge.push({ speaker, text: chunk.text, isFinal: chunk.isFinal, timestampMs: chunk.timestampMs });
    });
    for (let i = 0; i < chunksToComplete; i += 1) {
      session.pushAudio(Buffer.alloc(0));
    }
  }

  wireChannel("rep", "本日はお時間をいただきありがとうございます", 4);
  wireChannel("customer", "少し予算的に高いですね、でも興味があります", 4);

  const segments = bridge.toTranscriptSegments();
  assert.ok(segments.length >= 2);
  assert.ok(segments.some((segment) => segment.speaker === "rep"));
  assert.ok(segments.some((segment) => segment.speaker === "customer"));

  const summary = generateCallSummary("demo-diarized-call", segments);
  assert.equal(summary.callId, "demo-diarized-call");
  assert.ok(summary.talkRatio.rep > 0);
  assert.ok(summary.talkRatio.customer > 0);
  assert.ok(summary.summary.length > 0);
});
