import { test } from "node:test";
import * as assert from "node:assert/strict";
import {
  AVATAR_SIZE_PRESET_PX,
  AVATAR_SIZE_MIN_PX,
  AVATAR_SIZE_MAX_PX,
  DEFAULT_AVATAR_DISPLAY_SETTINGS,
  clampAvatarSizePx,
  presetForSizePx,
  parseAvatarDisplaySettings,
} from "./displaySettings";

test("default avatar size is the medium preset", () => {
  assert.equal(DEFAULT_AVATAR_DISPLAY_SETTINGS.sizePx, AVATAR_SIZE_PRESET_PX.medium);
});

test("clampAvatarSizePx keeps values inside the slider range", () => {
  assert.equal(clampAvatarSizePx(10), AVATAR_SIZE_MIN_PX);
  assert.equal(clampAvatarSizePx(999), AVATAR_SIZE_MAX_PX);
  assert.equal(clampAvatarSizePx(100), 100);
  assert.equal(clampAvatarSizePx(100.6), 101);
});

test("clampAvatarSizePx falls back to the default for non-numeric input", () => {
  assert.equal(clampAvatarSizePx("big"), DEFAULT_AVATAR_DISPLAY_SETTINGS.sizePx);
  assert.equal(clampAvatarSizePx(Number.NaN), DEFAULT_AVATAR_DISPLAY_SETTINGS.sizePx);
  assert.equal(clampAvatarSizePx(undefined), DEFAULT_AVATAR_DISPLAY_SETTINGS.sizePx);
});

test("presetForSizePx maps preset px values back to presets", () => {
  assert.equal(presetForSizePx(AVATAR_SIZE_PRESET_PX.small), "small");
  assert.equal(presetForSizePx(AVATAR_SIZE_PRESET_PX.large), "large");
  assert.equal(presetForSizePx(99), null);
});

test("parseAvatarDisplaySettings restores valid settings and rejects garbage", () => {
  assert.deepEqual(parseAvatarDisplaySettings({ sizePx: 120 }), { sizePx: 120 });
  assert.deepEqual(parseAvatarDisplaySettings(null), DEFAULT_AVATAR_DISPLAY_SETTINGS);
  assert.deepEqual(parseAvatarDisplaySettings({ sizePx: "x" }), DEFAULT_AVATAR_DISPLAY_SETTINGS);
});
