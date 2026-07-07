import { DEPT_STATUS_COLOR, DEPT_STATUS_LABEL_JA } from "@musasabi/ai-company";
import type { CommandDepartment } from "@musasabi/ai-company";

// 右側: 部署詳細パネル(D-20260706-007)。部署パネルのクリックで表示。
// 営業部はコールシステム関連のMock情報を表示する(実架電なし)。

/** 営業部のコールシステムMock(Directive 5)。 */
const SALES_CALL_MOCK = {
  callsToday: 150,
  connectRate: 32,
  appointments: 28,
  deals: 12,
  inProgress: 120,
  queue: [
    { label: "待機中", count: 12, color: "#6b7280" },
    { label: "通話中", count: 68, color: "#22C55E" },
    { label: "後処理中", count: 28, color: "#3b82f6" },
    { label: "エラー", count: 12, color: "#EF4444" },
  ],
};

export function DepartmentDetailPanel({
  dept,
  onClose,
  onOpenDetail,
}: {
  dept: CommandDepartment | null;
  onClose: () => void;
  onOpenDetail: (deptId: string) => void;
}) {
  if (!dept) {
    return (
      <aside className="dept-detail" aria-label="部署詳細">
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          部署パネルをクリックすると、ここに詳細が表示されます。
        </p>
      </aside>
    );
  }
  const color = DEPT_STATUS_COLOR[dept.status];
  return (
    <aside className="dept-detail" aria-label="部署詳細">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: "1.15rem" }}>{dept.name} 詳細</h2>
        <button type="button" onClick={onClose} style={{ padding: "0.15rem 0.6rem" }}>
          ×
        </button>
      </div>
      <p style={{ margin: "0.4rem 0 0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span className="dept-lamp" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        {DEPT_STATUS_LABEL_JA[dept.status]}
        <span style={{ color: "var(--text-muted)" }}>{dept.memberCount}人</span>
      </p>

      {dept.status === "error" && dept.errorCause && (
        <div className="detail-block" style={{ borderColor: "#EF444488" }}>
          <strong style={{ color: "#c93430" }}>エラー情報</strong>
          <p style={{ margin: "0.3rem 0 0" }}>原因: {dept.errorCause}</p>
          <p style={{ margin: "0.2rem 0 0" }}>対処: {dept.errorFix}</p>
        </div>
      )}

      {dept.id === "sales" && (
        <div className="detail-block">
          <strong>コールシステム(Mock・実架電なし)</strong>
          <div className="detail-stats">
            <div>
              <span>架電数(本日)</span>
              <b>{SALES_CALL_MOCK.callsToday}件</b>
            </div>
            <div>
              <span>接続率</span>
              <b>{SALES_CALL_MOCK.connectRate}%</b>
            </div>
            <div>
              <span>アポ獲得数</span>
              <b>{SALES_CALL_MOCK.appointments}件</b>
            </div>
            <div>
              <span>成約数</span>
              <b>{SALES_CALL_MOCK.deals}件</b>
            </div>
          </div>
          <strong style={{ display: "block", marginTop: "0.6rem" }}>
            コール状況({SALES_CALL_MOCK.inProgress}件 進行中)
          </strong>
          <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1rem" }}>
            {SALES_CALL_MOCK.queue.map((q) => (
              <li key={q.label} style={{ margin: "0.15rem 0" }}>
                <span
                  className="dept-lamp"
                  style={{ background: q.color, boxShadow: `0 0 6px ${q.color}`, marginRight: 6 }}
                />
                {q.label}: {q.count}件
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="detail-block">
        <strong>作業内容</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem" }}>
          {dept.tasks.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <strong>作業進捗</strong>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${dept.progressPercent}%`, background: color }}
          />
        </div>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{dept.progressPercent}%</span>
      </div>

      <div className="detail-block">
        <strong>作業ログ(最新{dept.logs.length}件)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {dept.logs.map((log) => (
            <li key={log}>{log}</li>
          ))}
        </ul>
      </div>

      <button type="button" onClick={() => onOpenDetail(dept.id)}>
        詳細を見る
      </button>
    </aside>
  );
}
