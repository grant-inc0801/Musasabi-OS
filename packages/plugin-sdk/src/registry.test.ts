import { test } from "node:test";
import * as assert from "node:assert/strict";
import { PluginRegistry } from "./PluginRegistry";
import { validatePluginManifest } from "./validateManifest";
import type { MusasabiPlugin, PluginManifest } from "./types";

function manifest(overrides: Partial<PluginManifest> = {}): PluginManifest {
  return {
    id: "sample-widget",
    name: "サンプルウィジェット",
    version: "1.0.0",
    description: "テスト用のサンプル",
    targetDepartment: null,
    permissions: ["dashboard_widget"],
    ...overrides,
  };
}

test("a valid manifest passes validation", () => {
  assert.deepEqual(validatePluginManifest(manifest()), []);
});

test("validation rejects bad id, version, and unknown permissions", () => {
  const errors = validatePluginManifest(
    manifest({ id: "Bad_ID", version: "v1", permissions: ["delete_files" as never] }),
  );
  assert.equal(errors.length, 3);
  assert.match(errors.join(" "), /kebab-case/);
  assert.match(errors.join(" "), /SemVer/);
  assert.match(errors.join(" "), /許可されない権限/);
});

test("validation rejects non-object input and empty permissions", () => {
  assert.equal(validatePluginManifest(null).length, 1);
  assert.match(validatePluginManifest(manifest({ permissions: [] }))[0], /権限/);
});

test("registry registers, lists, and toggles plugins", () => {
  const registry = new PluginRegistry();
  const plugin: MusasabiPlugin = {
    manifest: manifest(),
    widgets: [{ id: "w1", title: "W1", items: [{ label: "件数", value: "3件" }] }],
  };
  registry.register(plugin);
  assert.equal(registry.list().length, 1);
  assert.equal(registry.isEnabled("sample-widget"), true);
  registry.setEnabled("sample-widget", false);
  assert.equal(registry.isEnabled("sample-widget"), false);
  assert.equal(registry.widgets().length, 0); // 無効化中はウィジェットを出さない
  registry.setEnabled("sample-widget", true);
  assert.equal(registry.widgets()[0].pluginId, "sample-widget");
});

test("registry rejects duplicate ids and invalid manifests", () => {
  const registry = new PluginRegistry();
  registry.register({ manifest: manifest() });
  assert.throws(() => registry.register({ manifest: manifest() }), /重複/);
  assert.throws(
    () => registry.register({ manifest: manifest({ id: "x", version: "bad" }) }),
    /SemVer/,
  );
});

test("registry rejects widgets without the dashboard_widget permission", () => {
  const registry = new PluginRegistry();
  assert.throws(
    () =>
      registry.register({
        manifest: manifest({ id: "no-perm", permissions: ["department_logic"] }),
        widgets: [{ id: "w", title: "W", items: [] }],
      }),
    /dashboard_widget 権限/,
  );
});
