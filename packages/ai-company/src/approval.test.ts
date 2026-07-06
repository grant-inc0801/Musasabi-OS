import { test } from "node:test";
import * as assert from "node:assert/strict";
import {
  resolveAuthorityLevel,
  nextApprover,
  canApprove,
  approvalPath,
} from "./approval";

test("resolveAuthorityLevel matches the Organization Bible levels", () => {
  assert.equal(resolveAuthorityLevel("ceo"), 9);
  assert.equal(resolveAuthorityLevel("department_manager"), 6);
  assert.equal(resolveAuthorityLevel("trainee"), 2);
});

test("nextApprover walks up the chain", () => {
  assert.equal(nextApprover("staff"), "supervisor");
  assert.equal(nextApprover("department_manager"), "headquarters_manager");
  assert.equal(nextApprover("headquarters_manager"), "ceo");
});

test("nextApprover returns null at the top of the chain and for off-chain ranks", () => {
  assert.equal(nextApprover("ceo"), null);
  assert.equal(nextApprover("executive"), null);
});

test("canApprove is true only when the approver outranks the requester on the chain", () => {
  assert.equal(canApprove("section_chief", "staff"), true);
  assert.equal(canApprove("ceo", "headquarters_manager"), true);
  assert.equal(canApprove("staff", "section_chief"), false);
  assert.equal(canApprove("staff", "staff"), false); // 同格は承認不可
});

test("canApprove is false when either party is off-chain (executive)", () => {
  assert.equal(canApprove("executive", "staff"), false);
  assert.equal(canApprove("ceo", "executive"), false);
});

test("approvalPath lists every approver up to CEO", () => {
  assert.deepEqual(approvalPath("staff"), [
    "supervisor",
    "section_chief",
    "department_manager",
    "headquarters_manager",
    "ceo",
  ]);
  assert.deepEqual(approvalPath("headquarters_manager"), ["ceo"]);
  assert.deepEqual(approvalPath("ceo"), []);
});

test("approvalPath is empty for off-chain ranks", () => {
  assert.deepEqual(approvalPath("executive"), []);
});
