import { useState } from "react";
import type { CommandDepartment } from "@musasabi/ai-company";
import { VoiceInputButton } from "./VoiceInputButton";
import { recordMemory } from "../../lib/memoryStorage";

// 下部: 部署指定チャット指示欄(D-20260706-007)。
// 指示先部署プルダウン+入力欄+ファイル添付+音声入力Mock+送信+クイックテンプレート。
// 送信内容はローカルの表示とMemory記録のみ(外部送信なし)。

const QUICK_TEMPLATES = [
  "進捗状況を教えて",
  "本日の目標を共有して",
  "課題を報告して",
  "優先タスクを教えて",
];

interface SentMessage {
  dept: string;
  text: string;
  at: string;
}

export function DepartmentCommandChat({ departments }: { departments: readonly CommandDepartment[] }) {
  const [target, setTarget] = useState(departments[0]?.id ?? "");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [sent, setSent] = useState<SentMessage[]>([]);

  function handleSend(): void {
    const deptName = departments.find((d) => d.id === target)?.name ?? target;
    const message = text.trim();
    if (message === "") return;
    setSent((prev) => [
      { dept: deptName, text: message + (fileName ? `(添付: ${fileName})` : ""), at: new Date().toLocaleTimeString("ja-JP") },
      ...prev.slice(0, 2),
    ]);
    recordMemory({
      category: "work",
      actor: "user",
      action: "部署へ指示",
      detail: `${deptName}: ${message}`,
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
      {sent.length > 0 && (
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {sent.map((m, i) => (
            <div key={i}>
              {m.at} [{m.dept}] {m.text} — 送信しました(β版はMock応答なし)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
