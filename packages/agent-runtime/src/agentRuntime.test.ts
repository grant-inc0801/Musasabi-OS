import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import {
  AgentRuntime,
  defaultTools,
  detectBrain,
  chatOnce,
  chatWithHistory,
  OllamaProvider,
  RuleBasedProvider,
  DEFAULT_LLM_SETTINGS,
  type AgentGoal,
} from "./index";

// ─────────── Ollama 互換エミュレータ(統合テスト用・実LLM不要) ───────────

function startFakeOllama(port: number): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (req.url === "/api/tags") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ models: [{ name: "qwen2.5:0.5b" }] }));
        return;
      }
      if (req.url === "/api/chat" && req.method === "POST") {
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", () => {
          const parsed = JSON.parse(body) as { model: string; messages: Array<{ content: string }> };
          const last = parsed.messages[parsed.messages.length - 1]?.content ?? "";
          const reply = last.includes("[PLAN]")
            ? "1. 調査する\n2. 作成する\n3. 報告する"
            : last.includes("[REPORT]")
              ? "全ステップ完了。成果は良好です。(fake-llm)"
              : `了解: ${last.slice(0, 20)} (fake-llm)`;
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ model: parsed.model, message: { role: "assistant", content: reply } }));
        });
        return;
      }
      res.writeHead(404);
      res.end();
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

const goalTemplate: AgentGoal = {
  id: "g1",
  title: "新サービス立ち上げ(Mock)",
  description: "新サービスの立ち上げを例示フローに沿って実行する",
  workflowTemplateId: "wf-new-service",
};

test("ルールベース頭脳でループが計画→行動→承認停止→再開→報告まで完走する", async () => {
  const rt = new AgentRuntime({ provider: new RuleBasedProvider(), now: () => 1000 });
  let s = await rt.start(goalTemplate);
  assert.equal(s.steps[0].kind, "plan");
  s = await rt.runUntilPause(s);
  // 例示フローには AI CEO 承認ノードがある → 承認待ちで停止
  assert.equal(s.status, "waiting_approval");
  assert.ok(s.steps.some((st) => st.kind === "approval" && st.status === "waiting_approval"));
  // 承認して再開 → 完了
  s = rt.approve(s);
  assert.equal(s.status, "running");
  s = await rt.runUntilPause(s);
  assert.equal(s.status, "completed");
  assert.ok(s.finalReport && s.finalReport.includes("目標"));
  // Company Brain 書き込みと監査ログ
  assert.ok(s.brainWrites.length >= 1);
  assert.ok(s.auditLog.some((a) => a.event === "approval_requested"));
  assert.ok(s.auditLog.some((a) => a.event === "run_completed"));
  // 部署ノードが実行主体として現れる(マルチエージェント的ハンドオフ)
  assert.ok(s.steps.some((st) => st.actor.includes("市場調査部")));
  assert.ok(s.steps.some((st) => st.actor.includes("マーケティング部")));
});

test("テンプレート無しの汎用目標も act→observe→report で完了する", async () => {
  const rt = new AgentRuntime({ provider: new RuleBasedProvider(), now: () => 1000 });
  let s = await rt.start({ id: "g2", title: "日報の要約", description: "本日の日報を要約して報告する" });
  s = await rt.runUntilPause(s);
  assert.equal(s.status, "completed");
  const kinds = s.steps.map((st) => st.kind);
  assert.deepEqual(kinds, ["plan", "act", "observe", "report"]);
});

test("外部変更を伴うツールはポリシー検証で遮断される", async () => {
  const externalTool = {
    name: "post_sns", labelJa: "SNS実投稿", external: true,
    run: () => "(実行されてはいけない)",
  };
  const rt = new AgentRuntime({ provider: new RuleBasedProvider(), tools: [...defaultTools(), externalTool], now: () => 1000 });
  let s = await rt.start({ id: "g3", title: "実投稿テスト", description: "SNSへ実投稿する" });
  // キューを直接使えないため、テンプレート無し経路の act ツールを差し替え不能 →
  // 外部ツールを使う act をエミュレートするために observe 前の act を上書き検証:
  // ここでは validateDecision 単体の遮断を AgentRuntime 経由で確認する目的のため、
  // 汎用キューの act(summarize) 完了後に手動で外部 act を tick させる代わりに、
  // maxSteps=1 の別ランタイムで外部ツール実行を再現する。
  const rt2 = new AgentRuntime({ provider: new RuleBasedProvider(), tools: [externalTool], now: () => 1000 });
  const s2 = await rt2.start({ id: "g4", title: "外部行動", description: "外部" });
  // 内部キューの先頭 act の tool を externalに差し替え(テスト用に as any)
  (rt2 as unknown as { queues: Map<string, Array<{ kind: string; actor: string; tool?: string; input: string }>> })
    .queues.get(s2.id)![0] = { kind: "act", actor: "テスト", tool: "post_sns", input: "実投稿" };
  const after = await rt2.tick(s2);
  assert.equal(after.status, "blocked");
  assert.ok(after.steps.some((st) => st.status === "blocked" && st.output.includes("ポリシー違反")));
  assert.ok(after.auditLog.some((a) => a.event === "policy_blocked"));
  // 元の s は未使用警告回避
  assert.ok(s.id);
});

