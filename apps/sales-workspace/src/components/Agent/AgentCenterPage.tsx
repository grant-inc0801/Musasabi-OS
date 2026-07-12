import { useEffect, useMemo, useRef, useState } from "react";
import {
  AgentRuntime,
  detectBrain,
  WORKFLOW_TEMPLATES,
  type AgentRunState,
  type AgentGoal,
  type DetectedBrain,
} from "@musasabi/agent-runtime";
import { loadLlmSettings, saveLlmSettings } from "../../lib/llmSettings";
import { resolveLlmFetch } from "../../lib/llmFetch";
import { recordMemory } from "../../lib/memoryStorage";
import { buildAgentTools } from "../../lib/agentTools";
import { saveBinaryFile } from "../../lib/saveFile";
import { isTtsAvailable, speakJaBest } from "../../lib/voice";
import { sendAgentNotification } from "../../lib/freeConnectors";

// エージェント実行センター — Musasabi を「本物のエージェント」として動かす画面。
// 頭脳: ローカルLLM(Ollama・無料・localhost・外部送信なし)を自動検出。
// 未検出時はルールベース頭脳で同じループが動作(フォールバック)。
// ループ: 計画→行動(ローカルツール)→承認(人間ゲート)→観察→報告。
// 各行動は Intelligence Layer のポリシー検証を通過し、監査ログと Company Brain 書き込みを残す。

const STEP_KIND_LABEL: Record<string, string> = {
  plan: "計画", act: "行動", approval: "承認", observe: "観察", report: "報告",
};

const GOAL_PRESETS: AgentGoal[] = [
  {
    id: "preset-new-service",
    title: "新サービス立ち上げ(例示フロー)",
    description: "営業→市場調査→マーケ→AI CEO承認→開発→監査 の例示フローで新サービス立ち上げを実行する",
    workflowTemplateId: "wf-new-service",
  },
  {
    id: "preset-weekly-report",
    title: "週次レポート自動化",
    description: "各部KPIを集約して週次レポートを作成・通知する",
    workflowTemplateId: "wf-weekly-report",
  },
];

