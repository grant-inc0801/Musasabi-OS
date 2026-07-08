import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PUBLISHING_WORKS,
  PUBLISHING_STAGES,
  PUBLISHING_STAGE_LABEL_JA,
  EDITOR_NOTES,
  EDITOR_IN_CHIEF_ROLES,
  countWorksByStage,
  worksInStage,
  editorNotesForWork,
  buildPublishingSummary,
  buildPublishingSummaryJa,
} from "./publishing";

test("すべてのステージにラベルがある", () => {
  for (const stage of PUBLISHING_STAGES) {
    assert.ok(PUBLISHING_STAGE_LABEL_JA[stage], `${stage} のラベルが必要`);
  }
});

test("作品Mockは企画〜note準備までのステージを網羅する", () => {
  const counts = countWorksByStage();
  assert.ok(counts.planning >= 1);
  assert.ok(counts.writing >= 1);
  assert.ok(counts.proofreading >= 1);
  assert.ok(counts.similarity_check >= 1);
  assert.ok(counts.kindle_prep >= 1);
  assert.ok(counts.note_prep >= 1);
});

test("countWorksByStage の合計は作品数と一致する", () => {
  const counts = countWorksByStage();
  const total = PUBLISHING_STAGES.reduce((sum, s) => sum + counts[s], 0);
  assert.equal(total, PUBLISHING_WORKS.length);
});

test("worksInStage は該当ステージの作品だけ返す", () => {
  const proofing = worksInStage("proofreading");
  assert.ok(proofing.length >= 1);
  assert.ok(proofing.every((w) => w.stage === "proofreading"));
});

test("敏腕編集長AIの役割が7件そろっている", () => {
  assert.equal(EDITOR_IN_CHIEF_ROLES.length, 7);
  assert.ok(EDITOR_IN_CHIEF_ROLES.includes("物語構成を確認"));
});

test("editorNotesForWork は該当作品の指摘のみ返す", () => {
  const notes = editorNotesForWork("work-yozora-2");
  assert.ok(notes.length >= 1);
  assert.ok(notes.every((n) => n.workId === "work-yozora-2"));
});

test("編集長指摘はすべて既存の作品IDを参照する", () => {
  const ids = new Set(PUBLISHING_WORKS.map((w) => w.id));
  for (const n of EDITOR_NOTES) {
    assert.ok(ids.has(n.workId), `${n.workId} は作品に存在しない`);
  }
});

test("buildPublishingSummary は進捗と次アクションを返す", () => {
  const summary = buildPublishingSummary();
  assert.equal(summary.totalWorks, PUBLISHING_WORKS.length);
  assert.equal(summary.editorNoteCount, EDITOR_NOTES.length);
  assert.ok(summary.nextActions.length >= 1);
  assert.equal(summary.inProgressCount + summary.publishedCount, PUBLISHING_WORKS.length);
});

test("buildPublishingSummaryJa は校正待ち・編集長指摘に言及する", () => {
  const lines = buildPublishingSummaryJa();
  assert.ok(lines.some((l) => l.includes("校正待ち")));
  assert.ok(lines.some((l) => l.includes("敏腕編集長AI")));
});