test("maxSteps 上限で暴走を停止する", async () => {
  const rt = new AgentRuntime({ provider: new RuleBasedProvider(), maxSteps: 2, now: () => 1000 });
  let s = await rt.start(goalTemplate);
  s = await rt.runUntilPause(s);
  assert.ok(s.status === "blocked" || s.status === "waiting_approval");
  if (s.status === "blocked") {
    assert.ok(s.auditLog.some((a) => a.event === "max_steps"));
  }
});

test("OllamaProvider は互換APIで検出・推論できる(エミュレータ統合)", async () => {
  const server = await startFakeOllama(43110);
  try {
    const settings = { baseUrl: "http://127.0.0.1:43110", model: "qwen2.5:0.5b" };
    const brain = await detectBrain(settings);
    assert.equal(brain.source, "ollama");
    const reply = await brain.provider.chat([{ role: "user", content: "こんにちは" }]);
    assert.ok(reply.includes("fake-llm"));
    // エージェントループもLLM頭脳で完走する
    const rt = new AgentRuntime({ provider: brain.provider, now: () => 1000 });
    let s = await rt.start({ id: "g5", title: "要約タスク", description: "テキストを要約して報告" });
    s = await rt.runUntilPause(s);
    assert.equal(s.status, "completed");
    assert.ok(s.finalReport!.includes("fake-llm"));
  } finally {
    server.close();
  }
});

test("Ollama 不在時は detectBrain がルールベースへフォールバックする", async () => {
  const brain = await detectBrain({ baseUrl: "http://127.0.0.1:43199", model: "x" });
  assert.equal(brain.source, "fallback");
  assert.equal(brain.provider.kind, "rule_based");
});

test("chatOnce はアプリ文脈つきで頭脳に応答させる", async () => {
  const reply = await chatOnce(new RuleBasedProvider(), "レポートはどこ?", "Dashboard > レポート");
  assert.ok(reply.length > 0);
});

test("既定設定は無料ローカル(localhost・軽量モデル)", () => {
  assert.ok(DEFAULT_LLM_SETTINGS.baseUrl.includes("127.0.0.1"));
  assert.ok(DEFAULT_LLM_SETTINGS.model.length > 0);
  const p = new OllamaProvider();
  assert.ok(p.name.includes("ローカルLLM"));
});

test("検出失敗時は probeError に失敗理由が入る(診断表示用)", async () => {
  const brain = await detectBrain({ baseUrl: "http://127.0.0.1:43198", model: "qwen2.5:0.5b" });
  assert.equal(brain.source, "fallback");
  assert.ok(typeof brain.probeError === "string" && brain.probeError.length > 0);
});

test("chatWithHistory は直近の会話を文脈としてプロバイダへ渡す", async () => {
  const seen: Array<{ role: string; content: string }[]> = [];
  const probe = {
    name: "probe",
    kind: "rule_based" as const,
    async chat(messages: readonly { role: string; content: string }[]) {
      seen.push([...messages]);
      return "ok";
    },
  };
  await chatWithHistory(
    probe,
    [
      { role: "user", content: "週次レポートの件どうなってる?" },
      { role: "assistant", content: "本日分は作成済みです。" },
    ],
    "それを実行して",
    "アプリ構成テスト",
  );
  const msgs = seen[0];
  assert.equal(msgs.length, 4); // system + user + assistant + user
  assert.equal(msgs[1].content.includes("週次レポート"), true);
  assert.equal(msgs[2].role, "assistant");
  assert.equal(msgs[3].content, "それを実行して");
});

