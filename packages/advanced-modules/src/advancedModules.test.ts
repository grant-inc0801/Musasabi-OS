import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADVANCED_MODULES,
  getModule,
  summarizeModules,
  runModuleStub,
  type AdvancedModuleId,
} from "./index";

test("12モジュールが定義されている", () => {
  assert.equal(ADVANCED_MODULES.length, 12);
});

test("ロードマップの全モジュールが揃っている", () => {
  const ids: AdvancedModuleId[] = [
    "musasabi_dna", "company_brain_2", "coo_command_center", "knowledge_quality_score",
    "decision_support", "sales_coaching", "publishing_studio", "development_review",
    "executive_secretary", "strategy_office", "business_simulator", "learning_lab",
  ];
  for (const id of ids) assert.ok(getModule(id), `${id} が必要`);
});

test("各モジュールは目的とハイライト(可視パネル)を持つ", () => {
  for (const m of ADVANCED_MODULES) {
    assert.ok(m.name.length > 0);
    assert.ok(m.purpose.length > 0);
    assert.ok(m.category.length > 0);
    assert.ok(m.highlights.length >= 1, `${m.id} のハイライト`);
    assert.ok(m.status === "mock" || m.status === "stub");
  }
});

test("モジュールIDは一意", () => {
  const ids = ADVANCED_MODULES.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("summarizeModules は mock/stub 内訳を集計する", () => {
  const s = summarizeModules();
  assert.equal(s.total, 12);
  assert.equal(s.mockPanels + s.serviceStubs, 12);
  assert.ok(s.categories >= 1);
});

test("runModuleStub は Mock 応答を返し、外部処理はしない", () => {
  const r = runModuleStub("musasabi_dna", "テスト");
  assert.equal(r.ok, true);
  assert.match(r.message, /Mock/);
  assert.match(r.message, /テスト/);
});

test("runModuleStub は未知IDで ok=false", () => {
  const r = runModuleStub("unknown" as AdvancedModuleId);
  assert.equal(r.ok, false);
});
