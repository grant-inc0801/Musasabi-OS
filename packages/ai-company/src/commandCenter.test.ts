import assert from "node:assert/strict";
import { test } from "node:test";

import {
  COMMAND_DEPARTMENTS,
  DEPT_CONNECTIONS,
  DEPT_STATUS_COLOR,
  DEPT_STATUSES,
  buildAssistantSummaryJa,
  summarizeCompany,
} from "./commandCenter";

test("初期部署は8部署で、ステータス色は4種すべて定義されている", () => {
  assert.equal(COMMAND_DEPARTMENTS.length, 8);
  assert.equal(DEPT_STATUSES.length, 4);
  assert.equal(DEPT_STATUS_COLOR.done, "#22C55E");
  assert.equal(DEPT_STATUS_COLOR.working, "#FACC15");
  assert.equal(DEPT_STATUS_COLOR.error, "#EF4444");
  assert.equal(DEPT_STATUS_COLOR.waiting_approval, "#A855F7");
});

test("部署間連携は存在する部署IDのみを参照する", () => {
  const ids = new Set(COMMAND_DEPARTMENTS.map((d) => d.id));
  for (const c of DEPT_CONNECTIONS) {
    assert.ok(ids.has(c.from), c.from);
    assert.ok(ids.has(c.to), c.to);
  }
});

test("summarizeCompany は総員・稼働中(完了/作業中)・稼働率を集計する", () => {
  const overview = summarizeCompany(COMMAND_DEPARTMENTS);
  assert.equal(overview.totalMembers, 32);
  // 完了(8+4+2)+作業中(5+2)=21
  assert.equal(overview.activeMembers, 21);
  assert.equal(overview.utilizationPercent, Math.round((21 / 32) * 100));
});

test("buildAssistantSummaryJa は承認待ち・エラー原因/解決策・全体進行を要約する", () => {
  const text = buildAssistantSummaryJa(COMMAND_DEPARTMENTS);
  assert.ok(text.includes("出版部と人事部で承認待ち"));
  assert.ok(text.includes("システム開発部ではエラー"));
  assert.ok(text.includes("認証期限切れ"));
  assert.ok(text.includes("APIキーを更新"));
  assert.ok(text.includes("全体の進行状況は約"));
  // 決定的
  assert.equal(text, buildAssistantSummaryJa(COMMAND_DEPARTMENTS));
});
