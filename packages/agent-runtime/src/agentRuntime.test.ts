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
