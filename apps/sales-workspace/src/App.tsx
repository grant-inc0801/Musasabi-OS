import { useEffect, useState } from "react";
import { isSetupComplete } from "@musasabi/shared";
import { ConnectionSettingsPanel } from "./components/Settings/ConnectionSettingsPanel";
import { EmployeeSettingsPanel } from "./components/Settings/EmployeeSettingsPanel";
import { AvatarStudioPanel } from "./components/Settings/AvatarStudioPanel";
import { CompanyPage } from "./components/Company/CompanyPage";
import { SalesBrainPage } from "./components/SalesBrain/SalesBrainPage";
import { FirstRunSetup } from "./components/Setup/FirstRunSetup";
import { SalesKpiPage } from "./components/Sales/SalesKpiPage";
import { SalesListPage } from "./components/Sales/SalesListPage";
import { SalesCallTrainingPage } from "./components/Sales/SalesCallTrainingPage";
import { PublishingPage } from "./components/Publishing/PublishingPage";
import { DeptDetailPage } from "./components/Department/DeptDetailPage";
import { PluginsPage } from "./components/Plugins/PluginsPage";
import { CompanyBrainPage } from "./components/Memory/CompanyBrainPage";
import { VisionPage } from "./components/Vision/VisionPage";
import { AutomationPage } from "./components/Automation/AutomationPage";
import { CallListPage } from "./components/CallList/CallListPage";
import { installAutomationRemoteControl, noteNavigation } from "./lib/automationStorage";
import brandIcon from "./assets/brand-icon.png";
import { loadSetupState } from "./lib/setupStorage";

// β版管理画面(D-20260706 系 + ユーザーFB)。ダークテーマ+部門ツリー型サイドバー。
// サイドバーは部門名のみを表示し、部門配下のサブ項目(営業部 → KPI /
// コールトレーニング / Sales Brain)から各詳細ページへ遷移する。
type Page =
  | "sales_kpi"
  | "sales_list"
  | "sales_call_training"
  | "sales_brain"
  | "publishing"
  | "development"
  | "dev_call_list"
  | "support"
  | "company"
  | "company_brain"
  | "vision"
  | "automation"
  | "plugins"
  | "settings";

const PAGE_TITLE_JA: Record<Page, string> = {
  sales_kpi: "営業部 — KPI",
  sales_list: "営業部 — 営業リスト",
  sales_call_training: "営業部 — コールトレーニング",
  sales_brain: "営業部 — Sales Brain",
  publishing: "出版部",
  development: "開発部",
  dev_call_list: "開発部 — 架電リスト制作課",
  support: "サポート部",
  company: "AI社員管理",
  company_brain: "Company Brain",
  vision: "Vision(画面解析)",
  automation: "Automation(操作記録)",
  plugins: "プラグイン",
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
      { label: "営業リスト", page: "sales_list" },
      { label: "コールトレーニング", page: "sales_call_training" },
      { label: "Sales Brain", page: "sales_brain" },
    ],
  },
  { label: "出版部", page: "publishing" },
  {
    label: "開発部",
    children: [
      { label: "部門トップ", page: "development" },
      { label: "架電リスト制作課", page: "dev_call_list" },
    ],
  },
  { label: "サポート部", page: "support" },
];

const GLOBAL_NAV: ReadonlyArray<{ label: string; page: Page }> = [
  { label: "AI社員管理", page: "company" },
  { label: "Company Brain", page: "company_brain" },
  { label: "Vision", page: "vision" },
  { label: "Automation", page: "automation" },
  { label: "プラグイン", page: "plugins" },
  { label: "設定", page: "settings" },
];

