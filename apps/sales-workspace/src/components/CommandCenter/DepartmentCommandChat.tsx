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
      <div className="command-chat-row main-row">
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}>
          指示先部署
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="指示内容を入力してください…"
          style={{ flex: 1 }}
        />
        <label className="attach-btn">
          📎 ファイル添付
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
        <VoiceInputButton />
        <button type="button" onClick={handleSend} className="send-btn">
          送信
        </button>
      </div>
      <div className="command-chat-row" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {QUICK_TEMPLATES.map((t) => (
            <button key={t} type="button" className="quick-template" onClick={() => setText(t)}>
              {t}
            </button>
          ))}
        </div>
        {fileName && (
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>添付: {fileName}</span>
        )}
      </div>
      {history.length > 0 && (
        <div style={{ fontSize: "0.8rem", maxHeight: 96, overflowY: "auto" }}>
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
