import { strict as assert } from "node:assert";
import { test } from "node:test";
import { COMMAND_DEPARTMENTS } from "./commandCenter";
import {
  DEV_PROJECTS,
  DEV_PROJECT_STATUSES,
  DEV_PROJECT_STATUS_COLOR,
  DEV_STAFF,
  buildDevKpi,
} from "./devProjects";

test("開発KPIは案件データと整合する", () => {
  const kpi = buildDevKpi(DEV_PROJECTS);
  assert.equal(kpi.totalProjects, DEV_PROJECTS.length);
  assert.equal(kpi.errorCount, DEV_PROJECTS.filter((p) => p.status === "エラー対応").length);
  assert.equal(kpi.released, DEV_PROJECTS.filter((p) => p.status === "リリース済み").length);
  assert.ok(kpi.averageProgressPercent > 0 && kpi.averageProgressPercent <= 100);
  assert.deepEqual(buildDevKpi([]), {
    totalProjects: 0,
    inProgress: 0,
    released: 0,
    errorCount: 0,
    averageProgressPercent: 0,
  });
});

test("全ステータスに色が定義され、案件のステータスは定義済みのもの", () => {
  for (const s of DEV_PROJECT_STATUSES) {
    assert.match(DEV_PROJECT_STATUS_COLOR[s], /^#/);
  }
  for (const p of DEV_PROJECTS) {
    assert.ok(DEV_PROJECT_STATUSES.includes(p.status));
  }
});

test("エラー対応案件はCommand Centerの開発部エラーと整合する", () => {
  const dev = COMMAND_DEPARTMENTS.find((d) => d.id === "development")!;
  const errorProject = DEV_PROJECTS.find((p) => p.status === "エラー対応")!;
  assert.equal(dev.status, "error");
  // 案件noteにCCのエラー原因(認証期限切れ)と同じ文脈が含まれる
  assert.ok(errorProject.note.includes("認証期限切れ"));
});

test("AI社員数は部署一覧(Command Center)の人数と整合する", () => {
  const dev = COMMAND_DEPARTMENTS.find((d) => d.id === "development")!;
  assert.equal(DEV_STAFF.length, dev.memberCount);
});

test("開発要約はエラー対応案件を伝え、吹き出し要約に含まれる", async () => {
  const { buildDevSummaryJa } = await import("./devProjects");
  const { buildAssistantSummaryJa, COMMAND_DEPARTMENTS: depts } = await import("./commandCenter");
  const lines = buildDevSummaryJa();
  assert.equal(lines.length, 1);
  assert.ok(lines[0].includes("P-302"));
  const summary = buildAssistantSummaryJa(depts);
  assert.ok(summary.includes("P-302"));
  assert.ok(summary.includes("未対応の問い合わせ"));
});
