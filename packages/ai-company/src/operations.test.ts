import { strict as assert } from "node:assert";
import { test } from "node:test";
import { COMMAND_DEPARTMENTS } from "./commandCenter";
import { buildApprovalQueue, buildOperationsOverview } from "./operations";

test("承認キューは部署・ワークフロー・コラボの承認待ちを一元化する", () => {
  const queue = buildApprovalQueue();
  assert.ok(queue.length >= 3);
  const sources = new Set(queue.map((i) => i.source));
  assert.ok(sources.has("部署"));
  assert.ok(sources.has("ワークフロー"));
  assert.ok(sources.has("コラボレーション"));
  for (const i of queue) {
    assert.ok(i.title.length > 0);
    assert.ok(i.icon.length > 0);
  }
});

test("承認待ち部署が無ければ部署由来の承認は0件", () => {
  const allDone = COMMAND_DEPARTMENTS.map((d) => ({ ...d, status: "done" as const }));
  const queue = buildApprovalQueue(allDone);
  assert.equal(queue.filter((i) => i.source === "部署").length, 0);
});

test("運営オーバービューは各サマリーを束ね、承認キュー件数と一致", () => {
  const o = buildOperationsOverview();
  assert.ok(o.totalMembers > 0);
  assert.ok(o.utilizationPercent >= 0 && o.utilizationPercent <= 100);
  assert.equal(o.approvalQueueCount, buildApprovalQueue().length);
  assert.ok(o.runningWorkflows >= 1);
});