test("部署AI会議: 全員が各ラウンドで発言し、司会が結論をまとめる", async () => {
  const { runDiscussion, defaultPersonas } = await import("./discussion");
  const result = await runDiscussion(new RuleBasedProvider(), "新商品の価格設定", defaultPersonas(), 2);
  assert.equal(result.turns.length, 6); // 3人 × 2ラウンド
  assert.equal(result.turns[0].personaName, "営業部長AI");
  assert.equal(result.turns[3].round, 2);
  assert.ok(result.conclusion.includes("結論"));
});

test("部署AI会議: LLM頭脳(エミュレータ)でも議事録と結論が得られる", async () => {
  const server = await startFakeOllama(43122);
  try {
    const brain = await detectBrain({ baseUrl: "http://127.0.0.1:43122", model: "qwen2.5:0.5b" });
    assert.equal(brain.source, "ollama");
    const { runDiscussion } = await import("./discussion");
    const result = await runDiscussion(brain.provider, "新市場への参入", undefined, 1);
    assert.equal(result.turns.length, 3);
    assert.ok(result.conclusion.length > 0);
  } finally {
    server.close();
  }
});

test("タスク別ルーティング: 報告は reportProvider、観察は provider を使う", async () => {
  const calls: string[] = [];
  const mk = (tag: string) => ({
    name: tag,
    kind: "rule_based" as const,
    async chat(messages: readonly { role: string; content: string }[]) {
      const last = messages[messages.length - 1]?.content ?? "";
      calls.push(`${tag}:${last.includes("[REPORT]") ? "report" : last.includes("[OBSERVE]") ? "observe" : "other"}`);
      return `${tag} response`;
    },
  });
  const rt = new AgentRuntime({ provider: mk("fast"), reportProvider: mk("quality") });
  let s = await rt.start({ id: "g", title: "汎用タスク", description: "テスト" });
  s = await rt.runUntilPause(s);
  assert.equal(s.status, "completed");
  assert.ok(calls.includes("fast:observe"));
  assert.ok(calls.includes("quality:report"));
  assert.ok(!calls.includes("fast:report"));
});

test("未来予測: 複数分岐→実現性で選出→提案生成(ルールベース)", async () => {
  const { runForecast } = await import("./forecast");
  const result = await runForecast(new RuleBasedProvider(), "AI市場が前年比40%成長。小型モデルの性能向上が続く。", 3);
  assert.equal(result.scenarios.length, 3);
  assert.ok(result.selected);
  // 主流分岐(確率65%)が選出される
  assert.equal(result.selected!.plausibility, 65);
  assert.ok(result.scenarios.every((s) => s.ethical));
  assert.ok(result.proposals.length >= 2);
  assert.ok(result.proposals[0].title.length > 0);
});

test("未来予測: 倫理に反する分岐は除外され、選出対象にならない", async () => {
  const { runForecast, screenEthics } = await import("./forecast");
  assert.equal(screenEthics("世論操作ツールが普及する未来"), "人の意思決定の不当な操作");
  assert.equal(screenEthics("業務効率が改善する未来"), null);
  let call = 0;
  const provider = {
    name: "probe",
    kind: "rule_based" as const,
    async chat() {
      call += 1;
      if (call === 1) return "タイトル: 偽情報生成の産業化\n半年後: フェイク動画が氾濫する。\n1年後: 世論操作が常態化する。\n確率: 90%";
      if (call <= 3) return `タイトル: 健全な自動化の進展\n半年後: 業務効率が改善する。\n1年後: 定着する。\n確率: ${call === 2 ? 60 : 45}%`;
      return "提案1: 準備調査 — 現状の棚卸しを行う。\n提案2: 体制整備 — 運用ルールを文書化する。";
    },
  };
  const result = await runForecast(provider, "テスト入力", 3);
  const excluded = result.scenarios.find((s) => !s.ethical);
  assert.ok(excluded, "倫理除外された分岐が存在する");
  assert.equal(excluded!.plausibility, 90);
  // 確率90%でも倫理除外なら選ばれず、倫理通過の60%が選出される
  assert.ok(result.selected);
  assert.equal(result.selected!.plausibility, 60);
  assert.equal(result.selected!.ethical, true);
});