export function AgentCenterPage() {
  const [settings, setSettings] = useState(() => loadLlmSettings());
  const [brain, setBrain] = useState<DetectedBrain | null>(null);
  const [probing, setProbing] = useState(false);
  const [transport, setTransport] = useState<string>("");
  const [run, setRun] = useState<AgentRunState | null>(null);
  const [running, setRunning] = useState(false);
  const [customGoal, setCustomGoal] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const runtimeRef = useRef<AgentRuntime | null>(null);

  async function probe(): Promise<DetectedBrain> {
    setProbing(true);
    try {
      const f = await resolveLlmFetch();
      setTransport(f ? "ネイティブHTTP(デスクトップ)" : "ブラウザfetch");
      const b = await detectBrain(settings, f);
      setBrain(b);
      return b;
    } finally {
      setProbing(false);
    }
  }

  useEffect(() => {
    void probe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startGoal(goal: AgentGoal): Promise<void> {
    const b = brain ?? (await probe());
    const rt = new AgentRuntime({ provider: b.provider, tools: buildAgentTools() });
    runtimeRef.current = rt;
    setRunning(true);
    setSavedNote(null);
    let s = await rt.start(goal);
    setRun({ ...s, steps: [...s.steps] });
    // 1ステップずつ進めて画面に流す(自律ループの可視化)
    while (s.status === "running") {
      await new Promise((r) => setTimeout(r, 350));
      s = await rt.tick(s);
      setRun({ ...s, steps: [...s.steps] });
    }
    setRunning(false);
    if (s.status === "completed") persistResults(s);
  }

  async function approveAndResume(): Promise<void> {
    const rt = runtimeRef.current;
    if (!rt || !run) return;
    let s = rt.approve(run);
    setRun({ ...s, steps: [...s.steps] });
    setRunning(true);
    while (s.status === "running") {
      await new Promise((r) => setTimeout(r, 350));
      s = await rt.tick(s);
      setRun({ ...s, steps: [...s.steps] });
    }
    setRunning(false);
    if (s.status === "completed") persistResults(s);
  }

  function persistResults(s: AgentRunState): void {
    for (const w of s.brainWrites) {
      recordMemory({ category: "work", actor: "agent", action: w.action, detail: w.detail, tags: ["agent-run"] });
    }
    setSavedNote(`Company Brain へ ${s.brainWrites.length} 件保存しました(監査ログ ${s.auditLog.length} 件)。`);
    // 無料コネクタ(Webhook)設定時のみ実通知(未設定なら何も送らない)
    void sendAgentNotification(`エージェント実行完了: ${s.goal.title}`, s.finalReport ?? "").catch(() => undefined);
  }

  const statusLabel = useMemo(() => {
    if (!run) return null;
    return run.status === "completed" ? "完了" : run.status === "waiting_approval" ? "承認待ち" : run.status === "blocked" ? "停止(遮断/上限)" : "実行中";
  }, [run]);

  return (
    <>
      <section aria-label="エージェント頭脳">
        <h2>エージェント実行センター</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "52rem" }}>
          Musasabi を「計画→行動→承認→観察→報告」の自律ループで実行します。頭脳は
          <strong>無料ローカルLLM(Ollama)</strong>を自動検出(課金なし・APIキー不要・データ外部送信なし)。
          未検出時はルールベース頭脳で同じループが動きます。各行動は Intelligence Layer の
          ポリシー検証を通過し、承認ノードでは人間承認まで停止します。
        </p>
        <div className="card" style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
          <span aria-hidden style={{ fontSize: "1.2rem" }}>{brain?.source === "ollama" ? "🧠" : "⚙️"}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
              {probing ? "頭脳を検出中…" : brain ? brain.provider.name : "未検出"}
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              {brain?.source === "ollama"
                ? "ローカルLLMに接続済み。推論はこの端末内で完結します。"
                : "ローカルLLM未検出。Ollama をインストールすると本物のLLM頭脳に切り替わります(README参照)。現在はルールベースで動作。"}
            </div>
            {brain?.source === "fallback" && !probing && (
              <div style={{ fontSize: "0.7rem", color: "#F59E0B", marginTop: "0.15rem" }}>
                診断: 接続先 {settings.baseUrl} / 経路 {transport || "不明"} / 失敗理由 {brain.probeError ?? "不明"}。
                Ollama 起動中か(ブラウザで {settings.baseUrl} を開くと "Ollama is running")を確認し、「保存して接続テスト」を押してください。
              </div>
            )}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              aria-label="Ollama URL"
              value={settings.baseUrl}
              onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              style={{ width: "14rem", fontSize: "0.76rem", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.3rem 0.5rem" }}
            />
            <input
              aria-label="モデル名"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              style={{ width: "9rem", fontSize: "0.76rem", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.3rem 0.5rem" }}
            />
            <button type="button" onClick={() => { saveLlmSettings(settings); void probe(); }} disabled={probing}>
              保存して接続テスト
            </button>
          </div>
        </div>
      </section>

      <section aria-label="目標の実行">
        <h3>目標を実行</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {GOAL_PRESETS.map((g) => (
            <button key={g.id} type="button" onClick={() => void startGoal(g)} disabled={running}>
              ▶ {g.title}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", maxWidth: "40rem" }}>
          <input
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder="カスタム目標(例: 今週の営業活動を要約して報告)"
            style={{ flex: 1, fontSize: "0.8rem", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.4rem 0.6rem" }}
          />
          <button
            type="button"
            disabled={running || customGoal.trim() === ""}
            onClick={() => void startGoal({ id: `custom-${Date.now()}`, title: customGoal.trim(), description: customGoal.trim() })}
          >
            実行
          </button>
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
          利用可能テンプレート: {WORKFLOW_TEMPLATES.map((t) => t.name).join(" / ")}(ツールはすべてローカルMock・外部送信なし)
        </p>
      </section>

      {run && (
        <section aria-label="実行タイムライン">
          <h3>
            実行タイムライン — {run.goal.title}
            <span className="badge" style={{ marginLeft: 8, fontSize: "0.7rem" }}>{statusLabel}</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {run.steps.map((s) => (
              <div key={s.index} className="card" style={{ padding: "0.45rem 0.7rem", fontSize: "0.78rem" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="badge" style={{ fontSize: "0.64rem" }}>{STEP_KIND_LABEL[s.kind]}</span>
                  <strong>{s.actor}</strong>
                  {s.tool && <code style={{ fontSize: "0.7rem" }}>{s.tool}</code>}
                  <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: s.status === "blocked" ? "#EF4444" : s.status === "waiting_approval" ? "#F59E0B" : "var(--text-muted)" }}>
                    {s.status === "done" ? "完了" : s.status === "waiting_approval" ? "承認待ち" : "遮断"}
                  </span>
                </div>
                <div style={{ whiteSpace: "pre-wrap", marginTop: "0.15rem" }}>{s.output}</div>
              </div>
            ))}
          </div>

          {run.status === "waiting_approval" && (
            <div className="card" style={{ marginTop: "0.5rem", borderColor: "#F59E0B" }}>
              <strong>⏸ 人間の承認待ち</strong>
              <p style={{ fontSize: "0.8rem", margin: "0.2rem 0 0.4rem" }}>
                承認ノードに到達しました。内容を確認して再開してください(承認は監査ログに記録されます)。
              </p>
              <button type="button" onClick={() => void approveAndResume()}>✔ 承認して再開</button>
            </div>
          )}

          {run.finalReport && (
            <div className="card" style={{ marginTop: "0.5rem" }}>
              <strong>📋 最終報告(説明可能性つき)</strong>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.78rem", margin: "0.3rem 0 0" }}>{run.finalReport}</pre>
              <button
                type="button"
                style={{ marginTop: "0.4rem" }}
                onClick={() => {
                  const md = [
                    `# エージェント実行報告 — ${run.goal.title}`,
                    "",
                    run.finalReport ?? "",
                    "",
                    "## ステップ詳細",
                    ...run.steps.map((st) => `### ${st.index + 1}. [${STEP_KIND_LABEL[st.kind]}] ${st.actor}${st.tool ? `(${st.tool})` : ""}\n${st.output}`),
                  ].join("\n");
                  void saveBinaryFile(
                    `agent-report-${new Date().toISOString().slice(0, 10)}.md`,
                    new TextEncoder().encode(md),
                    "Markdown",
                    ["md"],
                  );
                }}
              >
                📄 報告をファイル保存(実ファイル)
              </button>
              {isTtsAvailable() && (
                <button
                  type="button"
                  style={{ marginTop: "0.4rem", marginLeft: "0.4rem" }}
                  onClick={() => void speakJaBest(run.finalReport ?? "")}
                >
                  🔊 読み上げ(端末内TTS)
                </button>
              )}
            </div>
          )}
          {savedNote && <p style={{ color: "#22C55E", fontSize: "0.8rem" }}>✓ {savedNote}</p>}

          <details style={{ marginTop: "0.4rem" }}>
            <summary style={{ cursor: "pointer", fontSize: "0.8rem" }}>監査ログ({run.auditLog.length})</summary>
            <ul style={{ fontSize: "0.74rem", margin: "0.3rem 0 0" }}>
              {run.auditLog.map((a, i) => (
                <li key={i}><code>{a.event}</code> — {a.detail}</li>
              ))}
            </ul>
          </details>
        </section>
      )}
    </>
  );
}
