import { test } from "node:test";
import * as assert from "node:assert/strict";
import { MockSttProvider } from "./MockSttProvider";

test("emits progressively longer interim transcripts as audio chunks arrive", () => {
  const provider = new MockSttProvider("こんにちは", 5);
  const chunks: string[] = [];
  const session = provider.startStreaming((chunk) => chunks.push(chunk.text));

  session.pushAudio(Buffer.alloc(1));
  session.pushAudio(Buffer.alloc(1));

  assert.equal(chunks.length, 2);
  assert.ok(chunks[1].length >= chunks[0].length);
  assert.ok("こんにちは".startsWith(chunks[0]));
});

test("marks the transcript final once enough chunks have arrived", () => {
  const provider = new MockSttProvider("こんにちは", 2);
  const finals: boolean[] = [];
  const session = provider.startStreaming((chunk) => finals.push(chunk.isFinal));

  session.pushAudio(Buffer.alloc(1));
  session.pushAudio(Buffer.alloc(1));

  assert.deepEqual(finals, [false, true]);
});

test("stop() emits the full transcript as final even if not enough chunks arrived", () => {
  const provider = new MockSttProvider("こんにちは", 10);
  const results: { text: string; isFinal: boolean }[] = [];
  const session = provider.startStreaming((chunk) => results.push(chunk));

  session.pushAudio(Buffer.alloc(1));
  session.stop();

  const last = results[results.length - 1];
  assert.equal(last.text, "こんにちは");
  assert.equal(last.isFinal, true);
});

test("pushAudio after stop() is ignored", () => {
  const provider = new MockSttProvider("こんにちは", 5);
  const results: { text: string; isFinal: boolean }[] = [];
  const session = provider.startStreaming((chunk) => results.push(chunk));

  session.stop();
  const countAfterStop = results.length;
  session.pushAudio(Buffer.alloc(1));

  assert.equal(results.length, countAfterStop);
});
