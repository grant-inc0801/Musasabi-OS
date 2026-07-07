import { MOCK_DEPARTMENT_SUMMARIES, DEPARTMENT_STATUS_LABEL_JA } from "@musasabi/ai-company";

// 汎用の部門詳細ページ(D-20260706 ユーザーFB: 各部門タブ → 詳細ページ表示)。
// 専用ページ(営業部/出版部)を持たない部門はこのページで進捗・作業内容を表示する。
// データはMock。専用機能は後続フェーズで各部門ページとして実装する。

export function DeptDetailPage({ deptId }: { deptId: string }) {
  const dept = MOCK_DEPARTMENT_SUMMARIES.find((d) => d.id === deptId);
  if (!dept) {
    return <p>部門が見つかりません。</p>;
  }
  return (
    <section aria-label={dept.name}>
      <h2>{dept.name}</h2>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>AI社員</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>{dept.employeeCount}名</div>
        </div>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>本日進捗</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>{dept.progressPercent}%</div>
        </div>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>状態</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
            {DEPARTMENT_STATUS_LABEL_JA[dept.status]}
          </div>
        </div>
      </div>
      <p style={{ color: "var(--text-muted)" }}>本日の作業: {dept.todaySummary}(Mock)</p>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
        この部門の専用ページ(タスク一覧・成果物など)は後続フェーズで実装予定です。
      </p>
    </section>
  );
}
