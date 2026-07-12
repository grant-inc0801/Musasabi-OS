import { useEffect, useState } from "react";
import { isSetupComplete } from "@musasabi/shared";
import { ConnectionSettingsPanel } from "./components/Settings/ConnectionSettingsPanel";
import { EmployeeSettingsPanel } from "./components/Settings/EmployeeSettingsPanel";
import { DataManagementPanel } from "./components/Settings/DataManagementPanel";
import { CompanyPage } from "./components/Company/CompanyPage";
import { CompanyDashboardPage } from "./components/Company/CompanyDashboardPage";
import { DepartmentDashboardPage } from "./components/Department/DepartmentDashboardPage";
import { ConnectorsPage } from "./components/Connectors/ConnectorsPage";
import { AiIntegrationCenterPage } from "./components/Enterprise/AiIntegrationCenterPage";
import { AiPmPage } from "./components/Enterprise/AiPmPage";
import { ProductPage } from "./components/Enterprise/ProductPage";
import { OpsMonitorPage } from "./components/Enterprise/OpsMonitorPage";
import { ImprovementPage } from "./components/Enterprise/ImprovementPage";
import { GovernancePage } from "./components/Enterprise/GovernancePage";
import { AuditPage } from "./components/Enterprise/AuditPage";
import { OrgStructurePage } from "./components/Enterprise/OrgStructurePage";
import { AdvancedModulesPage } from "./components/Enterprise/AdvancedModulesPage";
import { EcosystemPage } from "./components/Enterprise/EcosystemPage";
import { AgiPage } from "./components/Enterprise/AgiPage";
import { NextCoreModulesPage } from "./components/Enterprise/NextCoreModulesPage";
import { BusinessFactoryPage } from "./components/Enterprise/BusinessFactoryPage";
import { EvolutionModulesPage } from "./components/Enterprise/EvolutionModulesPage";
import { MusasabiWorldPage } from "./components/Enterprise/MusasabiWorldPage";
import { ProductionRoadmapPage } from "./components/Enterprise/ProductionRoadmapPage";
import { MissionControlPage } from "./components/MissionControl/MissionControlPage";
import { WorkflowPage } from "./components/Workflow/WorkflowPage";
import { AgentCenterPage } from "./components/Agent/AgentCenterPage";
import { CollaborationPage } from "./components/Collaboration/CollaborationPage";
import { WorkspacePage } from "./components/Workspace/WorkspacePage";
import { OperationsPage } from "./components/Operations/OperationsPage";
import { ReportsPage } from "./components/Reports/ReportsPage";
import { NotificationsPage } from "./components/Notifications/NotificationsPage";
import { SchedulerPage } from "./components/Scheduler/SchedulerPage";
import { startAgentScheduler } from "./lib/agentSchedule";
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
import { IntelligenceLayerPage } from "./components/Enterprise/IntelligenceLayerPage";
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
  | "mission_control"
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
  | "connectors"
  | "ai_integration_center"
  | "ai_pm"
  | "product"
  | "ops_monitor"
  | "improvement"
  | "governance"
  | "audit"
  | "org_structure"
  | "advanced_modules"
  | "ecosystem"
  | "agi"
  | "next_core_modules"
  | "business_factory"
  | "evolution_modules"
  | "musasabi_world"
  | "production_roadmap"
  | "workflow"
  | "agent_center"
  | "company_brain"
  | "intelligence_layer"
  | "collaboration"
  | "vision"
  | "automation"
  | "plugins"
  | "settings";

const PAGE_TITLE_JA: Record<Page, string> = {
  command_center: "Musasabi Command Center",
  mission_control: "Mission Control",
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
  connectors: "外部連携コネクタ",
  ai_integration_center: "AI統合センター(モデルレジストリ)",
  ai_pm: "AI PM / 自律経営",
  product: "プロダクト / テナント",
  ops_monitor: "運用モニタリング",
  improvement: "AI改善提案 / 自己進化",
  governance: "AI経営ガバナンス",
  audit: "AI監査・リスク",
  org_structure: "AI組織構造",
  advanced_modules: "アドバンスドモジュール",
  ecosystem: "AIエコシステム",
  agi: "Musasabi AGI",
  next_core_modules: "コアモジュール",
  business_factory: "AI事業ファクトリー",
  evolution_modules: "進化モジュール",
  musasabi_world: "Musasabi World",
  production_roadmap: "本番ロードマップ",
  workflow: "ワークフロー",
  agent_center: "エージェント実行センター",
  company_brain: "Company Brain",
  intelligence_layer: "Intelligence Layer",
  collaboration: "コラボレーション",
  vision: "Vision(画面解析)",
  automation: "Automation(操作記録)",
  plugins: "プラグイン",
  settings: "設定",
};

