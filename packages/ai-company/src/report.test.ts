import { strict as assert } from "node:assert";
import { test } from "node:test";
import { COMMAND_DEPARTMENTS } from "./commandCenter";
import { buildCompanyReport, renderReportMarkdown } from "./report";

test("全社レポートは各集計を束ねる", () => {
  const r = buildCompanyReport(COMMAND_DEPARTMENTS, 1751990400000);
  assert.equal(r.generatedAtMs, 1751990400000);
  assert.equal(r.departments.length, COMMAND_DEPARTMENTS.length);
  assert.ok(r.overview.totalMembers > 0);
  assert.ok(r.workflow.total >= 1);
  assert.ok(r.collaboration.totalItems >= 1);
});

test("Markdown レポートに主要セクションが含まれる", () => {
  const md = renderReportMarkdown(buildCompanyReport(COMMAND_DEPARTMENTS, 1751990400000));
  assert.ok(md.includes("# Musasabi OS 全社レポート"));
  assert.ok(md.includes("## 運営サマリー"));
  assert.ok(md.includes("## 部署別KPI"));
  assert.ok(md.includes("## ワークフロー"));
  assert.ok(md.includes("## コラボレーション"));
  // 各部署名が列挙される
  for (const d of COMMAND_DEPARTMENTS) {
    assert.ok(md.includes(d.name), `missing ${d.name}`);
  }
});
