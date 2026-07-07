import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LOCKED_GATE_REASON_JA,
  canPlaceRealCall,
  emptyGateState,
  isGateLocked,
  parseGateState,
  satisfiedGates,
  serializeGateState,
  setGateSatisfied,
} from "./index";
import { AUTOCALL_GATES } from "./types";

test("emptyGateState は全ゲート未充足で始まる", () => {
  const state = emptyGateState();
  assert.deepEqual(satisfiedGates(state), []);
  assert.equal(canPlaceRealCall("autocall", satisfiedGates(state)), false);
});

test("setGateSatisfied は通常ゲートを充足/解除できる(イミュータブル)", () => {
  const state = emptyGateState();
  const next = setGateSatisfied(state, "admin_approval", true);
  assert.equal(next.admin_approval, true);
  assert.equal(state.admin_approval, false); // 元は変更されない
  const back = setGateSatisfied(next, "admin_approval", false);
  assert.equal(back.admin_approval, false);
});

test("real_account_link はロックされ充足できない → 本番架電は常に不可", () => {
  assert.equal(isGateLocked("real_account_link"), true);
  let state = emptyGateState();
  assert.throws(
    () => setGateSatisfied(state, "real_account_link", true),
    new RegExp(LOCKED_GATE_REASON_JA),
  );
  // ロック以外の全ゲートを充足しても本番架電は不可のまま
  for (const gate of AUTOCALL_GATES) {
    if (!isGateLocked(gate)) {
      state = setGateSatisfied(state, gate, true);
    }
  }
  assert.equal(satisfiedGates(state).length, AUTOCALL_GATES.length - 1);
  assert.equal(canPlaceRealCall("autocall", satisfiedGates(state)), false);
});

test("serialize/parse の往復で状態が保持される", () => {
  let state = emptyGateState();
  state = setGateSatisfied(state, "legal_check", true);
  state = setGateSatisfied(state, "audit_log", true);
  const restored = parseGateState(serializeGateState(state));
  assert.deepEqual(restored, state);
});

test("parseGateState は壊れた値を初期状態へ、ロックゲートの改ざんを矯正する", () => {
  assert.deepEqual(parseGateState("{broken"), emptyGateState());
  assert.deepEqual(parseGateState(null), emptyGateState());
  // 保存値で real_account_link=true を注入しても false へ矯正される
  const tampered = JSON.stringify({
    version: 1,
    gates: { real_account_link: true, admin_approval: true, legal_check: "yes" },
  });
  const state = parseGateState(tampered);
  assert.equal(state.real_account_link, false);
  assert.equal(state.admin_approval, true);
  assert.equal(state.legal_check, false); // boolean以外は無視
});
