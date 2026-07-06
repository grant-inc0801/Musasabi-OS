import { test } from "node:test";
import * as assert from "node:assert/strict";
import { AVATAR_STATES } from "@musasabi/avatar-2d";
import { expressionForAvatarState } from "./expressionMapping";
import { VRM_EXPRESSION_PRESETS } from "./types";

test("maps goal_achieved to a happy expression", () => {
  assert.equal(expressionForAvatarState("goal_achieved"), "happy");
});

test("maps working to a neutral expression", () => {
  assert.equal(expressionForAvatarState("working"), "neutral");
});

test("every AvatarState maps to a valid VRM expression preset", () => {
  for (const state of AVATAR_STATES) {
    const expression = expressionForAvatarState(state);
    assert.ok(
      VRM_EXPRESSION_PRESETS.includes(expression),
      `${state} -> ${expression} is not a valid preset`,
    );
  }
});

test("mapping is deterministic", () => {
  assert.equal(expressionForAvatarState("idle"), expressionForAvatarState("idle"));
});