/**
 * サイドバーのナビ構造: 大項目(5〜7)+小項目の折りたたみナビ。
 * 大項目クリックで小項目を開閉する(複数同時に開ける)。既存の全ページを大項目に
 * 割り当てて到達性を維持する(機能を壊さない)。現在ページを含む大項目は既定で開く。
 */
const NAV_GROUPS: ReadonlyArray<{
  id: string;
  label: string;
  icon: string;
  items: ReadonlyArray<{ label: string; page: Page }>;
}> = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
    items: [
      { label: "Mission Control(司令室)", page: "mission_control" },
      { label: "全社ダッシュボード", page: "company_dashboard" },
      { label: "部門ダッシュボード", page: "department_dashboard" },
      { label: "レポート", page: "reports" },
      { label: "通知センター", page: "notifications" },
      { label: "ワークスペース", page: "workspace" },
    ],
  },
  {
    id: "departments",
    label: "Departments",
    icon: "🏢",
    items: [
      { label: "営業部 — KPI", page: "sales_kpi" },
      { label: "営業部 — 営業リスト", page: "sales_list" },
      { label: "営業部 — コールトレーニング", page: "sales_call_training" },
      { label: "営業部 — Sales Brain", page: "sales_brain" },
      { label: "出版部", page: "publishing" },
      { label: "企画部", page: "planning" },
      { label: "市場調査部", page: "market_research" },
      { label: "開発部", page: "development" },
      { label: "開発部 — 架電リスト制作課", page: "dev_call_list" },
      { label: "サポート部", page: "support" },
      { label: "マーケティング部", page: "marketing" },
      { label: "経理部", page: "accounting" },
      { label: "人事部", page: "hr" },
      { label: "AI社員管理", page: "company" },
    ],
  },
  {
    id: "ai-assistant",
    label: "AI Assistant",
    icon: "🤖",
    items: [
      { label: "AI PM / 自律経営", page: "ai_pm" },
      { label: "Musasabi AGI", page: "agi" },
      { label: "コアモジュール", page: "next_core_modules" },
      { label: "アドバンスドモジュール", page: "advanced_modules" },
      { label: "進化モジュール", page: "evolution_modules" },
      { label: "AIエコシステム", page: "ecosystem" },
      { label: "AI改善提案 / 自己進化", page: "improvement" },
      { label: "AI経営ガバナンス", page: "governance" },
      { label: "AI監査・リスク", page: "audit" },
      { label: "Vision(画面解析)", page: "vision" },
    ],
  },
  {
    id: "workflow",
    label: "Workflow",
    icon: "🔄",
    items: [
      { label: "ワークフロー", page: "workflow" },
      { label: "エージェント実行センター", page: "agent_center" },
      { label: "オペレーション", page: "operations" },
      { label: "運用モニタリング", page: "ops_monitor" },
      { label: "スケジューラ", page: "scheduler" },
      { label: "Automation", page: "automation" },
      { label: "コラボレーション", page: "collaboration" },
      { label: "AI事業ファクトリー", page: "business_factory" },
      { label: "Musasabi World", page: "musasabi_world" },
      { label: "本番ロードマップ", page: "production_roadmap" },
    ],
  },
  {
    id: "knowledge",
    label: "Knowledge",
    icon: "📚",
    items: [
      { label: "Company Brain", page: "company_brain" },
      { label: "Intelligence Layer", page: "intelligence_layer" },
      { label: "AI組織構造", page: "org_structure" },
      { label: "プロダクト / テナント", page: "product" },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: "🔌",
    items: [
      { label: "外部連携コネクタ", page: "connectors" },
      { label: "AI統合センター(モデルレジストリ)", page: "ai_integration_center" },
      { label: "プラグイン", page: "plugins" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "🛠️",
    items: [
      { label: "設定", page: "settings" },
      { label: "ヘルプ", page: "help" },
    ],
  },
];

/** ページが属する大項目IDを返す(既定の開閉判定・アクティブ表示に使用)。 */
function groupIdOfPage(p: Page): string | undefined {
  return NAV_GROUPS.find((g) => g.items.some((it) => it.page === p))?.id;
}

export function App() {
  // エージェント定例実行の監視(アプリ起動中・60秒間隔・多重起動なし)
  useEffect(() => {
    startAgentScheduler();
  }, []);

  // 既定画面は Musasabi Command Center(D-20260706-007)。
  const [page, setPage] = useState<Page>("command_center");
  // 大項目クリックで小項目を開閉する(複数同時に開ける)。既定では Dashboard を開く。
  // 現在ページを含む大項目も既定で開く。
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ dashboard: true });

  function toggleGroup(id: string, defaultOpen: boolean): void {
    setExpandedGroups((prev) => ({ ...prev, [id]: !(prev[id] ?? defaultOpen) }));
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

        <nav className="sidebar-nav" data-sidebar>
          {NAV_GROUPS.map((group) => {
            const currentGroup = groupIdOfPage(page);
            const expanded = expandedGroups[group.id] ?? group.id === currentGroup;
            return (
              <div key={group.id} className={`sidebar-group${expanded ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="sidebar-group-button"
                  onClick={() => toggleGroup(group.id, group.id === currentGroup)}
                  aria-expanded={expanded}
                >
                  <span className="sidebar-group-label">
                    <span aria-hidden className="sidebar-group-icon">{group.icon}</span>
                    {group.label}
                  </span>
                  <span className="sidebar-chevron" aria-hidden>{expanded ? "▼" : "▶"}</span>
                </button>
                {expanded && (
                  <div className="sidebar-submenu">
                    {group.items.map((item) => (
                      <button
                        key={item.page}
                        type="button"
                        className={`sidebar-item${page === item.page ? " is-active" : ""}`}
                        aria-current={page === item.page ? "page" : undefined}
                        onClick={() => navigate(item.page)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <p className="sidebar-note">
          β版はMock構成です。実API接続・実架電・実認証情報の保存は行いません。
          ウィンドウを閉じる/最小化するとデスクトップ右下に musasabi アイコンが固定表示され、
          クリックでミニパネルを開けます。
        </p>
      </aside>
      <main className="content">
        <h1 style={{ marginTop: 0 }}>{PAGE_TITLE_JA[page]}</h1>
        {page === "mission_control" ? (
          <MissionControlPage onOpenPage={(target) => replayNavigate(target)} />
        ) : page === "sales_kpi" ? (
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
        ) : page === "connectors" ? (
          <ConnectorsPage />
        ) : page === "ai_integration_center" ? (
          <AiIntegrationCenterPage />
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
        ) : page === "audit" ? (
          <AuditPage />
        ) : page === "org_structure" ? (
          <OrgStructurePage />
        ) : page === "advanced_modules" ? (
          <AdvancedModulesPage />
        ) : page === "ecosystem" ? (
          <EcosystemPage />
        ) : page === "agi" ? (
          <AgiPage />
        ) : page === "next_core_modules" ? (
          <NextCoreModulesPage />
        ) : page === "business_factory" ? (
          <BusinessFactoryPage />
        ) : page === "evolution_modules" ? (
          <EvolutionModulesPage />
        ) : page === "musasabi_world" ? (
          <MusasabiWorldPage />
        ) : page === "production_roadmap" ? (
          <ProductionRoadmapPage />
        ) : page === "agent_center" ? (
          <AgentCenterPage />
        ) : page === "workflow" ? (
          <WorkflowPage onOpenPage={(target) => replayNavigate(target)} />
        ) : page === "company_brain" ? (
          <CompanyBrainPage />
        ) : page === "intelligence_layer" ? (
          <IntelligenceLayerPage />
        ) : page === "collaboration" ? (
          <CollaborationPage />
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
