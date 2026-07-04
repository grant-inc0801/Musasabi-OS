import { test } from "node:test";
import * as assert from "node:assert/strict";
import { AvatarStateMachine, isAvatarState } from "./index";

test("initial state is idle", () => {
  const machine = new AvatarStateMachine();
  assert.equal(machine.getState(), "idle");
});

test("transition updates state and notifies listeners", () => {
  const machine = new AvatarStateMachine();
  const seen: string[] = [];
  machine.onChange((state) => seen.push(state));

  machine.transition("working");

  assert.equal(machine.getState(), "working");
  assert.deepEqual(seen, ["working"]);
});

test("transition rejects unknown state", () => {
  const machine = new AvatarStateMachine();
  assert.throws(() => machine.transition("dancing" as never));
});

test("unsubscribed listener stops receiving updates", () => {
  const machine = new AvatarStateMachine();
  const seen: string[] = [];
  const unsubscribe = machine.onChange((state) => seen.push(state));

  machine.transition("preparing_call");
  unsubscribe();
  machine.transition("idle");

  assert.deepEqual(seen, ["preparing_call"]);
});

test("isAvatarState narrows valid states only", () => {
  assert.equal(isAvatarState("goal_achieved"), true);
  assert.equal(isAvatarState("dancing"), false);
});
