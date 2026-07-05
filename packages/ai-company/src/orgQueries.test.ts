import { test } from "node:test";
import * as assert from "node:assert/strict";
import { getUnit, getChildren, getAncestors, getHeadquarters } from "./orgQueries";
import type { OrganizationUnit } from "./types";

test("getUnit finds a known unit and returns null for an unknown id", () => {
  assert.equal(getUnit("hq-sales")?.name, "AI営業本部");
  assert.equal(getUnit("does-not-exist"), null);
});

test("getChildren returns the direct children of a unit", () => {
  const children = getChildren("hq-sales").map((unit) => unit.id);
  assert.ok(children.includes("div-sales-main"));
  assert.ok(children.includes("div-sales-inside"));
  // 孫(部署)は直接の子ではない
  assert.ok(!children.includes("dept-sales-team-a"));
});

test("getAncestors returns parents from nearest to the company root", () => {
  const ancestors = getAncestors("dept-sales-team-a").map((unit) => unit.id);
  assert.deepEqual(ancestors, ["div-sales-main", "hq-sales", "musasabi"]);
});

test("getHeadquarters resolves the headquarters of a nested unit", () => {
  assert.equal(getHeadquarters("dept-sales-team-a")?.id, "hq-sales");
  assert.equal(getHeadquarters("div-dev-desktop")?.id, "hq-development");
});

test("getHeadquarters returns the unit itself for a headquarters and null for the company", () => {
  assert.equal(getHeadquarters("hq-sales")?.id, "hq-sales");
  assert.equal(getHeadquarters("musasabi"), null);
});

test("getAncestors does not loop forever on cyclic data", () => {
  const cyclic: OrganizationUnit[] = [
    { id: "a", name: "A", level: "division", parentId: "b" },
    { id: "b", name: "B", level: "division", parentId: "a" },
  ];
  const ancestors = getAncestors("a", cyclic).map((unit) => unit.id);
  // b を1度たどった後、a への循環を検出して打ち切る
  assert.deepEqual(ancestors, ["b"]);
});
