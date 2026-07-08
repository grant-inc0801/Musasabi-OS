import { useMemo, useState } from "react";
import {
  SCHEDULED_ROUTINES,
  SCHEDULE_FREQUENCIES,
  buildSchedulerSummary,
  filterRoutines,
  routineIcon,
  type ScheduleFrequency,
} from "@musasabi/ai-company";
import { loadRoutines } from "../../lib/automationStorage";

// D-019 Scheduler & Routines: 会社の定例業務(スケジュール)と、Automationで保存した
// 自動化ルーチン(実データ)を一覧表示する。実行はしない(表示のみ・Mock)。

export function SchedulerPage({ onOpenAutomation }: { onOpenAutomation: () => void }) {
  const [freq, setFreq] = useState<ScheduleFrequency | "all">("all");
  const summary = buildSchedulerSummary();
  const routines = filterRoutines(SCHEDULED_ROUTINES, freq);
  const savedRoutines = useMemo(() => loadRoutines(), []);

  const tiles = [
    { label: "定例業務", value: `${summary.total}件` },
    { label: "毎日", value: `${summary.daily}件` },
    { label: "毎週", value: `${summary.weekly}件` },
    { label: "毎月", value: `${summary.monthly}件` },
    { label: "自動化済み", value: `${summary.automated}件` },
  ];

  return (
    <>
      <section aria-label="スケジュール概要">
        <h3 style={{ marginTop: 0 }}>スケジューラ / 定例業務(Scheduler & Routines)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          各部署の定例業務を頻度・次回予定つきで一覧化します。実行は行わず表示のみです
          (すべてMock。自動化は Automation の操作記録で行います)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {tiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "7.5rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="定例業務一覧">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>定例業務一覧</h3>
          <select
            value={freq}
            onChange={(e) => setFreq(e.target.value as ScheduleFrequency | "all")}
            aria-label="頻度で絞り込み"
          >
            <option value="all">すべての頻度</option>
            {SCHEDULE_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <table style={{ borderCollapse: "collapse", marginTop: "0.6rem" }}>
          <thead>
            <tr>
              {["部署", "業務", "頻度", "次回予定", "自動化"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routines.map((r) => (
              <tr key={r.id}>
                <td style={cellStyle}>
                  {routineIcon(r)} {r.deptName}
                </td>
                <td style={cellStyle}>{r.title}</td>
                <td style={cellStyle}>{r.frequency}</td>
                <td style={cellStyle}>{r.nextRun}</td>
                <td style={cellStyle}>{r.automated ? "✅ 自動化済み" : "手動"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="保存済み自動化ルーチン">
        <h3 style={{ marginTop: 0 }}>保存済み自動化ルーチン(実データ)</h3>
        {savedRoutines.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            保存済みの自動化ルーチンはまだありません。Automation(操作記録)で作成できます。
          </p>
        ) : (
          <ul>
            {savedRoutines.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong> — 手順{r.steps.length}件・実行{r.runCount}回
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={onOpenAutomation}>
          Automation(操作記録)を開く
        </button>
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
