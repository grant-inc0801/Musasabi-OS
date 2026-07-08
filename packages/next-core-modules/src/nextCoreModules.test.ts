import { test } from "node:test";
import assert from "node:assert/strict";
import {
  NEXT_CORE_MODULES,
  getNextModule,
  summarizeNextModules,
  buildNextModulesSummaryJa,
  runModuleService,
  type NextModuleId,
} from "./index";

test("12モジュールが優先順位1-12で定義されている", () => {
  assert.equal(NEXT_CORE_MODULES.length, 12);
  const priorities = NEXT_CORE_MODULES.map((m) => m.priority).sort((a, b) => a - b);
  assert.deepEqual(priorities, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test("優先順位どおり AI Constitution が最上位", () => {
  const first = [...NEXT_CORE_MODULES].sort((a, b) => a.priority - b.priority)[0];
  assert.equal(first.id, "ai_constitution");
});

test("全モジュールに目的・ハイライト(Mockパネル/サービス)がある", () => {
  const ids: NextModuleId[] = [
    "ai_constitution", "mission_control", "situation_room", "digital_twin",
    "relationship_graph", "memory_engine", "customer_brain", "quality_assurance",
    "security_center", "cost_optimizer", "competitor_center", "innovation_lab",
  ];
  for (const id of ids) {
    const m = getNextModule(id);
    assert.ok(m, `${id} が必要`);
    assert.ok(m.purpose.length > 0);
    assert.ok(m.highlights.length >= 1);
    assert.ok(m.form === "mock" || m.form === "service");
  }
});

test("summarizeNextModules は mock/service 内訳を集計", () => {
  const s = summarizeNextModules();
  assert.equal(s.total, 12);
  assert.equal(s.mockPanels + s.services, 12);
});

test("buildNextModulesSummaryJa はアバター用の主要状態要約を返す", () => {
  const lines = buildNextModulesSummaryJa();
  assert.ok(lines.length >= 1);
  assert.match(lines[0], /コアモジュール状況/);
  // セキュリティ/コスト等の keyStatus を含む
  assert.match(lines[0], /セキュリティ|節約候補|アラート/);
});

test("runModuleService は Mock 応答・外部接続なし", () => {
  const r = runModuleService("cost_optimizer", "test");
  assert.equal(r.ok, true);
  assert.match(r.message, /Mock/);
  assert.equal(runModuleService("nope" as NextModuleId).ok, false);
});
