import assert from "node:assert/strict";
import { test } from "node:test";

import { MockOcrProvider, analyzeUiSnapshot } from "./index";
import type { UiNode } from "./index";

const T0 = 1_751_950_000_000;

function node(kind: UiNode["kind"], label: string, enabled = true): UiNode {
  return { kind, label, enabled, bounds: { x: 0, y: 0, width: 100, height: 30 } };
}

const SNAPSHOT: UiNode[] = [
  node("window", "Musasabi OS β(1280x900)"),
  node("heading", "営業部 — KPI"),
  node("button", "テストコール開始"),
  node("button", "オートコール開始(承認待ち)", false),
  node("input", "顧客役として入力"),
  node("text", "β版はMock構成です"),
  node("text", "β版はMock構成です"), // 重複は除去される
];

test("analyzeUiSnapshot は操作可能ボタンのみをボタン検出結果に含める", () => {
  const analysis = analyzeUiSnapshot(SNAPSHOT, T0);
  assert.equal(analysis.actionableButtons.length, 1);
  assert.equal(analysis.actionableButtons[0].label, "テストコール開始");
  assert.equal(analysis.countByKind.button, 2); // 件数には disabled も含む
});

test("analyzeUiSnapshot は見出し・テキストを重複除去して抽出する(擬似OCR)", () => {
  const analysis = analyzeUiSnapshot(SNAPSHOT, T0);
  assert.deepEqual(analysis.extractedTexts, ["営業部 — KPI", "β版はMock構成です"]);
});

test("analyzeUiSnapshot はウィンドウ情報と日本語要約を返す", () => {
  const analysis = analyzeUiSnapshot(SNAPSHOT, T0);
  assert.equal(analysis.windows.length, 1);
  assert.equal(analysis.analyzedAtMs, T0);
  assert.ok(analysis.summaryJa.includes("ボタン2件"));
  assert.ok(analysis.summaryJa.includes("「テストコール開始」"));
});

test("空のスナップショットでも安全に解析できる", () => {
  const analysis = analyzeUiSnapshot([], T0);
  assert.deepEqual(analysis.actionableButtons, []);
  assert.equal(analysis.summaryJa, "画面から要素を検出できませんでした。");
});

test("同じ入力からは同じ解析結果が得られる(決定的)", () => {
  assert.deepEqual(analyzeUiSnapshot(SNAPSHOT, T0), analyzeUiSnapshot(SNAPSHOT, T0));
});

test("MockOcrProvider は実画像を解釈せず決定的なプレースホルダを返す", () => {
  const ocr = new MockOcrProvider();
  const result = ocr.recognize({ imageId: "screen-1.png", widthPx: 1280, heightPx: 900 });
  assert.equal(result.engine, "mock-ocr");
  assert.ok(result.lines[0].includes("screen-1.png"));
  assert.ok(result.lines[1].includes("未接続"));
  assert.deepEqual(result, ocr.recognize({ imageId: "screen-1.png", widthPx: 1280, heightPx: 900 }));
});
