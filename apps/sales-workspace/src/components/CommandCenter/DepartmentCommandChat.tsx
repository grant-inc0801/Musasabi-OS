import { useState } from "react";
import type { CommandDepartment, DeptChatEntry } from "@musasabi/ai-company";
import { VoiceInputButton } from "./VoiceInputButton";
import { recordMemory } from "../../lib/memoryStorage";
import { appendDeptChat, loadDeptChatHistory } from "../../lib/deptChatStorage";
import { buildAssistantReply, HELP_SUGGESTIONS } from "../../lib/assistantHelp";
import brandIcon from "../../assets/brand-icon.png";

// コマンドセンター右下: Musasabi アシスタントチャット(UIフィードバック第8弾)。
// 部署プルダウンを廃止し、単一のアシスタントが指示・提案・操作方法・「何がどこにあるか」を案内する。
// 送信するとローカルで決定論的な Mock 応答を生成して履歴へ表示・永続化する(実AI API・外部送信なし)。
// カラー・ボタンは管理画面テーマ(トークン)に統一。右下フロートで開閉可能。

export function DepartmentCommandChat({ departments: _departments }: { departments: readonly CommandDepartment[] }) {
  const [open, setOpen] = useState(true);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [history, setHistory] = useState<DeptChatEntry[]>(() => loadDeptChatHistory());

  function handleSend(): void {
    const message = text.trim();
    if (message === "") return;
    const entry: DeptChatEntry = {
      deptId: "assistant",
      deptName: "アシスタント",
      message: message + (fileName ? `(添付: ${fileName})` : ""),
      reply: buildAssistantReply(message),
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
              <div>🐿️ {m.reply}</div>
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
              handleSend();
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
        <VoiceInputButton />
        {fileName && <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>添付: {fileName}</span>}
        <button type="button" onClick={handleSend} className="send-btn">
          送信
        </button>
      </div>
    </div>
  );
}
