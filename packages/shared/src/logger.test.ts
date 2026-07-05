import { test } from "node:test";
import * as assert from "node:assert/strict";
import { Logger, type LogEntry, type LogSink } from "./logger";

function collectingSink(): { sink: LogSink; entries: LogEntry[] } {
  const entries: LogEntry[] = [];
  return { sink: { write: (entry) => entries.push(entry) }, entries };
}

test("drops entries below minLevel", () => {
  const logger = new Logger({ minLevel: "warn", now: () => 0 });
  logger.debug("d");
  logger.info("i");
  logger.warn("w");
  logger.error("e");
  const levels = logger.getEntries().map((entry) => entry.level);
  assert.deepEqual(levels, ["warn", "error"]);
});

test("uses the injected clock for timestamps", () => {
  let clock = 1000;
  const logger = new Logger({ minLevel: "debug", now: () => clock });
  logger.info("first");
  clock = 2500;
  logger.info("second");
  const entries = logger.getEntries();
  assert.equal(entries[0].timestampMs, 1000);
  assert.equal(entries[1].timestampMs, 2500);
});

test("ring buffer keeps only the most recent bufferSize entries", () => {
  const logger = new Logger({ minLevel: "debug", bufferSize: 3, now: () => 0 });
  for (let i = 0; i < 5; i += 1) {
    logger.info(`msg-${i}`);
  }
  const messages = logger.getEntries().map((entry) => entry.message);
  assert.deepEqual(messages, ["msg-2", "msg-3", "msg-4"]);
});

test("forwards accepted entries to sinks but not filtered-out ones", () => {
  const { sink, entries } = collectingSink();
  const logger = new Logger({ minLevel: "info", sinks: [sink], now: () => 0 });
  logger.debug("ignored");
  logger.info("kept");
  assert.equal(entries.length, 1);
  assert.equal(entries[0].message, "kept");
});

test("attaches context only when provided", () => {
  const logger = new Logger({ minLevel: "debug", now: () => 0 });
  logger.info("no-context");
  logger.error("with-context", { code: 500 });
  const [a, b] = logger.getEntries();
  assert.equal(a.context, undefined);
  assert.deepEqual(b.context, { code: 500 });
});

test("clear empties the buffer", () => {
  const logger = new Logger({ minLevel: "debug", now: () => 0 });
  logger.info("a");
  logger.clear();
  assert.deepEqual(logger.getEntries(), []);
});

test("getEntries returns a copy, not the internal buffer", () => {
  const logger = new Logger({ minLevel: "debug", now: () => 0 });
  logger.info("a");
  const snapshot = logger.getEntries();
  snapshot.push({ timestampMs: 0, level: "info", message: "injected" });
  assert.equal(logger.getEntries().length, 1);
});
