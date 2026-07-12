import { useEffect, useRef, useState } from "react";
import type { CommandDepartment, DeptChatEntry } from "@musasabi/ai-company";
import { chatOnce, detectBrain, type DetectedBrain } from "@musasabi/agent-runtime";
import { VoiceInputButton } from "./VoiceInputButton";
import { recordMemory } from "../../lib/memoryStorage";
import { appendDeptChat, loadDeptChatHistory } from "../../lib/deptChatStorage";
import { buildAssistantReply, HELP_SUGGESTIONS } from "../../lib/assistantHelp";
import { loadLlmSettings } from "../../lib/llmSettings";
import { ragContextFor } from "../../lib/brainRag";
import { isTtsAvailable, speakJaBest } from "../../lib/voice";
import { resolveLlmFetch } from "../../lib/llmFetch";
import brandIcon from "../../assets/brand-icon.png";

// アプリ構成の要約(LLM頭脳に渡す案内用コンテキスト)。
const APP_CONTEXT =
  "サイドバー: Dashboard(Mission Control/全社ダッシュボード/レポート/通知/ワークスペース)、" +
  "Departments(営業/出版/企画/市場調査/開発/サポート/マーケ/経理/人事)、AI Assistant、" +
  "Workflow(ワークフロー/エージェント実行センター/事業ファクトリー/本番ロードマップ)、" +
  "Knowledge(Company Brain/Intelligence Layer)、Integrations(コネクタ/AI統合センター)、Settings。";

// コマンドセンター右下: Musasabi アシスタントチャット(UIフィードバック第8弾)。
// 部署プルダウンを廃止し、単一のアシスタントが指示・提案・操作方法・「何がどこにあるか」を案内する。
// 送信するとローカルで決定論的な Mock 応答を生成して履歴へ表示・永続化する(実AI API・外部送信なし)。
// カラー・ボタンは管理画面テーマ(トークン)に統一。右下フロートで開閉可能。

export function DepartmentCommandChat({ departments: _departments }: { departments: readonly CommandDepartment[] }) {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [history, setHistory] = useState<DeptChatEntry[]>(() => loadDeptChatHistory());
  const [pending, setPending] = useState(false);
  const brainRef = useRef<DetectedBrain | null>(null);

  // 起動時に頭脳を検出(ローカルLLM優先・未検出はルールベース)。
  useEffect(() => {
    void resolveLlmFetch()
      .then((f) => detectBrain(loadLlmSettings(), f))
      .then((b) => { brainRef.current = b; });
  }, []);

  async function handleSend(): Promise<void> {
    const message = text.trim();
    if (message === "" || pending) return;
    setPending(true);
    let reply: string;
    const brain = brainRef.current;
    try {
      if (brain?.source === "ollama") {
        // RAG: 社内データ(Company Brain)から関連記録を検索してLLMに渡す
        const rag = await ragContextFor(message);
        const context = rag === "" ? APP_CONTEXT : `${APP_CONTEXT}\n[社内データ(Company Brain)関連記録]\n${rag}`;
        reply = await chatOnce(brain.provider, message, context);
      } else {
        reply = buildAssistantReply(message);
      }
    } catch {
      // LLM応答失敗時はルールベースへフォールバック(常に応答を返す)
      reply = buildAssistantReply(message);
    }
    const entry: DeptChatEntry = {
      deptId: "assistant",
      deptName: "アシスタント",
      message: message + (fileName ? `(添付: ${fileName})` : ""),
      reply,
      atMs: Date.now(),
    };
    setHistory(appendDeptChat(entry));
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
        <span className="cc-chat-hint">操作方法や「何がどこにあるか」を案内します</span>
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
              <div>
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
          placeholder="指示・質問を入力…(例: 全社ダッシュボードはどこ?)"
        />
      </div>

      <div className="command-chat-templates" aria-label="クイック質問">
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
        <button type="button" onClick={() => void handleSend()} className="send-btn" disabled={pending}>
          {pending ? "…" : "送信"}
        </button>
      </div>
    </div>
  );
}
