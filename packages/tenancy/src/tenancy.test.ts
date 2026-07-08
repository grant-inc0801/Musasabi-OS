import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PLAN_ORDER,
  PLAN_FEATURES,
  hasFeature,
  canManage,
  withinLimit,
  usagePercent,
  recommendUpgrade,
  MOCK_TENANTS,
  type Tenant,
} from "./index";

test("上位プランは下位プランの機能を包含する", () => {
  for (const f of PLAN_FEATURES.free) assert.ok(hasFeature("pro", f), `pro に ${f}`);
  for (const f of PLAN_FEATURES.pro) assert.ok(hasFeature("enterprise", f), `enterprise に ${f}`);
});

test("本番連携とSSOは enterprise のみ", () => {
  assert.equal(hasFeature("free", "connectors_production"), false);
  assert.equal(hasFeature("pro", "connectors_production"), false);
  assert.equal(hasFeature("enterprise", "connectors_production"), true);
  assert.equal(hasFeature("pro", "sso"), false);
  assert.equal(hasFeature("enterprise", "sso"), true);
});

test("canManage は owner/admin のみ true", () => {
  assert.equal(canManage("owner"), true);
  assert.equal(canManage("admin"), true);
  assert.equal(canManage("member"), false);
});

test("withinLimit はプラン上限で判定する", () => {
  const free: Tenant = { id: "x", name: "X", plan: "free", seatsUsed: 3, departmentsUsed: 3, monthlyOperations: 1000 };
  assert.equal(withinLimit(free, "seats"), true);
  const over: Tenant = { ...free, seatsUsed: 4 };
  assert.equal(withinLimit(over, "seats"), false);
});

test("usagePercent は使用率を返す", () => {
  const t: Tenant = { id: "x", name: "X", plan: "pro", seatsUsed: 22, departmentsUsed: 6, monthlyOperations: 25000 };
  assert.equal(usagePercent(t, "seats"), 88); // 22/25
  assert.equal(usagePercent(t, "operations"), 50); // 25000/50000
});

test("recommendUpgrade は逼迫時に1つ上のプランを提案", () => {
  // seats 22/25 = 88% (<90), operations 41000/50000=82% → 提案なし
  const acme = MOCK_TENANTS.find((t) => t.id === "t-acme")!;
  assert.equal(recommendUpgrade(acme), null);
  // seats 24/25 = 96% → pro から enterprise を提案
  const pressured: Tenant = { ...acme, seatsUsed: 24 };
  assert.equal(recommendUpgrade(pressured), "enterprise");
  // enterprise は最上位 → null
  const nova = MOCK_TENANTS.find((t) => t.id === "t-nova")!;
  assert.equal(recommendUpgrade(nova), null);
});

test("プラン順は free<pro<enterprise", () => {
  assert.deepEqual([...PLAN_ORDER], ["free", "pro", "enterprise"]);
});
