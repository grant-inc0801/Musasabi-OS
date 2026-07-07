import assert from "node:assert/strict";
import { test } from "node:test";

import { BACKUP_SCHEMA_VERSION, buildBackupJson, parseBackupJson } from "./dataBackup";

const T0 = 1_752_300_000_000;

test("buildBackupJson は musasabi.* のエントリのみを出力する", () => {
  const json = buildBackupJson(
    {
      "musasabi.memory": '{"version":1,"records":[]}',
      "musasabi.salesList": '{"version":1,"leads":[]}',
      "other.key": "excluded",
    },
    T0,
  );
  const parsed = JSON.parse(json);
  assert.equal(parsed.version, BACKUP_SCHEMA_VERSION);
  assert.equal(parsed.exportedAtMs, T0);
  assert.deepEqual(Object.keys(parsed.entries).sort(), ["musasabi.memory", "musasabi.salesList"]);
});

test("往復(build→parse)でエントリが保持される", () => {
  const entries = {
    "musasabi.memory": "a",
    "musasabi.autocallGates": "b",
  };
  const snapshot = parseBackupJson(buildBackupJson(entries, T0));
  assert.ok(snapshot);
  assert.deepEqual(snapshot.entries, entries);
  assert.equal(snapshot.exportedAtMs, T0);
});

test("parseBackupJson は壊れたJSON・バージョン不一致を拒否する", () => {
  assert.equal(parseBackupJson("{broken"), null);
  assert.equal(parseBackupJson(null), null);
  assert.equal(parseBackupJson({ version: 999, entries: {} }), null);
  assert.equal(parseBackupJson({ version: BACKUP_SCHEMA_VERSION, entries: "x" }), null);
});

test("parseBackupJson はプレフィックス外キー・文字列以外の値を除外する", () => {
  const snapshot = parseBackupJson({
    version: BACKUP_SCHEMA_VERSION,
    exportedAtMs: T0,
    entries: {
      "musasabi.ok": "value",
      "evil.key": "no",
      "musasabi.number": 123,
    },
  });
  assert.ok(snapshot);
  assert.deepEqual(snapshot.entries, { "musasabi.ok": "value" });
});
