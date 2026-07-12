import { useEffect, useMemo, useState } from "react";
import { fetchGithubRealStatus, type GithubRealStatus } from "../../lib/freeConnectors";
import {
  AI_CEO_STATUS,
  AI_PM_STATUS,
  DEPARTMENT_ROSTER,
  TODAY_TASKS,
  APPROVALS,
  GITHUB_STATUS,
  AI_TIMELINE,
  SYSTEM_STATUS,
  LED_COLOR,
  PRIORITY_LABEL_JA,
  PRIORITY_COLOR,
  computeMissionSummary,
  type DepartmentSummary,
} from "@musasabi/mission-control";
import { COMMAND_DEPARTMENTS, DEPT_STATUS_COLOR } from "@musasabi/ai-company";
import { DepartmentCylinder } from "../CommandCenter/DepartmentCylinder";
import brandIcon from "../../assets/brand-icon.png";

// Musasabi OS Mission Control Dashboard(Phase 1)。AI企業全体の司令室ホーム。
// すべてダミーデータ(@musasabi/mission-control)で動作。後から GitHub / Claude Code /
// Codex / Calendar / Database / Workflow / Approval へ差し替えられるオブジェクト設計。

/** 数値をマウント時に 0 → target までカウントアップする。 */
function useCountUp(target: number, durationMs = 900): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setV(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return v;
}

