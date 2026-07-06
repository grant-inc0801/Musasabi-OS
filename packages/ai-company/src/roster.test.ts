import { test } from "node:test";
import * as assert from "node:assert/strict";
import { AI_EMPLOYEES, getEmployee, getEmployeesByUnit, initialRosterCallProgress } from "./roster";
import { RANK_AUTHORITY_LEVEL, EMPLOYEE_STATES } from "./types";
import { getUnit } from "./orgQueries";
import { allowedCallModes, hasPassedTestCriteria } from "./callIntegration";
import { COMPANY_GENOME, COMPANY_VALUES } from "./genome";

test("every employee belongs to an existing organization unit", () => {
  for (const e of AI_EMPLOYEES) {
    assert.notEqual(getUnit(e.unitId), null, `unit not found: ${e.unitId} (${e.id})`);
  }
});

test("authorityLevel always matches the employee's rank", () => {
  for (const e of AI_EMPLOYEES) {
    assert.equal(e.authorityLevel, RANK_AUTHORITY_LEVEL[e.rank], e.id);
  }
});

test("every employee has a valid state", () => {
  for (const e of AI_EMPLOYEES) {
    assert.ok(EMPLOYEE_STATES.includes(e.state), `${e.id}: ${e.state}`);
  }
});

test("getEmployee and getEmployeesByUnit look up the roster", () => {
  assert.equal(getEmployee("MUSA-001")?.rank, "ceo");
  assert.equal(getEmployee("MUSA-999"), null);
  const teamA = getEmployeesByUnit("dept-sales-team-a");
  assert.ok(teamA.length >= 2);
});

test("initial roster progress never enables autocall (gates unsatisfied)", () => {
  for (const progress of initialRosterCallProgress()) {
    assert.equal(allowedCallModes(progress).includes("autocall"), false, progress.employeeId);
  }
});

test("managers pass test criteria while trainees start from learning", () => {
  const byId = new Map(initialRosterCallProgress().map((p) => [p.employeeId, p]));
  assert.equal(hasPassedTestCriteria(byId.get("MUSA-102")!), true);
  assert.equal(byId.get("MUSA-105")!.learningCompleted, false);
});

test("company genome exposes mission, values and decision principles", () => {
  assert.ok(COMPANY_GENOME.mission.length > 0);
  assert.equal(COMPANY_GENOME.values.length, COMPANY_VALUES.length);
  assert.equal(COMPANY_GENOME.decisionPrinciples.length, 5);
});
