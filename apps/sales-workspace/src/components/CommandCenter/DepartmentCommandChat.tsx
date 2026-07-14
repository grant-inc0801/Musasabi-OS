import { useEffect, useRef, useState } from "react";
import type { CommandDepartment, DeptChatEntry } from "@musasabi/ai-company";
import {
  AgentRuntime,
  chatWithHistory,
  detectBrain,
  type AgentRunState,
  type DetectedBrain,
} from "@musasabi/agent-runtime";
import { VoiceInputButton } from "./VoiceInputButton";
import { recordMemory } from "../../lib/memoryStorage";
import { saveAgentDocToVault } from "../../lib/vaultStorage";
import { buildVaultSearchReply, parseVaultSearchQuery, searchVault } from "../../lib/vaultSearch";
import { buildTodayDigestReply, isTodayDigestQuery } from "../../lib/todayDigest";
import { buildDiagnosticsReply, isDiagnosticsQuery, probeLocalServices } from "../../lib/localDiagnostics";
import { appendDeptChat, loadDeptChatHistory } from "../../lib/deptChatStorage";
import { buildAssistantReply, HELP_SUGGESTIONS } from "../../lib/assistantHelp";
import { loadLlmSettings } from "../../lib/llmSettings";
import { ragContextFor } from "../../lib/brainRag";
import { isTtsAvailable, speakJaBest } from "../../lib/voice";
import { resolveLlmFetch } from "../../lib/llmFetch";
import { buildAgentTools } from "../../lib/agentTools";
import { buildReportProvider } from "../../lib/brainProviders";
import { sendAgentNotification } from "../../lib/freeConnectors";
import { notifyOs } from "../../lib/osNotify";
import brandIcon from "../../assets/brand-icon.png";

// アプリ構成の要約(LLM頭脳に渡す案内用コンテキスト)。
const APP_CONTEXT =
  "サイドバー: Dashboard(Mission Control/全社ダッシュボード/レポート/通知/ワークスペース)、" +
  "Departments(営業/出版/企画/市場調査/開発/サポート/マーケ/経理/人事)、AI Assistant、" +
  "Workflow(ワークフロー/エージェント実行センター/事業ファクトリー/本番ロードマップ)、" +
  "Knowledge(Company Brain/Intelligence Layer)、Integrations(コネクタ/AI統合センター)、Settings。";

// コマンドセンター右下: Musasabi アシスタントチャット。
// 質問には案内で答え(LLM+RAG)、「実行 ◯◯」/▶実行 は Claude Code と同様の
// 指示インターフェースとしてエージェントを実際に自律実行する:
// 指示 → 計画→行動→(承認待ちはチャットで「承認」)→観察→報告 → 最終報告を返信。
// 完了時は Company Brain 保存+Webhook 通知(設定時のみ)。すべて端末内処理。

const RUN_PREFIX = /^(実行[ :  ]|\/run\s)/;
const APPROVE_WORDS = ["承認", "承認する", "approve", "ok", "OK"];

/** 実行指示テキストからワークフローテンプレートを推定する(決定論)。 */
function guessTemplateId(text: string): string | undefined {
  if (text.includes("週次") || text.includes("レポート自動")) return "wf-weekly-report";
  if (text.includes("新サービス") || text.includes("立ち上げ")) return "wf-new-service";
  return undefined;
}

function stepsDigest(state: AgentRunState): string {
  return state.steps
    .map((s) => `${s.index + 1}. ${s.actor}${s.tool ? `(${s.tool})` : ""} — ${s.status === "done" ? "完了" : s.status === "waiting_approval" ? "承認待ち" : "遮断"}`)
    .join("\n");
}

