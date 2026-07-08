import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EVOLUTION_MODULES,
  EVOLUTION_GOVERNANCE_NOTES,
  getEvolutionModule,
  summarizeEvolutionModules,
  buildEvolutionSummaryJa,
  runEvolutionService,
} from "./index";

test("進化モジュールは12種で order が1..12の連番", () => {
  assert.equal(EVOLUTION_MODULES.length, 12);
  const orders = EVOLUTION_MODULES.map((m) => m.order).sort((a, b) => a - b);
  assert.deepEqual(orders, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test("指示書の全モジュールIDを含む", () => {
  const ids = EVOLUTION_MODULES.map((m) => m.id);
  for (const id of [
    "operating_manual", "skill_marketplace", "sandbox", "incident_center",
    "meeting_room", "simulation_engine", "recruiting", "upgrade_manager",
    "health_center", "memory_timeline", "command_console", "builder_department",
  ]) {
    assert.ok(ids.includes(id as never), `missing ${id}`);
  }
});

test("各モジュールは目的・ハイライト・統合ポイントを持つ", () => {
  for (const m of EVOLUTION_MODULES) {
    assert.ok(m.name.length > 0, `${m.id} name`);
    assert.ok(m.nameJa.length > 0, `${m.id} nameJa`);
    assert.ok(m.purpose.length > 0, `${m.id} purpose`);
    assert.ok(m.highlights.length >= 1, `${m.id} highlights`);
    assert.ok(m.integrations.length >= 1, `${m.id} integrations`);
  }
});

test("getEvolutionModule はIDで取得する", () => {
  assert.equal(getEvolutionModule("sandbox")?.nameJa, "AIサンドボックス");
  assert.equal(getEvolutionModule("nope" as never), undefined);
});

test("summarizeEvolutionModules は集計と統合ポイント数を返す", () => {
  const s = summarizeEvolutionModules();
  assert.equal(s.total, 12);
  assert.equal(s.mockPanels + s.services, 12);
  assert.equal(s.integrationPoints, 5); // Company Brain / Musasabi DNA / ガバナンス / 監査 / 経営ダッシュボード
});

test("buildEvolutionSummaryJa は keyStatus を要約する", () => {
  const lines = buildEvolutionSummaryJa();
  assert.equal(lines.length, 1);
  assert.ok(lines[0].includes("進化モジュール状況"));
  assert.ok(lines[0].includes("OS改善提案7件"));
});

test("runEvolutionService は Mock 実行結果を返し、未知IDで失敗", () => {
  const r = runEvolutionService("command_console", "全社の稼働状況を表示");
  assert.equal(r.ok, true);
  assert.ok(r.message.includes("Mock"));
  assert.ok(r.message.includes("全社の稼働状況を表示"));
  assert.equal(runEvolutionService("nope" as never).ok, false);
});

test("ガバナンス方針に承認必須・監査ログを明記", () => {
  assert.ok(EVOLUTION_GOVERNANCE_NOTES.some((n) => n.includes("承認")));
  assert.ok(EVOLUTION_GOVERNANCE_NOTES.some((n) => n.includes("監査ログ")));
});
