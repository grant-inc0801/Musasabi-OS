import { test } from "node:test";
import * as assert from "node:assert/strict";
import { WhisperCppHttpSttProvider } from "./WhisperCppHttpSttProvider";

test("a failed inference request is routed to onError instead of crashing the process", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => new Response("server error", { status: 500 })) as typeof fetch;

  try {
    const errors: unknown[] = [];
    const provider = new WhisperCppHttpSttProvider("http://localhost:8080", (error) => errors.push(error));
    const session = provider.startStreaming(() => {
      throw new Error("onTranscript should not be called when the request fails");
    });

    session.pushAudio(Buffer.from("audio"));
    session.stop();

    // flush() runs asynchronously after stop() returns; wait for its microtask/catch to settle.
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(errors.length, 1);
    assert.match(String(errors[0]), /HTTP 500/);
  } finally {
    global.fetch = originalFetch;
  }
});
