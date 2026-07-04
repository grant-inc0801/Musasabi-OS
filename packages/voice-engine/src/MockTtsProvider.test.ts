import { test } from "node:test";
import * as assert from "node:assert/strict";
import { MockTtsProvider } from "./MockTtsProvider";

test("synthesize produces one viseme per character with increasing timeMs", async () => {
  const provider = new MockTtsProvider();
  const result = await provider.synthesize("あいう");

  assert.equal(result.visemes.length, 3);
  assert.deepEqual(
    result.visemes.map((v) => v.shape),
    ["A", "I", "U"],
  );
  assert.equal(result.visemes[0].timeMs, 0);
  assert.ok(result.visemes[1].timeMs > result.visemes[0].timeMs);
  assert.ok(result.visemes[2].timeMs > result.visemes[1].timeMs);
});

test("durationMs scales with text length", async () => {
  const provider = new MockTtsProvider();
  const short = await provider.synthesize("あ");
  const long = await provider.synthesize("あいうえお");
  assert.ok(long.durationMs > short.durationMs);
});

test("empty text produces no visemes and zero duration", async () => {
  const provider = new MockTtsProvider();
  const result = await provider.synthesize("");
  assert.deepEqual(result.visemes, []);
  assert.equal(result.durationMs, 0);
});
