import assert from "node:assert/strict";
import { test } from "node:test";

import { generateCallMinutes, toTranscriptSegments } from "./MinutesGenerator";
import type { MinutesTurn } from "./MinutesGenerator";

const T0 = 1_751_900_000_000;

const TURNS: MinutesTurn[] = [
  { speaker: "ai", text: "お世話になります。新プランのご案内です", timestampMs: T0 },
  { speaker: "human", text: "少し予算が高いですね", timestampMs: T0 + 5_000 },
  { speaker: "ai", text: "導入事例の資料を後日お送りします", timestampMs: T0 + 10_000 },
  { speaker: "human", text: "それなら申し込みます", timestampMs: T0 + 15_000 },
];

test("toTranscriptSegments はAIを担当者・人間を顧客へ写像し発話時間を推定する", () => {
  const segments = toTranscriptSegments(TURNS);
  assert.equal(segments.length, 4);
  assert.equal(segments[0].speaker, "rep");
  assert.equal(segments[1].speaker, "customer");
  assert.ok(segments[0].durationMs > 0);
  // 決定的: 同じ入力からは同じ出力
  assert.deepEqual(segments, toTranscriptSegments(TURNS));
});

test("generateCallMinutes は決定事項と宿題をキーワードで抽出する", () => {
  const minutes = generateCallMinutes("call-1", TURNS);
  assert.equal(minutes.callId, "call-1");
  assert.deepEqual(minutes.decisions, ["それなら申し込みます"]);
  assert.deepEqual(minutes.actionItems, ["導入事例の資料を後日お送りします"]);
  assert.deepEqual(minutes.participants, ["AI社員(担当者)", "顧客役"]);
});

test("generateCallMinutes は既存解析(キーワード・トーク比率・要約)を含む", () => {
  const minutes = generateCallMinutes("call-1", TURNS);
  assert.ok(minutes.analysis.keywords.includes("高い"));
  assert.ok(minutes.analysis.keywords.includes("申し込みます"));
  const { rep, customer } = minutes.analysis.talkRatio;
  assert.ok(Math.abs(rep + customer - 1) < 1e-9);
  assert.ok(minutes.analysis.summary.includes("発話比率"));
});

test("該当発話がない場合は決定事項・宿題が空になる", () => {
  const minutes = generateCallMinutes("call-2", [
    { speaker: "ai", text: "こんにちは", timestampMs: T0 },
  ]);
  assert.deepEqual(minutes.decisions, []);
  assert.deepEqual(minutes.actionItems, []);
});

test("空の会話でも安全に議事録を返す", () => {
  const minutes = generateCallMinutes("call-3", []);
  assert.deepEqual(minutes.decisions, []);
  assert.deepEqual(minutes.actionItems, []);
  assert.equal(minutes.analysis.callId, "call-3");
});
