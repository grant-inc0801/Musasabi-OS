import {
  DEPARTMENT_PROFILES,
  DEPT_PROFILE_STATUS_LABEL_JA,
  DEPT_PROFILE_STATUS_COLOR,
  VAULT_LINK_STATUS_COLOR,
  buildDepartmentDashboardStats,
} from "@musasabi/ai-company";

// 部門ダッシュボード(Directive D-20260708-001 §4/§13.3)。
// 全部門に統一概念(目的・担当AI社員・稼働状態・進行中/完了/保留タスク・
// 次の推奨アクション・関連ドキュメント・保管庫連携状態)を与えて一覧表示する。
// すべて Mock。実データ連携・保管庫の実保存は行わない。

export function DepartmentDashboardPage() {
  const stats = buildDepartmentDashboardStats();

  return (
    <>
      <section aria-label="部門ダッシュボード概要">
        <h2>部門ダッシュボード</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          各部門の目的・担当AI社員・稼働状態・進行中/完了/保留タスク・次の推奨アクション・
          関連ドキュメント・保管庫連携状態を一元表示します(すべてMock)。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="部門数" value={`${stats.totalDepartments}`} />
          <StatTile label="稼働中" value={`${stats.workingCount}`} />
          <StatTile label="承認待ち" value={`${stats.waitingApprovalCount}`} />
          <StatTile label="保管庫連携済" value={`${stats.vaultLinkedCount}`} />
          <StatTile label="進行中タスク" value={`${stats.totalInProgressTasks}`} />
          <StatTile label="保留タスク" value={`${stats.totalPendingTasks}`} />
        </div>
      </section>

      <section aria-label="部門カード一覧">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(20rem, 1fr))",
            gap: "1rem",
          }}
        >
          {DEPARTMENT_PROFILES.map((p) => (
            <div
              key={p.id}
              aria-label={`部門: ${p.name}`}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.9rem 1rem",
                background: "var(--surface, transparent)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "1.3rem" }}>{p.icon}</span>
                <strong style={{ fontSize: "1.05rem" }}>{p.name}</strong>
                <span
                  style={{
                    marginLeft: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.8rem",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: DEPT_PROFILE_STATUS_COLOR[p.status],
                      boxShadow: `0 0 6px ${DEPT_PROFILE_STATUS_COLOR[p.status]}`,
                    }}
                  />
                  {DEPT_PROFILE_STATUS_LABEL_JA[p.status]}
                </span>
              </div>
              <p style={{ margin: "0.2rem 0 0.6rem", fontSize: "0.9rem" }}>{p.purpose}</p>

              <Field label="担当AI社員">{p.staff.join("・")}</Field>

              <TaskList label="進行中タスク" items={p.inProgressTasks} />
              <TaskList label="完了タスク" items={p.doneTasks} />
              <TaskList label="保留タスク" items={p.pendingTasks} />

              <Field label="次の推奨アクション">
                <ol style={{ margin: "0.2rem 0 0", paddingLeft: "1.1rem" }}>
                  {p.nextActions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ol>
              </Field>

              <Field label="関連ドキュメント">{p.relatedDocs.join("、")}</Field>

              <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--text-muted)" }}>保管庫連携:</span>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: VAULT_LINK_STATUS_COLOR[p.vaultLink],
                    display: "inline-block",
                  }}
                />
                {p.vaultLink}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{label}</div>
      <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "0.4rem", fontSize: "0.88rem" }}>
      <span style={{ color: "var(--text-muted)" }}>{label}: </span>
      {children}
    </div>
  );
}

function TaskList({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <div style={{ marginTop: "0.4rem", fontSize: "0.88rem" }}>
      <span style={{ color: "var(--text-muted)" }}>
        {label}({items.length}):
      </span>
      {items.length === 0 ? (
        " —"
      ) : (
        <ul style={{ margin: "0.2rem 0 0", paddingLeft: "1.1rem" }}>
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
