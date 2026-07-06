import { MOCK_DEPARTMENT_SUMMARIES, formatJpy, DEPARTMENT_STATUS_LABEL_JA } from "@musasabi/ai-company";
import { CallTrainingPage } from "../CallTraining/CallTrainingPage";

// 営業部ページ(D-20260706-006)。コールシステム(Learning / Test / AutoCall)を中心に
// 再構成し、上部に部門サマリー(Mock)を表示する。実架電・実売上連携はしない。

const salesSummary = MOCK_DEPARTMENT_SUMMARIES.find((d) => d.id === "dept-sales");

export function SalesDeptPage() {
  return (
    <>
      <section aria-label="営業部サマリー">
        <h2>営業部</h2>
        {salesSummary && (
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>AI社員</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
                {salesSummary.employeeCount}名
              </div>
            </div>
            <div>
              <div style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>本日進捗</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
                {salesSummary.progressPercent}%
              </div>
            </div>
            <div>
              <div style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>売上(Mock)</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
                {formatJpy(salesSummary.revenueJpy)}
              </div>
            </div>
            <div>
              <div style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>状態</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
                {DEPARTMENT_STATUS_LABEL_JA[salesSummary.status]}
              </div>
            </div>
          </div>
        )}
        {salesSummary && (
          <p style={{ color: "#9aa3ba" }}>本日の作業: {salesSummary.todaySummary}</p>
        )}
      </section>

      <CallTrainingPage />
    </>
  );
}
