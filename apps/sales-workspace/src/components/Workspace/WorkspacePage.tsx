import { useMemo } from "react";
import {
  COMMAND_DEPARTMENTS,
  buildDailyDigest,
  withLiveSalesData,
} from "@musasabi/ai-company";
import { callLogStats } from "@musasabi/call-training";
import { countByStatus } from "@musasabi/sales-list";
import { loadCallLog } from "../../lib/callLogStorage";
import { loadLeads } from "../../lib/salesListStorage";
import { loadMemoryRecords } from "../../lib/memoryStorage";
import brandIcon from "../../assets/brand-icon.png";

// D-014 Desktop Assistant & Workspace: デスクトップアシスタントのワークスペース。
// 本日のダイジェスト(全社の要注目事項)+ 各機能へのクイックアクションを提供する。

const QUICK_ACTIONS: { label: string; page: string; hint: string }[] = [
  { label: "全社ダッシュボード", page: "company_dashboard", hint: "全部署のKPIを一覧" },
  { label: "ワークフロー", page: "workflow", hint: "部署横断の業務フロー" },
  { label: "コラボレーション", page: "collaboration", hint: "引き継ぎ・共有ナレッジ" },
  { label: "Company Brain", page: "company_brain", hint: "行動記録・自己改善" },
  { label: "コマンドセンター", page: "command_center", hint: "部署パネルと指示チャット" },
];

export function WorkspacePage({ onOpenPage }: { onOpenPage: (page: string) => void }) {
  const digest = useMemo(() => {
    const stats = callLogStats(loadCallLog());
    const leadCounts = countByStatus(loadLeads());
    const recentLogs = loadMemoryRecords()
      .filter((r) => r.category === "work")
      .slice(0, 5)
      .map((r) => r.action);
    const live = {
      callCount: stats.sessionCount,
      appointmentCount: leadCounts.appointment,
      wonCount: leadCounts.won,
      notCalledCount: leadCounts.not_called,
      recentLogs,
    };
    return buildDailyDigest(withLiveSalesData(COMMAND_DEPARTMENTS, live));
  }, []);

  const workLogs = useMemo(
    () =>
      loadMemoryRecords()
        .filter((r) => r.category === "work")
        .slice(0, 8),
    [],
  );

  const counts = [
    { label: "承認待ち", value: `${digest.counts.approvals}部署` },
    { label: "進行中WF", value: `${digest.counts.runningWorkflows}件` },
    { label: "未対応問合せ", value: `${digest.counts.openSupport}件` },
    { label: "開発エラー", value: `${digest.counts.devErrors}件` },
    { label: "連携中", value: `${digest.counts.collabInProgress}件` },
  ];

  return (
    <>
      <section aria-label="本日のダイジェスト">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <img src={brandIcon} width={36} height={36} alt="" style={{ borderRadius: 8 }} />
          <h3 style={{ margin: 0 }}>MUSAアシスタント — 本日のダイジェスト</h3>
        </div>
        <div
          className="card"
          style={{ marginTop: "0.6rem", maxWidth: "48rem", lineHeight: 1.7 }}
        >
          {digest.lines.map((l, i) => (
            <div key={i}>・{l}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          {counts.map((c) => (
            <div key={c.label} className="card" style={{ minWidth: "8rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{c.label}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{c.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="クイックアクション">
        <h3 style={{ marginTop: 0 }}>クイックアクション</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))",
            gap: "0.6rem",
          }}
        >
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.page}
              type="button"
              onClick={() => onOpenPage(a.page)}
              style={{ textAlign: "left", padding: "0.7rem 0.9rem" }}
            >
              <div style={{ fontWeight: 700 }}>{a.label}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{a.hint}</div>
            </button>
          ))}
        </div>
      </section>

      <section aria-label="最近の業務ログ">
        <h3 style={{ marginTop: 0 }}>最近の業務ログ(Company Brain)</h3>
        {workLogs.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            まだ業務ログがありません。テストコールや各種操作が自動で記録されます。
          </p>
        ) : (
          <ul style={{ fontSize: "0.85rem" }}>
            {workLogs.map((r) => (
              <li key={r.id}>
                {new Date(r.timestampMs).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                {r.actor}: {r.action}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
