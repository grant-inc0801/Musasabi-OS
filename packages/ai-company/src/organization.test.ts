import { test } from "node:test";
import * as assert from "node:assert/strict";
import {
  ORGANIZATION_UNITS,
  HEADQUARTERS_IDS,
  COMPANY_ID,
} from "./organization";

test("there is exactly one company root and it has no parent", () => {
  const companies = ORGANIZATION_UNITS.filter((unit) => unit.level === "company");
  assert.equal(companies.length, 1);
  assert.equal(companies[0].id, COMPANY_ID);
  assert.equal(companies[0].parentId, null);
});

test("all 8 headquarters exist and report to the company", () => {
  const hqs = ORGANIZATION_UNITS.filter((unit) => unit.level === "headquarters");
  assert.equal(hqs.length, 8);
  for (const hq of hqs) {
    assert.equal(hq.parentId, COMPANY_ID);
    assert.ok(HEADQUARTERS_IDS.includes(hq.id as (typeof HEADQUARTERS_IDS)[number]));
  }
});

test("every non-company unit references an existing parent", () => {
  const ids = new Set(ORGANIZATION_UNITS.map((unit) => unit.id));
  for (const unit of ORGANIZATION_UNITS) {
    if (unit.parentId !== null) {
      assert.ok(ids.has(unit.parentId), `${unit.id} references missing parent ${unit.parentId}`);
    }
  }
});

test("unit ids are unique", () => {
  const ids = ORGANIZATION_UNITS.map((unit) => unit.id);
  assert.equal(ids.length, new Set(ids).size);
});

test("a division belongs to a headquarters, a department belongs to a division", () => {
  const byId = new Map(ORGANIZATION_UNITS.map((unit) => [unit.id, unit]));
  for (const unit of ORGANIZATION_UNITS) {
    if (unit.parentId === null) continue;
    const parent = byId.get(unit.parentId);
    assert.ok(parent);
    if (unit.level === "division") {
      assert.equal(parent!.level, "headquarters");
    }
    if (unit.level === "department") {
      assert.equal(parent!.level, "division");
    }
  }
});