export function MissionControlPage({ onOpenPage }: { onOpenPage?: (page: string) => void }) {
  const [ghReal, setGhReal] = useState<GithubRealStatus | null>(null);
  useEffect(() => {
    void fetchGithubRealStatus().then(setGhReal).catch(() => setGhReal(null));
  }, []);
  const summary = useMemo(() => computeMissionSummary(), []);
  const util = useCountUp(summary.aiUtilization);
  const cylinders = useMemo(() => COMMAND_DEPARTMENTS.map((d) => ({ ...d })), []);
  const [selectedCyl, setSelectedCyl] = useState<string | null>(null);

  // ヘッダーの現在時刻(1秒ごと更新)。
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const timeStr = now.toLocaleTimeString("ja-JP", { hour12: false });

  return (
    <div className="mc">
      {/* ① HEADER */}
      <header className="mc-header card">
        <div className="mc-header-left">
          <img src={brandIcon} width={22} height={22} alt="" style={{ borderRadius: 4 }} />
          <strong>Musasabi OS</strong>
        </div>
        <div className="mc-header-center">MISSION CONTROL</div>
        <div className="mc-header-right">
          <span className="mc-clock">{timeStr}</span>
          <span className="mc-chip">AI稼働率 <b>{util}%</b></span>
          <span className="mc-chip">🔔 <b>{summary.pendingApprovals}</b></span>
          <span className="mc-chip">👤 管理者</span>
        </div>
      </header>

      {/* ② AI CEO STATUS(大型パネル) */}
      <section className="mc-ceo card" aria-label="AI CEO ステータス">
        <div className="mc-ceo-main">
          <div className="mc-ceo-badge">🧠</div>
          <div>
            <div className="mc-ceo-name">{AI_CEO_STATUS.name}</div>
            <div className="mc-ceo-state"><span className="mc-led" style={{ background: LED_COLOR.green }} />{AI_CEO_STATUS.state}</div>
          </div>
        </div>
        <div className="mc-ceo-metrics">
          {AI_CEO_STATUS.metrics.map((m) => (
            <div key={m.label} className="mc-metric">
              <span>{m.label}</span>
              <b>{m.value}</b>
            </div>
          ))}
        </div>
      </section>

      <div className="mc-row">
        {/* ③ AI PM */}
        <section className="card mc-panel" aria-label="AI PM">
          <h3 className="mc-h">AI PM</h3>
          <div className="mc-sub">{AI_PM_STATUS.sprint}</div>
          <div className="mc-metrics">
            {AI_PM_STATUS.metrics.map((m) => (
              <div key={m.label} className="mc-metric"><span>{m.label}</span><b>{m.value}</b></div>
            ))}
          </div>
          <ul className="mc-kv">
            <li><span>Claude Code</span><b>{AI_PM_STATUS.claudeCode}</b></li>
            <li><span>GitHub 同期</span><b>{AI_PM_STATUS.githubSync}</b></li>
            <li><span>Codex</span><b>{AI_PM_STATUS.codex}</b></li>
          </ul>
        </section>

        {/* ⑩ System Status(LED) */}
        <section className="card mc-panel" aria-label="システムステータス">
          <h3 className="mc-h">System Status</h3>
          <div className="mc-leds">
            {SYSTEM_STATUS.map((s) => (
              <div key={s.name} className="mc-led-row">
                <span className="mc-led" style={{ background: LED_COLOR[s.level], boxShadow: `0 0 8px ${LED_COLOR[s.level]}` }} />
                <span className="mc-led-name">{s.name}</span>
                <span className="mc-led-val">{s.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ④ AI社員一覧(横スクロール) */}
      <section className="card" aria-label="AI社員一覧">
        <h3 className="mc-h">AI社員一覧</h3>
        <div className="mc-roster">
          {DEPARTMENT_ROSTER.map((d) => (
            <RosterCard key={d.id} dept={d} onOpen={() => onOpenPage?.(d.page)} />
          ))}
        </div>
      </section>

      {/* ⑤ Department Cylinder(前回の金属シリンダー) */}
      <section className="card" aria-label="部署シリンダー">
        <h3 className="mc-h">Department Cylinders</h3>
        <div className="cc-grid" style={{ margin: "0.4rem auto 0" }}>
          {cylinders.map((d) => (
            <DepartmentCylinder
              key={d.id}
              dept={d}
              selected={selectedCyl === d.id}
              onSelect={(id) => setSelectedCyl((p) => (p === id ? null : id))}
            />
          ))}
        </div>
      </section>

      <div className="mc-row">
        {/* ⑥ Today's Tasks */}
        <section className="card mc-panel" aria-label="本日のタスク">
          <h3 className="mc-h">Today's Tasks</h3>
          <ul className="mc-tasks">
            {TODAY_TASKS.map((t) => (
              <li key={t.id} className="mc-task">
                <span className="mc-pri" style={{ background: PRIORITY_COLOR[t.priority] }}>{PRIORITY_LABEL_JA[t.priority]}</span>
                <div className="mc-task-body">
                  <div className="mc-task-title">{t.title}</div>
                  <div className="mc-task-meta">{t.assignee}・{t.due}</div>
                  <div className="mc-bar"><span style={{ width: `${t.progress}%` }} /></div>
                </div>
                <span className="mc-task-pct">{t.progress}%</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ⑦ Approval Center */}
        <section className="card mc-panel" aria-label="承認センター">
          <h3 className="mc-h">Approval Center</h3>
          <ul className="mc-approvals">
            {[...APPROVALS].sort((a, b) => order(b.priority) - order(a.priority)).map((a) => (
              <li key={a.id} className="mc-approval">
                <span className="mc-pri" style={{ background: PRIORITY_COLOR[a.priority] }}>{PRIORITY_LABEL_JA[a.priority]}</span>
                <div className="mc-task-body">
                  <div className="mc-task-title">{a.title}</div>
                  <div className="mc-task-meta">申請元: {a.from}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mc-row">
        {/* ⑧ GitHub Development */}
        <section className="card mc-panel" aria-label="GitHub 開発状況">
          <h3 className="mc-h">GitHub Development</h3>
          {ghReal && (
            <div className="card" style={{ padding: "0.4rem 0.6rem", margin: "0.3rem 0", fontSize: "0.78rem" }}>
              <span className="badge" style={{ fontSize: "0.62rem" }}>実データ</span>{" "}
              <strong>{ghReal.repo}</strong> — open issues+PRs {ghReal.openIssues} 件 / 最新:{" "}
              <code>{ghReal.latestCommitSha}</code> {ghReal.latestCommitMessage}
            </div>
          )}
          <div className="mc-sub">実装中Issue</div>
          <ul className="mc-list">
            {GITHUB_STATUS.implementingIssues.map((i) => <li key={i}>{i}</li>)}
          </ul>
          <ul className="mc-kv">
            <li><span>最新Commit</span><b>{GITHUB_STATUS.latestCommit}</b></li>
            <li><span>Claude Code</span><b>{GITHUB_STATUS.claudeCode}</b></li>
            <li><span>Codex</span><b>{GITHUB_STATUS.codex}</b></li>
            <li><span>GitHub Actions</span><b>{GITHUB_STATUS.actions}</b></li>
          </ul>
          <div className="mc-sub">実行ログ</div>
          <ul className="mc-list mc-logs">
            {GITHUB_STATUS.logs.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </section>

        {/* ⑨ AI Timeline */}
        <section className="card mc-panel" aria-label="AI タイムライン">
          <h3 className="mc-h">AI Timeline</h3>
          <ul className="mc-timeline">
            {AI_TIMELINE.map((e, i) => (
              <li key={i} className="mc-tl">
                <span className="mc-tl-time">{e.time}</span>
                <span className="mc-tl-dot" />
                <span className="mc-tl-dept">{e.dept}</span>
                <span className="mc-tl-sum">{e.summary}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function order(p: "high" | "medium" | "low"): number {
  return p === "high" ? 3 : p === "medium" ? 2 : 1;
}

function RosterCard({ dept, onOpen }: { dept: DepartmentSummary; onOpen: () => void }) {
  const util = useCountUp(dept.utilization);
  const color = statusColor(dept.status);
  return (
    <button type="button" className="mc-roster-card" onClick={onOpen} aria-label={`部署: ${dept.name}`}>
      <div className="mc-roster-head">
        <span className="mc-roster-icon">{dept.icon}</span>
        <span className="mc-roster-name">{dept.name}</span>
      </div>
      <div className="mc-roster-status"><span className="mc-led" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />{dept.status}</div>
      <div className="mc-roster-util">
        <div className="mc-bar"><span style={{ width: `${util}%`, background: color }} /></div>
        <span>{util}%</span>
      </div>
      <div className="mc-roster-meta">
        <span>👥 {dept.headcount}</span>
        <span>🗒 {dept.taskCount}</span>
        <span>⚡ {dept.processingSpeed}</span>
      </div>
    </button>
  );
}

function statusColor(status: DepartmentSummary["status"]): string {
  switch (status) {
    case "稼働中": return "#22C55E";
    case "処理中": return "#FACC15";
    case "監視中": return "#A855F7";
    case "要対応": return "#EF4444";
    default: return DEPT_STATUS_COLOR.done;
  }
}
