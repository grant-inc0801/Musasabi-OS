import { test } from "node:test";
import * as assert from "node:assert/strict";
import { PluginRegistry, validatePluginManifest } from "@musasabi/plugin-sdk";
import { accountingWidgetPlugin, manifest } from "./index";

test("the accounting plugin manifest passes SDK validation", () => {
  assert.deepEqual(validatePluginManifest(manifest), []);
});

test("the plugin registers and exposes its widget through the registry", () => {
  const registry = new PluginRegistry();
  registry.register(accountingWidgetPlugin);
  const widgets = registry.widgets();
  assert.equal(widgets.length, 1);
  assert.equal(widgets[0].pluginId, "accounting-widget");
  assert.ok(widgets[0].items.length >= 3);
});