export function App() {
  const [page, setPage] = useState<Page>("sales_kpi");
  // 部署ボタン押下で小分類項目を開閉する(アコーディオン。ユーザーFB第3弾)。
  // 既定では現在ページを含む営業部のみ開いた状態にする。
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({ 営業部: true });

  function toggleDept(label: string): void {
    setExpandedDepts((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  // ミニパネル(業務支援)からの遠隔コマンド(記録開始/停止/再実行)を受け付ける。
  useEffect(() => {
    return installAutomationRemoteControl((target) => {
      if (target in PAGE_TITLE_JA) {
        setPage(target as Page);
      }
    });
  }, []);
  // 初回セットアップが未完了なら、通常UIの前にセットアップウィザードを表示する。
  const [setupDone, setSetupDone] = useState<boolean>(() => isSetupComplete(loadSetupState()));

  if (!setupDone) {
    return <FirstRunSetup onComplete={() => setSetupDone(true)} />;
  }

  // ユーザー操作によるページ遷移。Automation の記録中のみ記録候補として通知される
  // (手動オプトイン)。再実行による遷移は replayNavigate を使い、再記録しない。
  function navigate(next: Page): void {
    noteNavigation(next, PAGE_TITLE_JA[next]);
    setPage(next);
  }

  function replayNavigate(target: string): void {
    if (target in PAGE_TITLE_JA) {
      setPage(target as Page);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="サイドバー">
        <div className="brand">
          <MusasabiMark /> Musasabi OS β
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {NAV_TREE.map((dept) => {
            const expanded = expandedDepts[dept.label] === true;
            return (
              <div key={dept.label}>
                {dept.children ? (
                  <button
                    type="button"
                    className="nav-dept"
                    onClick={() => toggleDept(dept.label)}
                    aria-expanded={expanded}
                  >
                    <span style={{ display: "inline-block", width: "1em" }}>
                      {expanded ? "▾" : "▸"}
                    </span>
                    {dept.label}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="nav-dept"
                    onClick={() => navigate(dept.page as Page)}
                    disabled={page === dept.page}
                  >
                    <span style={{ display: "inline-block", width: "1em" }} />
                    {dept.label}
                  </button>
                )}
                {expanded &&
                  dept.children?.map((child) => (
                    <button
                      key={child.page}
                      type="button"
                      className="nav-sub"
                      onClick={() => navigate(child.page)}
                      disabled={page === child.page}
                    >
                      ↳ {child.label}
                    </button>
                  ))}
              </div>
            );
          })}
        </nav>

        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.75rem 0 0.1rem" }}>
          全社
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {GLOBAL_NAV.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => navigate(item.page)}
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
        ) : page === "sales_list" ? (
          <SalesListPage onNavigateToCallTraining={() => navigate("sales_call_training")} />
        ) : page === "sales_call_training" ? (
          <SalesCallTrainingPage />
        ) : page === "sales_brain" ? (
          <SalesBrainPage />
        ) : page === "publishing" ? (
          <PublishingPage />
        ) : page === "development" ? (
          <DeptDetailPage deptId="dept-development" />
        ) : page === "dev_call_list" ? (
          <CallListPage />
        ) : page === "support" ? (
          <DeptDetailPage deptId="dept-support" />
        ) : page === "company_brain" ? (
          <CompanyBrainPage />
        ) : page === "vision" ? (
          <VisionPage />
        ) : page === "automation" ? (
          <AutomationPage onNavigate={replayNavigate} />
        ) : page === "plugins" ? (
          <PluginsPage />
        ) : page === "company" ? (
          <CompanyPage onNavigateToCallTraining={() => setPage("sales_call_training")} />
        ) : (
          <>
            <AvatarStudioPanel />
            <EmployeeSettingsPanel />
            <ConnectionSettingsPanel />
          </>
        )}
      </main>
    </div>
  );
}

/** ブランドマーク(公式アイコン画像。apps/desktop のアプリアイコンと同一ソース)。 */
function MusasabiMark() {
  return (
    <img
      src={brandIcon}
      width={20}
      height={20}
      alt=""
      style={{ verticalAlign: "-4px", borderRadius: 4 }}
    />
  );
}
