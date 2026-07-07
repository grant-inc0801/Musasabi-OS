import { useState } from "react";
import { markRoutineRun } from "@musasabi/automation";
import type { AutomationRoutine } from "@musasabi/automation";
import { loadRoutines, routineRecorder, saveRoutine } from "../../lib/automationStorage";
import { recordMemory } from "../../lib/memoryStorage";

// Automation ページ(Development Bible 第12章)。手動オプトインの操作記録→再実行。
// 「記録を開始」を押してから「記録を停止して保存」までの間のみ、アプリ内の
// ページ遷移を記録する。常時記録・他アプリの記録・外部送信はしない。

const REPLAY_STEP_MS = 500;

export function AutomationPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [recording, setRecording] = useState(routineRecorder.isRecording);
  const [name, setName] = useState("");
  const [routines, setRoutines] = useState<AutomationRoutine[]>(() => loadRoutines());
  const [replaying, setReplaying] = useState(false);

  function handleStart(): void {
    routineRecorder.start(Date.now());
    setRecording(true);
    recordMemory({
      category: "work",
      actor: "user",
      action: "操作記録を開始(手動)",
      tags: ["automation", "opt-in"],
    });
  }

  function handleStop(): void {
    const routine = routineRecorder.stop(name, Date.now());
    setRecording(false);
    setName("");
    if (routine === null) {
      alert("記録された操作がありません(記録中にサイドバーからページを移動してください)。");
      return;
    }
    setRoutines(saveRoutine(routine));
    recordMemory({
      category: "work",
      actor: "user",
      action: "操作記録を保存",
      detail: `ルーチン: ${routine.name} / ${routine.steps.length}操作`,
      tags: ["automation"],
    });
  }

  function handleReplay(routine: AutomationRoutine): void {
    if (replaying) return;
    setReplaying(true);
    recordMemory({
      category: "work",
      actor: "system",
      action: "ルーチンを再実行",
      detail: `ルーチン: ${routine.name} / ${routine.steps.length}操作`,
      tags: ["automation", "replay"],
    });
    setRoutines(saveRoutine(markRoutineRun(routine)));
    routine.steps.forEach((step, i) => {
      setTimeout(() => {
        onNavigate(step.target);
        if (i === routine.steps.length - 1) setReplaying(false);
      }, REPLAY_STEP_MS * (i + 1));
    });
  }

  return (
    <>
      <section aria-label="操作記録">
        <h3 style={{ marginTop: 0 }}>操作記録(手動オプトイン)</h3>
        <p style={{ color: "#9aa3ba", fontSize: "0.85rem", maxWidth: "44rem" }}>
          「記録を開始」を押してから停止するまでの間のみ、このアプリ内のページ遷移を
          記録します。常時記録・他アプリの記録・外部送信はしません。保存したルーチンは
          「再実行」でそのままの順に画面を辿れます(記録・再実行は Company Brain に
          監査記録されます)。
        </p>
        {recording ? (
          <div>
            <p style={{ color: "#3fb950", fontWeight: "bold" }}>
              ● 記録中({routineRecorder.stepCount}操作)— サイドバーからページを移動すると記録されます
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ルーチン名(例: 朝の確認ルート)"
              style={{ width: "18rem" }}
            />{" "}
            <button type="button" onClick={handleStop}>
              記録を停止して保存
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleStart}>
            記録を開始
          </button>
        )}
      </section>

      <section aria-label="保存済みルーチン">
        <h3 style={{ marginTop: 0 }}>保存済みルーチン({routines.length}件)</h3>
        {routines.length === 0 ? (
          <p style={{ color: "#9aa3ba" }}>まだルーチンがありません。</p>
        ) : (
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["名前", "操作", "作成日時", "再実行回数", ""].map((h, i) => (
                  <th key={i} style={cellStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routines.map((r) => (
                <tr key={r.id}>
                  <td style={cellStyle}>{r.name}</td>
                  <td style={cellStyle}>{r.steps.map((s) => s.label).join(" → ")}</td>
                  <td style={cellStyle}>{new Date(r.createdAtMs).toLocaleString("ja-JP")}</td>
                  <td style={cellStyle}>{r.runCount}回</td>
                  <td style={cellStyle}>
                    <button type="button" onClick={() => handleReplay(r)} disabled={replaying || recording}>
                      再実行
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid rgba(151,168,205,0.16)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
