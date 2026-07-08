import { useEffect, useState } from "react";
import { isSetupComplete } from "@musasabi/shared";
import { ConnectionSettingsPanel } from "./components/Settings/ConnectionSettingsPanel";
import { EmployeeSettingsPanel } from "./components/Settings/EmployeeSettingsPanel";
import { AvatarStudioPanel } from "./components/Settings/AvatarStudioPanel";
import { DataManagementPanel } from "./components/Settings/DataManagementPanel";
import { CompanyPage } from "./components/Company/CompanyPage";
import { CompanyDashboardPage } from "./components/Company/CompanyDashboardPage";
import { DepartmentDashboardPage } from "./components/Department/DepartmentDashboardPage";
import { AvatarMotionPage } from "./components/Avatar/AvatarMotionPage";
import { ConnectorsPage } from "./components/Connectors/ConnectorsPage";
import { AiPmPage } from "./components/Enterprise/AiPmPage";
import { ProductPage } from "./components/Enterprise/ProductPage";
import { OpsMonitorPage } from "./components/Enterprise/OpsMonitorPage";
import { ImprovementPage } from "./components/Enterprise/ImprovementPage";
import { GovernancePage } from "./components/Enterprise/GovernancePage";
import { WorkflowPage } from "./components/Workflow/WorkflowPage";
import { CollaborationPage } from "./components/Collaboration/CollaborationPage";
import { WorkspacePage } from "./components/Workspace/WorkspacePage";
import { SelfEvolutionPage } from "./components/SelfEvolution/SelfEvolutionPage";
import { OperationsPage } from "./components/Operations/OperationsPage";
import { ReportsPage } from "./components/Reports/ReportsPage";
import { NotificationsPage } from "./components/Notifications/NotificationsPage";
import { SchedulerPage } from "./components/Scheduler/SchedulerPage";
import { HelpPage } from "./components/Help/HelpPage";
import { SalesBrainPage } from "./components/SalesBrain/SalesBrainPage";
import { FirstRunSetup } from "./components/Setup/FirstRunSetup";
import { SalesKpiPage } from "./components/Sales/SalesKpiPage";
import { SalesListPage } from "./components/Sales/SalesListPage";
import { SalesCallTrainingPage } from "./components/Sales/SalesCallTrainingPage";
import { PublishingPage } from "./components/Publishing/PublishingPage";
import { PlanningPage } from "./components/Planning/PlanningPage";
import { MarketResearchPage } from "./components/MarketResearch/MarketResearchPage";
import { MarketingPage } from "./components/BackOffice/MarketingPage";
import { AccountingPage } from "./components/BackOffice/AccountingPage";
import { HrPage } from "./components/BackOffice/HrPage";
import { SupportPage } from "./components/Support/SupportPage";
import { DevelopmentPage } from "./components/Development/DevelopmentPage";
import { PluginsPage } from "./components/Plugins/PluginsPage";
import { CompanyBrainPage } from "./components/Memory/CompanyBrainPage";
import { VisionPage } from "./components/Vision/VisionPage";
import { AutomationPage } from "./components/Automation/AutomationPage";
import { CallListPage } from "./components/CallList/CallListPage";
import { CommandCenterPage } from "./components/CommandCenter/CommandCenterPage";
import { installAutomationRemoteControl, noteNavigation } from "./lib/automationStorage";
import brandIcon from "./assets/brand-icon.png";
import { loadSetupState } from "./lib/setupStorage";

// β版管理画面(D-20260706 系 + ユーザーFB)。ダークテーマ+部門ツリー型サイドバー。
// サイドバーは部門名のみを表示し、部門配下のサブ項目(営業部 → KPI /
// コールトレーニング / Sales Brain)から各詳細ページへ遷移する。
type Page =
  | "command_center"
  | "sales_kpi"
  | "sales_list"
  | "sales_call_training"
  | "sales_brain"
  | "publishing"
  | "planning"
  | "market_research"
  | "development"
  | "dev_call_list"
  | "support"
  | "marketing"
  | "accounting"
  | "hr"
  | "company"
  | "workspace"
  | "operations"
  | "reports"
  | "notifications"
  | "scheduler"
  | "help"
  | "company_dashboard"
  | "department_dashboard"
  | "avatar_motion"
  | "connectors"
  | "ai_pm"
  | "product"
  | "ops_monitor"
  | "improvement"
  | "governance"
  | "workflow"
  | "company_brain"
  | "collaboration"
  | "self_evolution"
  | "vision"
  | "automation"
  | "plugins"
  | "settings";

