import { useState } from "react";
import { isSetupComplete } from "@musasabi/shared";
import { ConnectionSettingsPanel } from "./components/Settings/ConnectionSettingsPanel";
import { EmployeeSettingsPanel } from "./components/Settings/EmployeeSettingsPanel";
import { CompanyPage } from "./components/Company/CompanyPage";
import { SalesBrainPage } from "./components/SalesBrain/SalesBrainPage";
import { FirstRunSetup } from "./components/Setup/FirstRunSetup";
import { SalesDeptPage } from "./components/Sales/SalesDeptPage";
import { PublishingPage } from "./components/Publishing/PublishingPage";
import { DeptDetailPage } from "./components/Department/DeptDetailPage";
import { loadSetupState } from "./lib/setupStorage";
import {
  MOCK_DEPARTMENT_SUMMARIES,
  computeCompanySummary,
  formatJpy,
  DEPARTMENT_STATUS_LABEL_JA,
} from "@musasabi/ai-company";
import type { DepartmentSummary } from "@musasabi/ai-company";

// β版管理画面(D-20260706-002 / -004 / -006 + ユーザーFB)。ダークテーマ+部門中心
// サイドバー構成。サイドバーは「ミニ経営ダッシュボード」として全体サマリーと部門別の
// 進捗・作業内容を常時表示し、各部門タブから詳細ページへ遷移する。
// ダッシュボードは営業部ページへ集約(独立タブは持たない)。
type Tab =
  | "dept_sales"
  | "dept_publishing"
  | "dept_development"
  | "dept_support"
  | "company"
  | "sales_brain"
  | "settings";

const TAB_LABEL_JA: Record<Tab, string> = {
  dept_sales: "営業部",
  dept_publishing: "出版部",
  dept_development: "開発部",
  dept_support: "サポート部",
  company: "AI社員管理",
  sales_brain: "Sales Brain",
  settings: "設定",
};

/** 部門ID → タブ(サイドバーの部門カードから各詳細ページへ遷移する)。 */
const DEPT_TAB: Record<string, Tab> = {
  "dept-sales": "dept_sales",
  "dept-publishing": "dept_publishing",
  "dept-development": "dept_development",
  "dept-support": "dept_support",
};

const GLOBAL_TABS: Tab[] = ["company", "sales_brain", "settings"];

const COMPANY_SUMMARY = computeCompanySummary(MOCK_DEPARTMENT_SUMMARIES);

export function App() {
  // ダッシュボードは営業部に集約したため、既定タブは営業部。
  const [tab, setTab] = useState<Tab>("dept_sales");
  // 初回セットアップが未完了なら、通常UIの前にセットアップウィザードを表示する
  // (Phase β-002 優先順位①)。判定は localStorage 由来の状態から決定論的に行う。
  const [setupDone, setSetupDone] = useState<boolean>(() => isSetupComplete(loadSetupState()));

  if (!setupDone) {
    return <FirstRunSetup onComplete={() => setSetupDone(true)} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="サイドバー">
        <div className="brand">🐿 Musasabi OS β</div>

        <div className="status-card">
          <strong>全体サマリー</strong>
          <br />
          AI社員: {COMPANY_SUMMARY.totalEmployees}名
          <br />
          総売上: {formatJpy(COMPANY_SUMMARY.totalRevenueJpy)}
          <br />
          本日進捗: {COMPANY_SUMMARY.todayProgressPercent}%
          <br />
          稼働部門: {COMPANY_SUMMARY.activeDepartments}部門
        </div>

        <div style={{ fontSize: "0.75rem", color: "#9aa3ba", margin: "0.5rem 0 0.1rem" }}>部門</div>
        {MOCK_DEPARTMENT_SUMMARIES.map((dept) => (
          <DepartmentCard
            key={dept.id}
            dept={dept}
            active={DEPT_TAB[dept.id] === tab}
            onSelect={DEPT_TAB[dept.id] ? () => setTab(DEPT_TAB[dept.id]) : null}
          />
        ))}

        <div style={{ fontSize: "0.75rem", color: "#9aa3ba", margin: "0.5rem 0 0.1rem" }}>全社</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {GLOBAL_TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} disabled={tab === t}>
              {TAB_LABEL_JA[t]}
            </button>
          ))}
        </nav>

        <p className="sidebar-note">
          β版はMock構成です(社員数・売上・進捗もMock値)。実API接続・実架電・
          実認証情報の保存は行いません。ウィンドウを閉じる/最小化すると
          右下のMUSAアバターだけが常駐します。
        </p>
      </aside>
      <main className="content">
        <h1 style={{ marginTop: 0 }}>{TAB_LABEL_JA[tab]}</h1>
        {tab === "settings" ? (
          <>
            <EmployeeSettingsPanel />
            <ConnectionSettingsPanel />
          </>
        ) : tab === "company" ? (
          <CompanyPage onNavigateToCallTraining={() => setTab("dept_sales")} />
        ) : tab === "dept_sales" ? (
          <SalesDeptPage />
        ) : tab === "dept_publishing" ? (
          <PublishingPage />
        ) : tab === "dept_development" ? (
          <DeptDetailPage deptId="dept-development" />
        ) : tab === "dept_support" ? (
          <DeptDetailPage deptId="dept-support" />
        ) : (
          <SalesBrainPage />
        )}
      </main>
    </div>
  );
}

interface DepartmentCardProps {
  dept: DepartmentSummary;
  active: boolean;
  /** 部門ページを持たない部門は null(カード表示のみ)。 */
  onSelect: (() => void) | null;
}

/** サイドバーの部門カード。進捗・作業内容・売上・ステータスを常時表示する。 */
function DepartmentCard({ dept, active, onSelect }: DepartmentCardProps) {
  const body = (
    <>
      <strong>
        {dept.name}
        <span style={{ float: "right", fontWeight: "normal", color: "#9aa3ba" }}>
          {DEPARTMENT_STATUS_LABEL_JA[dept.status]}
        </span>
      </strong>
      <br />
      AI社員: {dept.employeeCount}名 / 進捗: {dept.progressPercent}%
      <br />
      作業: {dept.todaySummary}
      <br />
      売上: {formatJpy(dept.revenueJpy)}
    </>
  );
  if (onSelect === null) {
    return <div className="status-card">{body}</div>;
  }
  return (
    <button
      type="button"
      className={`status-card${active ? " active" : ""}`}
      onClick={onSelect}
      disabled={active}
      style={{ textAlign: "left", width: "100%", cursor: active ? "default" : "pointer" }}
    >
      {body}
    </button>
  );
}