test("AGI深層予測: サブ分岐展開・自己批評による較正・葉レベル選出・憲章チェック", async () => {
  const { runForecastDeep } = await import("./forecast");
  const result = await runForecastDeep(new RuleBasedProvider(), "AI市場データ(テスト)");
  // 粒度: 倫理通過の主分岐3本すべてに2本のサブ分岐
  assert.equal(Object.keys(result.subBranches).length, 3);
  for (const subs of Object.values(result.subBranches)) {
    assert.equal(subs.length, 2);
  }
  // 精度: 自己批評による較正(66% と 補正60% の平均=63)と批評ノート
  assert.ok(result.selectedLeaf);
  assert.equal(result.selectedLeaf!.sub.plausibility, 66);
  assert.equal(result.selectedLeaf!.sub.calibratedPlausibility, 63);
  assert.ok(result.selectedLeaf!.sub.critiqueNote!.includes("補正"));
  // 憲章チェック: 提案ごとに適合ノート
  assert.ok(result.constitutionNotes.length >= 2);
  assert.ok(result.constitutionNotes[0].includes("憲章適合=OK"));
  assert.ok(result.constitutionNotes[0].includes("承認"));
  // 履歴なしなら学習ノートなし
  assert.equal(result.learningNote, undefined);
});

test("AGI深層予測: 履歴を渡すと学習ノートを生成し、サブ分岐の倫理違反も除外する", async () => {
  const { runForecastDeep } = await import("./forecast");
  const withHistory = await runForecastDeep(new RuleBasedProvider(), "AI市場データ", "前回選出: ローカルAIの業務標準化(実現性65%)");
  assert.ok(withHistory.learningNote!.includes("前回予測"));
  // サブ分岐の倫理違反除外: 不正なサブ分岐を返すプローブ
  let call = 0;
  const probe = {
    name: "probe",
    kind: "rule_based" as const,
    async chat(messages: readonly { role: string; content: string }[]) {
      const last = messages[messages.length - 1]?.content ?? "";
      call += 1;
      if (last.includes("[FORECAST]")) return "タイトル: 健全分岐\n半年後: 進む。\n1年後: 定着。\n確率: 70%";
      if (last.includes("[SUBFORECAST]") && last.includes("加速側")) return "タイトル: 偽情報を使った拡販\n半年後: フェイク広告が増える。\n1年後: 常態化。\n確率: 95%";
      if (last.includes("[SUBFORECAST]")) return "タイトル: 健全な普及\n半年後: 進む。\n1年後: 定着。\n確率: 55%";
      if (last.includes("[CRITIQUE]")) return "妥当。補正確率: 55%";
      if (last.includes("[PROPOSE]")) return "提案1: 準備 — 調査する。\n提案2: 整備 — 文書化する。";
      return "OK";
    },
  };
  const result = await runForecastDeep(probe, "テスト");
  const allSubs = Object.values(result.subBranches).flat();
  const unethicalSub = allSubs.find((s) => !s.ethical);
  assert.ok(unethicalSub, "倫理違反サブ分岐が検出される");
  assert.equal(unethicalSub!.plausibility, 95);
  // 95%でも選ばれず、健全な55%の葉が選出される
  assert.ok(result.selectedLeaf);
  assert.equal(result.selectedLeaf!.sub.ethical, true);
  assert.equal(result.selectedLeaf!.sub.calibratedPlausibility, 55);
});

test("的中率トラッキング: 予測と実績の突合が決定論で hit/partial/miss を提案する", async () => {
  const { evaluateForecastOutcome, extractForecastKeywords } = await import("./forecast");
  // キーワード抽出: 一般語(半年/予測など)は除外される
  const kws = extractForecastKeywords("ローカルLLMと小型モデルの実用化が半年以内に進むと予測");
  assert.ok(kws.includes("LLM"));
  assert.ok(kws.includes("小型モデル") || kws.includes("モデル"));
  assert.ok(!kws.includes("半年"));
  // hit: 実績見出しに予測キーワードが十分現れる
  const hit = evaluateForecastOutcome("ローカルLLMと小型モデルの実用化が主流に", [
    "各社がローカルLLM対応を発表",
    "小型モデルの実用化事例が急増",
    "エッジでの実用化が主流になりつつある",
  ]);
  assert.equal(hit.suggestion, "hit");
  assert.ok(hit.matchRatio >= 0.6);
  assert.ok(hit.matchedKeywords.includes("LLM"));
  // miss: 実績に予測キーワードがほぼ現れない
  const miss = evaluateForecastOutcome("量子コンピュータの商用化が加速", [
    "クラウド各社が値下げを発表",
    "新しいスマートフォンが発売",
  ]);
  assert.equal(miss.suggestion, "miss");
  // 空予測は miss(ゼロ除算なし)
  assert.equal(evaluateForecastOutcome("", ["何か"]).suggestion, "miss");
});
