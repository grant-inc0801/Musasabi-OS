import { useState } from "react";
import { isSetupComplete } from "@musasabi/shared";
import { ConnectionSettingsPanel } from "./components/Settings/ConnectionSettingsPanel";
import { EmployeeSettingsPanel } from "./components/Settings/EmployeeSettingsPanel";
import { CompanyPage } from "./components/Company/CompanyPage";
import { SalesBrainPage } from "./components/SalesBrain/SalesBrainPage";
import { FirstRunSetup } from "./components/Setup/FirstRunSetup";
import { SalesKpiPage } from "./components/Sales/SalesKpiPage";
import { SalesCallTrainingPage } from "./components/Sales/SalesCallTrainingPage";
import { PublishingPage } from "./components/Publishing/PublishingPage";
import { DeptDetailPage } from "./components/Department/DeptDetailPage";
import { loadSetupState } from "./lib/setupStorage";

// β版管理画面(D-20260706 系 + ユーザーFB)。ダークテーマ+部門ツリー型サイドバー。
// サイドバーは部門名のみを表示し、部門配下のサブ項目(営業部 → KPI /
// コールトレーニング / Sales Brain)から各詳細ページへ遷移する。
type Page =
  | "sales_kpi"
  | "sales_call_training"
  | "sales_brain"
  | "publishing"
  | "development"
  | "support"
  | "company"
  | "settings";

const PAGE_TITLE_JA: Record<Page, string> = {
  sales_kpi: "営業部 — KPI",
  sales_call_training: "営業部 — コールトレーニング",
  sales_brain: "営業部 — Sales Brain",
  publishing: "出版部",
  development: "開発部",
  support: "サポート部",
  company: "AI社員管理",
  settings: "設定",
};

/** サイドバーのナビ構造: 部門名+サブ項目。サブ項目が無い部門は部門名クリックで遷移。 */
const NAV_TREE: ReadonlyArray<{
  label: string;
  page?: Page;
  children?: ReadonlyArray<{ label: string; page: Page }>;
}> = [
  {
    label: "営業部",
    children: [
      { label: "KPI", page: "sales_kpi" },
      { label: "コールトレーニング", page: "sales_call_training" },
      { label: "Sales Brain", page: "sales_brain" },
    ],
  },
  { label: "出版部", page: "publishing" },
  { label: "開発部", page: "development" },
  { label: "サポート部", page: "support" },
];

const GLOBAL_NAV: ReadonlyArray<{ label: string; page: Page }> = [
  { label: "AI社員管理", page: "company" },
  { label: "設定", page: "settings" },
];

export function App() {
  const [page, setPage] = useState<Page>("sales_kpi");
  // 初回セットアップが未完了なら、通常UIの前にセットアップウィザードを表示する。
  const [setupDone, setSetupDone] = useState<boolean>(() => isSetupComplete(loadSetupState()));

  if (!setupDone) {
    return <FirstRunSetup onComplete={() => setSetupDone(true)} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="サイドバー">
        <div className="brand">
          <MusasabiMark /> Musasabi OS β
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {NAV_TREE.map((dept) => (
            <div key={dept.label}>
              {dept.page ? (
                <button
                  type="button"
                  className="nav-dept"
                  onClick={() => setPage(dept.page as Page)}
                  disabled={page === dept.page}
                >
                  {dept.label}
                </button>
              ) : (
                <div className="nav-dept-label">{dept.label}</div>
              )}
              {dept.children?.map((child) => (
                <button
                  key={child.page}
                  type="button"
                  className="nav-sub"
                  onClick={() => setPage(child.page)}
                  disabled={page === child.page}
                >
                  ↳ {child.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ fontSize: "0.75rem", color: "#9aa3ba", margin: "0.75rem 0 0.1rem" }}>
          全社
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {GLOBAL_NAV.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => setPage(item.page)}
              disabled={page === item.page}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <p className="sidebar-note">
          β版はMock構成です。実API接続・実架電・実認証情報の保存は行いません。
          ウィンドウを閉じる/最小化すると右下のMUSAアバターだけが常駐します。
        </p>
      </aside>
      <main className="content">
        <h1 style={{ marginTop: 0 }}>{PAGE_TITLE_JA[page]}</h1>
        {page === "sales_kpi" ? (
          <SalesKpiPage />
        ) : page === "sales_call_training" ? (
          <SalesCallTrainingPage />
        ) : page === "sales_brain" ? (
          <SalesBrainPage />
        ) : page === "publishing" ? (
          <PublishingPage />
        ) : page === "development" ? (
          <DeptDetailPage deptId="dept-development" />
        ) : page === "support" ? (
          <DeptDetailPage deptId="dept-support" />
        ) : page === "company" ? (
          <CompanyPage onNavigateToCallTraining={() => setPage("sales_call_training")} />
        ) : (
          <>
            <EmployeeSettingsPanel />
            <ConnectionSettingsPanel />
          </>
        )}
      </main>
    </div>
  );
}

/** ブランドマーク(白ムササビ/黒角丸。アプリアイコンと同デザインのインラインSVG)。 */
function MusasabiMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" style={{ verticalAlign: "-4px" }}>
      <rect x="3" y="3" width="94" height="94" rx="13" fill="#000" />
      <polygon
        fill="#fff"
        points="80,24.5 75.5,21.5 70,20.5 66.5,16 63.5,22.5 57.5,27 46,33.5 33.5,37.5 23.5,38.5 33,45 41.5,50.5 34.5,60 18.5,63.5 31.5,67.5 14.5,80 41.5,63.5 53,54.5 65.5,46 74.5,40 85.5,31.5 88.5,29 87.5,33 79,38.5 75.5,34.5 77.5,29"
      />
      <circle cx="70.5" cy="25.5" r="2.4" fill="#000" />
    </svg>
  );
}