const PAGE_TITLE_JA: Record<Page, string> = {
  command_center: "Musasabi Command Center",
  sales_kpi: "営業部 — KPI",
  sales_list: "営業部 — 営業リスト",
  sales_call_training: "営業部 — コールトレーニング",
  sales_brain: "営業部 — Sales Brain",
  publishing: "出版部",
  planning: "企画部",
  market_research: "市場調査部",
  development: "開発部",
  dev_call_list: "開発部 — 架電リスト制作課",
  support: "サポート部",
  marketing: "マーケティング部",
  accounting: "経理部",
  hr: "人事部",
  company: "AI社員管理",
  workspace: "ワークスペース",
  operations: "オペレーション",
  reports: "レポート",
  notifications: "通知センター",
  scheduler: "スケジューラ",
  help: "ヘルプ",
  company_dashboard: "全社ダッシュボード",
  department_dashboard: "部門ダッシュボード",
  avatar_motion: "アバターモーション",
  connectors: "外部連携コネクタ",
  ai_pm: "AI PM / 自律経営",
  product: "プロダクト / テナント",
  ops_monitor: "運用モニタリング",
  improvement: "AI改善提案 / 自己進化",
  governance: "AI経営ガバナンス",
  workflow: "ワークフロー",
  company_brain: "Company Brain",
  collaboration: "コラボレーション",
  self_evolution: "AI自己進化",
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
  { label: "企画部", page: "planning" },
  { label: "市場調査部", page: "market_research" },
  {
    label: "開発部",
    children: [
      { label: "部門トップ", page: "development" },
      { label: "架電リスト制作課", page: "dev_call_list" },
    ],
  },
  { label: "サポート部", page: "support" },
  { label: "マーケティング部", page: "marketing" },
  { label: "経理部", page: "accounting" },
  { label: "人事部", page: "hr" },
];

const GLOBAL_NAV: ReadonlyArray<{ label: string; page: Page }> = [
  { label: "ワークスペース", page: "workspace" },
  { label: "オペレーション", page: "operations" },
  { label: "レポート", page: "reports" },
  { label: "通知センター", page: "notifications" },
  { label: "スケジューラ", page: "scheduler" },
  { label: "ヘルプ", page: "help" },
  { label: "全社ダッシュボード", page: "company_dashboard" },
  { label: "部門ダッシュボード", page: "department_dashboard" },
  { label: "アバターモーション", page: "avatar_motion" },
  { label: "外部連携コネクタ", page: "connectors" },
  { label: "AI PM / 自律経営", page: "ai_pm" },
  { label: "プロダクト / テナント", page: "product" },
  { label: "運用モニタリング", page: "ops_monitor" },
  { label: "AI改善提案 / 自己進化", page: "improvement" },
  { label: "AI経営ガバナンス", page: "governance" },
  { label: "ワークフロー", page: "workflow" },
  { label: "AI社員管理", page: "company" },
  { label: "Company Brain", page: "company_brain" },
  { label: "コラボレーション", page: "collaboration" },
  { label: "AI自己進化", page: "self_evolution" },
  { label: "Vision", page: "vision" },
  { label: "Automation", page: "automation" },
  { label: "プラグイン", page: "plugins" },
  { label: "設定", page: "settings" },
];

export function App() {
  // 既定画面は Musasabi Command Center(D-20260706-007)。
  const [page, setPage] = useState<Page>("command_center");
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

  // Command Center は専用の全画面レイアウト(最小サイドバー+部署パネル)。
  if (page === "command_center") {
    return (
      <CommandCenterPage
        onOpenSettings={() => navigate("settings")}
        onOpenPage={(target) => replayNavigate(target)}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="サイドバー">
        <div className="brand">
          <MusasabiMark /> Musasabi OS β
        </div>

        <button type="button" onClick={() => navigate("command_center")}>
          ⌂ コマンドセンター
        </button>

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
        ) : page === "planning" ? (
          <PlanningPage />
        ) : page === "market_research" ? (
          <MarketResearchPage />
        ) : page === "development" ? (
          <DevelopmentPage
            onNavigateToCallList={() => navigate("dev_call_list")}
            onNavigateToAutomation={() => navigate("automation")}
          />
        ) : page === "dev_call_list" ? (
          <CallListPage />
        ) : page === "support" ? (
          <SupportPage />
        ) : page === "marketing" ? (
          <MarketingPage />
        ) : page === "accounting" ? (
          <AccountingPage />
        ) : page === "hr" ? (
          <HrPage />
        ) : page === "workspace" ? (
          <WorkspacePage onOpenPage={(target) => replayNavigate(target)} />
        ) : page === "operations" ? (
          <OperationsPage onOpenPage={(target) => replayNavigate(target)} />
        ) : page === "reports" ? (
          <ReportsPage />
        ) : page === "notifications" ? (
          <NotificationsPage />
        ) : page === "scheduler" ? (
          <SchedulerPage onOpenAutomation={() => navigate("automation")} />
        ) : page === "help" ? (
          <HelpPage
            onOpenPage={(target) => replayNavigate(target)}
            onRestartSetup={() => setSetupDone(false)}
          />
        ) : page === "company_dashboard" ? (
          <CompanyDashboardPage onOpenPage={(target) => replayNavigate(target)} />
        ) : page === "department_dashboard" ? (
          <DepartmentDashboardPage />
        ) : page === "avatar_motion" ? (
          <AvatarMotionPage />
        ) : page === "connectors" ? (
          <ConnectorsPage />
        ) : page === "ai_pm" ? (
          <AiPmPage />
        ) : page === "product" ? (
          <ProductPage />
        ) : page === "ops_monitor" ? (
          <OpsMonitorPage />
        ) : page === "improvement" ? (
          <ImprovementPage />
        ) : page === "governance" ? (
          <GovernancePage />
        ) : page === "workflow" ? (
          <WorkflowPage onOpenPage={(target) => replayNavigate(target)} />
        ) : page === "company_brain" ? (
          <CompanyBrainPage />
        ) : page === "collaboration" ? (
          <CollaborationPage />
        ) : page === "self_evolution" ? (
          <SelfEvolutionPage onOpenAutomation={() => navigate("automation")} />
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
            <DataManagementPanel />
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
