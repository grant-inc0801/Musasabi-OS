import { useState } from "react";
import type { CommandDepartment, DeptChatEntry } from "@musasabi/ai-company";
import { buildDeptReplyJa } from "@musasabi/ai-company";
import { VoiceInputButton } from "./VoiceInputButton";
import { recordMemory } from "../../lib/memoryStorage";
import { appendDeptChat, loadDeptChatHistory } from "../../lib/deptChatStorage";

// 下部: 部署指定チャット指示欄(D-20260706-007 + チャット強化フェーズ)。
// 指示先部署プルダウン+入力欄+ファイル添付+音声入力Mock+送信+クイックテンプレート。
// 送信すると部署の状態に応じたMock応答をローカル生成して表示し、履歴を
// localStorage(musasabi.deptChatHistory)へ永続化する(実AI API・外部送信なし)。

const QUICK_TEMPLATES = [
  "進捗状況を教えて",
  "本日の目標を共有して",
  "課題を報告して",
  "優先タスクを教えて",
];

export function DepartmentCommandChat({ departments }: { departments: readonly CommandDepartment[] }) {
  const [target, setTarget] = useState(departments[0]?.id ?? "");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [history, setHistory] = useState<DeptChatEntry[]>(() => loadDeptChatHistory());

  function handleSend(): void {
    const dept = departments.find((d) => d.id === target);
    const message = text.trim();
    if (message === "" || !dept) return;
    const entry: DeptChatEntry = {
      deptId: dept.id,
      deptName: dept.name,
      message: message + (fileName ? `(添付: ${fileName})` : ""),
      reply: buildDeptReplyJa(dept, message),
      atMs: Date.now(),
    };
    setHistory(appendDeptChat(entry));
    recordMemory({
      category: "work",
      actor: "user",
      action: "部署へ指示",
      detail: `${dept.name}: ${message}`,
      tags: ["command-chat"],
    });
    setText("");
    setFileName(null);
  }

  return (
    <div className="command-chat" aria-label="部署指定チャット">
      <label className="command-chat-target">
        指示先部署
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      {/* 入力欄(拡大)+テンプレートを右側に縦並び(ユーザーFB第6弾) */}
      <div className="command-chat-body">
        <textarea
          className="command-chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Enterで送信、Shift+Enterで改行
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="指示内容を入力してください…(Shift+Enterで改行)"
        />
        <div className="command-chat-templates" aria-label="クイックテンプレート">
          {QUICK_TEMPLATES.map((t) => (
            <button key={t} type="button" className="quick-template" onClick={() => setText(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 添付・音声送信は入力欄の下に配置(ユーザーFB第6弾) */}
      <div className="command-chat-actions">
        <label className="attach-btn">
          📎 ファイル添付
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
        <VoiceInputButton />
        {fileName && (
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>添付: {fileName}</span>
        )}
        <button type="button" onClick={handleSend} className="send-btn">
          送信
        </button>
      </div>

      {history.length > 0 && (
        <div className="command-chat-history">
          {history.slice(0, 3).map((m) => (
            <div key={m.atMs} style={{ margin: "0.15rem 0" }}>
              <div style={{ color: "var(--text-muted)" }}>
                {new Date(m.atMs).toLocaleTimeString("ja-JP")} [{m.deptName}] {m.message}
              </div>
              <div>↩ {m.reply}(Mock応答)</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
