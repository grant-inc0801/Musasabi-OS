import {
  COMPANY_WORKFLOWS,
  WORKFLOW_STATUS_COLOR,
  buildWorkflowSummary,
  currentStep,
  workflowProgress,
  workflowStepIcon,
} from "@musasabi/ai-company";

// D-012 AI Company Workflow: 部署をまたぐ業務フローの可視化ページ。
// 各ワークフローをステップ列(部署アイコン+作業+状態ランプ)で表示する。すべてMock。

const DEPT_PAGE: Record<string, string> = {
  sales: "sales_kpi",
  support: "support",
  development: "development",
  publishing: "publishing",
  planning: "planning",
  market_research: "market_research",
  marketing: "marketing",
  accounting: "accounting",
  hr: "hr",
};

export function WorkflowPage({ onOpenPage }: { onOpenPage: (page: string) => void }) {
  const summary = buildWorkflowSummary();
  const tiles = [
    { label: "ワークフロー数", value: `${summary.total}件` },
    { label: "進行中", value: `${summary.running}件` },
    { label: "承認待ち", value: `${summary.waitingApproval}件` },
    { label: "平均進捗", value: `${summary.averageProgressPercent}%` },
  ];

  return (
    <>
      <section aria-label="ワークフローサマリー">
        <h3 style={{ marginTop: 0 }}>AIカンパニー・ワークフロー</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          部署をまたぐ業務フローを可視化します。各ステップは担当部署・作業・状態で構成され、
          最初の未完了ステップが現在の作業です(すべてMock・実実行なし)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {tiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "9rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </section>

      {COMPANY_WORKFLOWS.map((wf) => {
        const cur = currentStep(wf);
        const progress = workflowProgress(wf);
        return (
          <section key={wf.id} aria-label={wf.name}>
            <h3 style={{ marginBottom: "0.2rem" }}>{wf.name}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0 0 0.5rem" }}>
              {wf.description}
            </p>
            <div className="progress-track" style={{ maxWidth: "48rem" }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: "var(--ok)" }} />
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0.6rem" }}>
              進捗{progress}%
              {cur ? ` ・ 現在: ${cur.deptName}「${cur.action}」` : " ・ 完了"}
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "stretch" }}>
              {wf.steps.map((step, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ minWidth: "12rem", flex: "1 1 12rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span aria-hidden="true" style={{ fontSize: 16 }}>
                      {workflowStepIcon(step)}
                    </span>
                    <strong style={{ flex: 1, fontSize: "0.85rem" }}>{step.deptName}</strong>
                    <span
                      className="dept-lamp"
                      style={{
                        background: WORKFLOW_STATUS_COLOR[step.status],
                        boxShadow: `0 0 6px ${WORKFLOW_STATUS_COLOR[step.status]}`,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.82rem" }}>{step.action}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {i + 1}. {step.status}
                  </div>
                  {DEPT_PAGE[step.deptId] && (
                    <button
                      type="button"
                      style={{ alignSelf: "flex-start", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                      onClick={() => onOpenPage(DEPT_PAGE[step.deptId])}
                    >
                      部署を見る
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
