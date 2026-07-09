import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PROVIDERS,
  AI_MODELS,
  CAPABILITY_KEYS,
  TASK_TYPES,
  UPGRADE_EVALUATIONS,
  MODEL_NOTIFICATIONS,
  MODEL_USAGE_KNOWLEDGE,
  STORES_API_KEYS,
  PRODUCTION_CONNECTIONS_ENABLED,
  SECRET_CENTER_RULES,
  computeEvaluationScore,
  getModel,
  recommendModelForTask,
  recommendAll,
  compareModels,
  recommendedUse,
  isSecretReferenceOnly,
  summarizeRegistryJa,
} from "./index";

test("初期プロバイダは9社(OpenAI/Anthropic/Google/Microsoft/Meta/Mistral/xAI/Ollama/LM Studio)", () => {
  assert.equal(PROVIDERS.length, 9);
  for (const p of ["openai", "anthropic", "google", "microsoft", "meta", "mistral", "xai", "ollama", "lmstudio"]) {
    assert.ok(PROVIDERS.includes(p as never), `missing provider ${p}`);
  }
});

test("能力スコアは14軸", () => {
  assert.equal(CAPABILITY_KEYS.length, 14);
});

test("各モデルはダッシュボード必須項目と14軸スコアを持つ", () => {
  assert.ok(AI_MODELS.length >= 5);
  for (const m of AI_MODELS) {
    assert.ok(m.name && m.provider && m.version && m.department && m.aiEmployee && m.strengths);
    assert.ok(m.contextLength > 0);
    for (const k of CAPABILITY_KEYS) {
      assert.ok(m.capabilities[k] >= 0 && m.capabilities[k] <= 100, `${m.id}.${k}`);
    }
    // 評価スコアは能力平均から算出される
    assert.equal(m.evaluationScore, computeEvaluationScore(m.capabilities));
  }
});

test("APIキーを保持せず参照名のみ(実キー形式は不許可)", () => {
  assert.equal(STORES_API_KEYS, false);
  for (const m of AI_MODELS) {
    assert.ok(isSecretReferenceOnly(m.secretRef), `${m.id} secretRef must be reference-only`);
    assert.ok(!/sk-|AKIA|ghp_|AIza/.test(m.secretRef), `${m.id} no real key format`);
  }
  // 実キー形式は false
  assert.equal(isSecretReferenceOnly("sk-1234567890"), false);
  assert.equal(isSecretReferenceOnly("secret:openai_api_key"), true);
});

test("AIルーティングは全8タスクに推奨モデルと理由を返す", () => {
  assert.equal(TASK_TYPES.length, 8);
  const all = recommendAll();
  assert.equal(all.length, 8);
  for (const r of all) {
    assert.ok(getModel(r.modelId), `recommended model exists ${r.modelId}`);
    assert.ok(r.reason.length > 0);
  }
  // コーディングはコーディング能力が高いモデルが選ばれる
  const coding = recommendModelForTask("coding");
  assert.ok(coding.model.capabilities.coding >= 80);
  // 画像生成はimageGenerationが高いモデル
  const img = recommendModelForTask("image_generation");
  const best = [...AI_MODELS].sort((a, b) => b.capabilities.imageGeneration - a.capabilities.imageGeneration)[0];
  assert.equal(img.modelId, best.id);
});

test("モデル比較は7項目(コスト/速度/精度/長さ/成功/失敗/用途)", () => {
  const rows = compareModels("anthropic-claude", "mistral-open");
  const labels = rows.map((r) => r.label);
  for (const l of ["コスト", "速度", "精度(総合)", "コンテキスト長", "成功率", "失敗率", "推奨用途"]) {
    assert.ok(labels.includes(l), `missing comparison ${l}`);
  }
  assert.deepEqual(compareModels("x", "y"), []);
});

test("recommendedUse は上位2能力を返す", () => {
  const m = getModel("mistral-open")!;
  const use = recommendedUse(m);
  assert.ok(use.includes("・"));
});

test("アップグレード評価は承認申請を持ち実採用はロック", () => {
  assert.ok(UPGRADE_EVALUATIONS.length >= 1);
  for (const u of UPGRADE_EVALUATIONS) {
    assert.ok(u.capabilityDiff && u.costDiff && u.riskNotes && u.approvalRequest);
    assert.equal(u.status, "locked");
  }
});

test("AI秘書通知は6種のうち複数を含む", () => {
  const types = new Set(MODEL_NOTIFICATIONS.map((n) => n.type));
  assert.ok(types.size >= 4);
  for (const n of MODEL_NOTIFICATIONS) assert.ok(getModel(n.modelId), `notif model ${n.modelId}`);
});

test("Company Brain 利用ナレッジは強み/弱み/事例/推奨を持つ", () => {
  assert.ok(MODEL_USAGE_KNOWLEDGE.length >= 1);
  for (const k of MODEL_USAGE_KNOWLEDGE) {
    assert.ok(k.strongTasks.length >= 1 && k.recommendedPatterns.length >= 1);
  }
});

test("Secret Center ルールと本番ロック", () => {
  assert.equal(PRODUCTION_CONNECTIONS_ENABLED, false);
  assert.ok(SECRET_CENTER_RULES.some((r) => r.includes("APIキー") || r.includes("API キー")));
  assert.ok(SECRET_CENTER_RULES.some((r) => r.includes("承認")));
});

test("summarizeRegistryJa は登録数と本番ロックを含む", () => {
  const s = summarizeRegistryJa();
  assert.ok(s.includes("レジストリ"));
  assert.ok(s.includes("ロック"));
});