export function DepartmentCommandChat({ departments: _departments }: { departments: readonly CommandDepartment[] }) {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [history, setHistory] = useState<DeptChatEntry[]>(() => loadDeptChatHistory());
  const [pending, setPending] = useState(false);
  const brainRef = useRef<DetectedBrain | null>(null);
  // 実行中のエージェント(承認待ち再開用にチャットセッション内で保持)
  const agentRef = useRef<{ rt: AgentRuntime; state: AgentRunState } | null>(null);

  // 起動時に頭脳を検出(ローカルLLM優先・未検出はルールベース)。
  useEffect(() => {
    void resolveLlmFetch()
      .then((f) => detectBrain(loadLlmSettings(), f))
      .then((b) => { brainRef.current = b; });
  }, []);

  function pushEntry(message: string, reply: string): void {
    const entry: DeptChatEntry = {
      deptId: "assistant",
      deptName: "アシスタント",
      message,
      reply,
      atMs: Date.now(),
    };
    setHistory(appendDeptChat(entry));
  }

  /** 実行完了時の共通処理: Brain保存・保管庫保存・通知・返信文の生成。 */
  function finishRun(state: AgentRunState): string {
    for (const w of state.brainWrites) {
      recordMemory({ category: "work", actor: "agent-chat", action: w.action, detail: w.detail, tags: ["agent-chat-run"] });
    }
    // 成果物(最終報告)を保管庫へ自動保存(RAG索引され後から意味検索で引ける)
    let vaultLine = "";
    if (state.finalReport && state.finalReport.trim() !== "") {
      const saved = saveAgentDocToVault({
        title: `実行報告: ${state.goal.title}`,
        text: `目標: ${state.goal.title}\n${state.goal.description}\n\n${state.finalReport}`,
        tags: ["agent", "chat-run"],
      });
      vaultLine = saved.ok ? "・成果物を保管庫へ保存" : `・⚠ 保管庫保存に失敗(${saved.error})`;
    }
    void sendAgentNotification(`実行完了: ${state.goal.title}`, state.finalReport ?? "").catch(() => undefined);
    void notifyOs("Musasabi — 実行完了", state.goal.title).catch(() => undefined);
    agentRef.current = null;
    return `✅ 実行完了(頭脳: ${state.brainName})\n${state.finalReport ?? ""}\n— Company Brain へ ${state.brainWrites.length} 件保存・監査ログ ${state.auditLog.length} 件${vaultLine}`;
  }

  /** チャットからの実行指示: エージェントを実際に自律実行する。 */
  async function runInstruction(instruction: string): Promise<string> {
    const brain = brainRef.current ?? (await detectBrain(loadLlmSettings(), await resolveLlmFetch()));
    brainRef.current = brain;
    const rt = new AgentRuntime({ provider: brain.provider, reportProvider: await buildReportProvider(brain), tools: buildAgentTools() });
    let state = await rt.start({
      id: `chat-${Date.now()}`,
      title: instruction.slice(0, 48),
      description: instruction,
      workflowTemplateId: guessTemplateId(instruction),
    });
    state = await rt.runUntilPause(state);
    if (state.status === "waiting_approval") {
      agentRef.current = { rt, state };
      const waiting = state.steps.find((s) => s.status === "waiting_approval");
      void notifyOs("Musasabi — 承認待ち", `${state.goal.title}(${waiting?.actor ?? "承認ノード"})`, "warn").catch(() => undefined);
      return `⏸ 承認待ちで停止中(${waiting?.actor ?? "承認ノード"})。「承認」と送信すると再開します。\nここまでのステップ:\n${stepsDigest(state)}`;
    }
    if (state.status === "completed") return finishRun(state);
    agentRef.current = null;
    return `⛔ 実行を停止しました(${state.status})。\n${stepsDigest(state)}`;
  }

  /** 承認待ち中の「承認」で再開する。 */
  async function approveAndResume(): Promise<string> {
    const session = agentRef.current;
    if (!session) return "承認待ちの実行はありません。「実行 ◯◯」で指示できます。";
    let state = session.rt.approve(session.state);
    state = await session.rt.runUntilPause(state);
    if (state.status === "waiting_approval") {
      agentRef.current = { rt: session.rt, state };
      return `⏸ 次の承認ノードで停止中。「承認」で再開します。\n${stepsDigest(state)}`;
    }
    if (state.status === "completed") return finishRun(state);
    agentRef.current = null;
    return `⛔ 実行を停止しました(${state.status})。\n${stepsDigest(state)}`;
  }

  async function handleSend(asRun = false): Promise<void> {
    const message = text.trim();
    if (message === "" || pending) return;
    setPending(true);
    let reply: string;
    const brain = brainRef.current;
    try {
      const vaultQuery = parseVaultSearchQuery(message);
      const isHelp = /^(ヘルプ|help|使い方|何ができる)[??!!。]?$/i.test(message.trim());
      if (isHelp) {
        // コマンド一覧(決定論・LLM不要)
        reply = [
          "🤖 使えるコマンド:",
          "・「実行 ◯◯」または ▶実行 — エージェントが実際に自律実行(承認ノードは「承認」で再開)",
          "・「保管庫で◯◯を探して」 — 保管庫の資料を検索し引用回答",
          "・「今日何した?」 — 当日の実イベント・成果物・的中率を即答",
          "・「接続状況は?」 — ローカルAI連携(LLM/埋め込み/音声/画像)を実診断",
          "・その他の質問 — 社内データ(RAG)+会話メモリで回答します",
        ].join("\n");
      } else if (agentRef.current && APPROVE_WORDS.includes(message)) {
        // 承認 → 実行再開
        reply = await approveAndResume();
      } else if (vaultQuery !== null) {
        // 保管庫検索コマンド: 「保管庫で◯◯を探して」→ 実文書を直接検索し引用回答(LLM不要)
        reply = buildVaultSearchReply(vaultQuery, await searchVault(vaultQuery));
      } else if (isTodayDigestQuery(message)) {
        // 「今日何した?」→ 当日の実データダイジェストで即答(LLM不要)
        reply = buildTodayDigestReply();
      } else if (isDiagnosticsQuery(message)) {
        // 「接続状況は?」→ ローカルAI連携を実診断して即答
        reply = buildDiagnosticsReply(await probeLocalServices());
      } else if (asRun || RUN_PREFIX.test(message)) {
        // 実行指示 → エージェント自律実行(Claude Code と同じ指示→実行→報告の流れ)
        const instruction = message.replace(RUN_PREFIX, "").trim() || message;
        recordMemory({ category: "work", actor: "user", action: "チャットから実行指示", detail: instruction, tags: ["agent-chat-run"] });
        reply = await runInstruction(instruction);
      } else if (brain?.source === "ollama") {
        // RAG+会話メモリ: 社内データと直近のやり取りを文脈としてLLMに渡す
        const rag = await ragContextFor(message);
        const context = rag === "" ? APP_CONTEXT : `${APP_CONTEXT}\n[社内データ(Company Brain)関連記録]\n${rag}`;
        const turns = [...history]
          .slice(0, 4)
          .reverse()
          .flatMap((h) => [
            { role: "user" as const, content: h.message },
            { role: "assistant" as const, content: h.reply },
          ]);
        reply = await chatWithHistory(brain.provider, turns, message, context);
      } else {
        reply = buildAssistantReply(message);
      }
    } catch (e) {
      // 失敗しても常に応答を返す
      reply = asRun || RUN_PREFIX.test(message) ? `実行に失敗しました: ${String(e)}` : buildAssistantReply(message);
    }
    pushEntry(message + (fileName ? `(添付: ${fileName})` : ""), reply);
    recordMemory({
      category: "work",
      actor: "user",
      action: "アシスタントへ相談",
      detail: message,
      tags: ["assistant-chat"],
    });
    setText("");
    setFileName(null);
    setPending(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="cc-chat-fab"
        onClick={() => setOpen(true)}
        aria-label="アシスタントチャットを開く"
        title="アシスタントに聞く"
      >
        <img src={brandIcon} width={22} height={22} alt="" />
        <span>アシスタント</span>
      </button>
    );
  }

  return (
    <div className="command-chat cc-chat-dock" aria-label="Musasabi アシスタントチャット">
      <div className="cc-chat-head">
        <img src={brandIcon} width={20} height={20} alt="" style={{ borderRadius: 5 }} />
        <strong>Musasabi アシスタント</strong>
        <span className="cc-chat-hint">「実行 ◯◯」で実行・「保管庫で◯◯を探して」で資料検索</span>
        <button type="button" className="cc-chat-close" onClick={() => setOpen(false)} aria-label="閉じる">
          ×
        </button>
      </div>

      {history.length > 0 && (
        <div className="command-chat-history cc-chat-log">
          {history.slice(0, 4).map((m) => (
            <div key={m.atMs} style={{ margin: "0.2rem 0" }}>
              <div style={{ color: "var(--text-muted)" }}>
                {new Date(m.atMs).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} あなた: {m.message}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>
                🐿️ {m.reply}
                {isTtsAvailable() && (
                  <button
                    type="button"
                    style={{ marginLeft: 6, fontSize: "0.68rem", padding: "0 0.3rem" }}
                    title="読み上げ(端末内TTS)"
                    onClick={() => void speakJaBest(m.reply)}
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="command-chat-body">
        <textarea
          className="command-chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="質問、または「実行 ◯◯」で指示…(例: 実行 週次レポートを作成して)"
        />
      </div>

      <div className="command-chat-templates" aria-label="クイック質問">
        <button type="button" className="quick-template" onClick={() => setText("実行 週次レポートを作成して")}>
          実行 週次レポートを作成して
        </button>
        {HELP_SUGGESTIONS.map((t) => (
          <button key={t} type="button" className="quick-template" onClick={() => setText(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="command-chat-actions">
        <label className="attach-btn">
          📎 添付
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
        <VoiceInputButton onText={(t) => setText((prev) => (prev === "" ? t : `${prev} ${t}`))} />
        {fileName && <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>添付: {fileName}</span>}
        <button type="button" onClick={() => void handleSend(true)} disabled={pending} title="この内容をエージェントに実行させる">
          {pending ? "…" : "▶ 実行"}
        </button>
        <button type="button" onClick={() => void handleSend()} className="send-btn" disabled={pending}>
          {pending ? "…" : "送信"}
        </button>
      </div>
    </div>
  );
}
