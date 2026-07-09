import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MONO_EYE_STATES,
  MOTION_CATALOG,
  MODEL_SPEC,
  COLOR_PALETTE,
  TRIPO_FLOW,
  TRIPO_GENERATION_LOCKED,
  DEFAULT_EMOTION,
  controlsForEmotion,
  emotionStatePayload,
  resolveMonoEye,
  isAndroidEmotion,
  buildTripoPrompt,
  buildTripoRequest,
  summarizeAndroidSpecJa,
} from "./index";

test("モノアイ感情ステートは8種で全てHEXカラーを持つ", () => {
  assert.equal(MONO_EYE_STATES.length, 8);
  for (const s of MONO_EYE_STATES) {
    assert.match(s.eyeColor, /^#[0-9A-Fa-f]{6}$/, `${s.id} eyeColor`);
    assert.ok(s.note.length > 0, `${s.id} note`);
  }
  const ids = MONO_EYE_STATES.map((s) => s.id);
  for (const id of ["neutral", "happy", "thinking", "working", "surprised", "worried", "sleepy", "error"]) {
    assert.ok(ids.includes(id as never), `missing ${id}`);
  }
});

test("指示書のカラー参照値と一致する", () => {
  assert.equal(resolveMonoEye("thinking").eyeColor, "#FFD700");
  assert.equal(resolveMonoEye("happy").eyeColor, "#00FF7F");
  assert.equal(resolveMonoEye("error").eyeColor, "#FF3B30");
  assert.equal(resolveMonoEye("sleepy").eyeColor, "#9B59B6");
});

test("controlsForEmotion は色/明るさ/点滅/スキャンを導出する", () => {
  const thinking = controlsForEmotion("thinking");
  assert.equal(thinking.color, "#FFD700");
  assert.equal(thinking.scan, true); // 考え中はスキャン
  assert.equal(thinking.blink, 0);
  const error = controlsForEmotion("error");
  assert.equal(error.brightness, 100);
  assert.equal(error.blink, 90); // エラーは点滅
  const sleepy = controlsForEmotion("sleepy");
  assert.equal(sleepy.brightness, 35); // 眠いは暗め
});

test("emotionStatePayload は指示書のEmotion State例と同形", () => {
  const p = emotionStatePayload("thinking");
  assert.equal(p.state, "thinking");
  assert.equal(p.eyeColor, "#FFD700");
  assert.equal(p.motion, "head_tilt.glb");
  assert.equal(p.duration, 3500);
  assert.equal(p.expression, "thinking");
  assert.equal(p.autoReturn, true);
});

test("isAndroidEmotion / resolveMonoEye は未知IDを通常へフォールバック", () => {
  assert.equal(isAndroidEmotion("thinking"), true);
  assert.equal(isAndroidEmotion("unknown"), false);
  assert.equal(resolveMonoEye("nope" as never).id, DEFAULT_EMOTION);
});

test("モーションカタログは感情+バリエーション+待機を含む", () => {
  assert.ok(MOTION_CATALOG.length >= 16);
  const cats = new Set(MOTION_CATALOG.map((m) => m.category));
  assert.ok(cats.has("emotion"));
  assert.ok(cats.has("variation"));
  assert.ok(cats.has("idle"));
  const ids = MOTION_CATALOG.map((m) => m.id);
  for (const id of ["walk", "run", "jump", "bow", "fall", "ok_sign", "cheer"]) {
    assert.ok(ids.includes(id), `missing motion ${id}`);
  }
});

test("3Dモデル仕様は出力形式/ポリゴン/PBR/リグ/アニメを含む", () => {
  const keys = MODEL_SPEC.map((m) => m.key);
  for (const k of ["format", "polygons", "texture", "rig", "expression", "animation", "material"]) {
    assert.ok(keys.includes(k), `missing spec ${k}`);
  }
  assert.ok(MODEL_SPEC.find((m) => m.key === "format")!.value.includes("GLB"));
});

test("カラーパレットはメイン/サブ金属+感情カラーを含む", () => {
  const byKey = Object.fromEntries(COLOR_PALETTE.map((c) => [c.key, c.hex]));
  assert.equal(byKey["metal-main"], "#2B2F34");
  assert.equal(byKey["metal-sub"], "#6B6F74");
  assert.equal(byKey["accent"], "#00BFFF");
});

test("Tripo3D 実生成はロック・gatedステップに承認が必要", () => {
  assert.equal(TRIPO_GENERATION_LOCKED, true);
  const gated = TRIPO_FLOW.filter((s) => s.gated).map((s) => s.id);
  assert.ok(gated.includes("generate"));
  assert.ok(gated.includes("export"));
  assert.ok(gated.includes("optimize"));
  // プロンプト生成と実装は Mock で実施可能
  assert.equal(TRIPO_FLOW.find((s) => s.id === "prompt")!.gated, false);
});

test("buildTripoPrompt は指示書テンプレートを決定論的に生成", () => {
  const p = buildTripoPrompt();
  assert.ok(p.includes("robotic flying squirrel"));
  assert.ok(p.includes("mono-eye"));
  assert.ok(p.includes("Wind-up key"));
  assert.ok(p.includes("Musasabi Android"));
  // 決定論
  assert.equal(buildTripoPrompt(), p);
  assert.ok(buildTripoPrompt({ name: "MUSA" }).includes("MUSA"));
});

test("buildTripoRequest は実キーを含めず参照名のみ・locked", () => {
  const req = buildTripoRequest();
  assert.equal(req.locked, true);
  assert.equal(req.authRef, "env:TRIPO3D_API_KEY");
  assert.ok(!JSON.stringify(req).includes("sk-"));
  assert.equal(req.body.type, "text_to_model");
  assert.equal(req.body.format, "glb");
});

test("summarizeAndroidSpecJa は感情数・モーション数・ロック状態を要約", () => {
  const s = summarizeAndroidSpecJa();
  assert.ok(s.includes("モノアイ8感情"));
  assert.ok(s.includes("ロック中"));
});
