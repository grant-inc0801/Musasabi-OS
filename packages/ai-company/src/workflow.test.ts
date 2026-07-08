import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  COMPANY_WORKFLOWS,
  WORKFLOW_STATUS_COLOR,
  WORKFLOW_STEP_STATUSES,
  buildWorkflowSummary,
  currentStep,
  workflowProgress,
} from "./workflow";

test("各ワークフローはステップを持ち、進捗は完了率と一致", () => {
  for (const wf of COMPANY_WORKFLOWS) {
    assert.ok(wf.steps.length > 0);
    const done = wf.steps.filter((s) => s.status === "完了").length;
    assert.equal(workflowProgress(wf), Math.round((done / wf.steps.length) * 100));
  }
});

test("currentStep は最初の未完了ステップを返す", () => {
  const wf = COMPANY_WORKFLOWS.find((w) => w.id === "productize")!;
  const cur = currentStep(wf);
  assert.equal(cur?.action, "社内ツール化(実装)");
  const allDone = {
    id: "x",
    name: "x",
    description: "",
    steps: [{ deptId: "sales", deptName: "営業部", action: "a", status: "完了" as const }],
  };
  assert.equal(currentStep(allDone), null);
});

test("全ステータスに色が定義されている", () => {
  for (const s of WORKFLOW_STEP_STATUSES) {
    assert.match(WORKFLOW_STATUS_COLOR[s], /^#/);
  }
});

test("ワークフローサマリーは進行中/承認待ち/平均進捗を集計する", () => {
  const s = buildWorkflowSummary();
  assert.equal(s.total, COMPANY_WORKFLOWS.length);
  assert.ok(s.running >= 1);
  assert.ok(s.waitingApproval >= 1); // 出版フローに承認待ちがある
  assert.ok(s.averageProgressPercent > 0 && s.averageProgressPercent < 100);
  assert.deepEqual(buildWorkflowSummary([]), {
    total: 0,
    running: 0,
    waitingApproval: 0,
    averageProgressPercent: 0,
  });
});
