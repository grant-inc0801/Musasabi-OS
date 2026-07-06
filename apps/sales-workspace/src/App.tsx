import { useEffect, useState } from "react";
import { calculateKpi, generateDailyPlan, recommendActions } from "@musasabi/ai-core";
import type { Lead } from "@musasabi/ai-core";
import { isSetupComplete } from "@musasabi/shared";
import type { CallAnalysisSummary } from "@musasabi/voice-analysis";
import { MOCK_CALLS, MOCK_LEADS } from "./mockData";
import { KpiDashboard } from "./components/KpiDashboard";
import { DailyPlanBoard } from "./components/DailyPlanBoard";
import { LeadTable } from "./components/LeadTable";
import { RecommendedActionsList } from "./components/RecommendedActionsList";
import { MusaActionsPanel } from "./components/MusaActionsPanel";
import { CallAnalysisPanel } from "./components/CallAnalysisPanel";
import { ConnectionSettingsPanel } from "./components/Settings/ConnectionSettingsPanel";
import { EmployeeSettingsPanel } from "./components/Settings/EmployeeSettingsPanel";
import { CompanyPage } from "./components/Company/CompanyPage";
import { SalesBrainPage } from "./components/SalesBrain/SalesBrainPage";
import { FirstRunSetup } from "./components/Setup/FirstRunSetup";
import { SalesDeptPage } from "./components/Sales/SalesDeptPage";
import { PublishingPage } from "./components/Publishing/PublishingPage";
import { loadSetupState } from "./lib/setupStorage";
import {
  MOCK_DEPARTMENT_SUMMARIES,
  computeCompanySummary,
  formatJpy,
  DEPARTMENT_STATUS_LABEL_JA,
} from "@musasabi/ai-company";
import type { DepartmentSummary } from "@musasabi/ai-company";

// β版管理画面(D-20260706-002 / -004 / -006)。ダークテーマ+部門中心サイドバー構成。
// サイドバーは「ミニ経営ダッシュボード」として全体サマリーと部門別の進捗・作業内容を
// 常時表示し、部門ページ(営業部=コールシステム中心 / 出版部=成果物・売上中心)と
// 全社画面(ダッシュボード / AI社員管理 / Sales Brain / 設定)へ遷移できる。
type Tab =
  | "home"
  | "dept_sales"
  | "dept_publishing"
  | "company"
  | "sales_brain"
  | "settings";

const TAB_LABEL_JA: Record<Tab, string> = {
  home: "ダッシュボード",
  dept_sales: "営業部",
  dept_publishing: "出版部",
  company: "AI社員管理",
  sales_brain: "Sales Brain",
  settings: "設定",
};

/** 部門ID → タブ(サイドバーの部門カードから遷移する)。 */
const DEPT_TAB: Record<string, Tab> = {
  "dept-sales": "dept_sales",
  "dept-publishing": "dept_publishing",
};

const GLOBAL_TABS: Tab[] = ["home", "company", "sales_brain", "settings"];

const COMPANY_SUMMARY = computeCompanySummary(MOCK_DEPARTMENT_SUMMARIES);

export function App() {
  const [tab, setTab] = useState<Tab>("home");
  // 初回セットアップが未完了なら、通常UIの前にセットアップウィザードを表示する
  // (Phase β-002 優先順位①)。判定は localStorage 由来の状態から決定論的に行う。
  const [setupDone, setSetupDone] = useState<boolean>(() => isSetupComplete(loadSetupState()));
  // window.musasabi はTauriデスクトップアプリ内(apps/desktop、desktopBridge.ts)での
  // みインストールされる。ブラウザ単体での `vite dev` 実行時はundefinedなので、
  // 静的モックにフォールバックする(FileMaker/Zoom Phone連携が未接続の間の既定データでもある)。
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [callAnalysis, setCallAnalysis] = useState<CallAnalysisSummary | null>(null);

  useEffect(() => {
    const musasabi = window.musasabi;
    if (!musasabi) {
      return;
    }
    musasabi.getLeads().then(setLeads).catch(() => setLeads(MOCK_LEADS));
  }, []);

  const kpi = calculateKpi(MOCK_CALLS);
  const plan = generateDailyPlan(leads);
  const actions = recommendActions(leads);
  const leadsById = new Map(leads.map((lead) => [lead.id, lead]));

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
        ) : tab === "sales_brain" ? (
          <SalesBrainPage />
        ) : (
          <>
            <MusaActionsPanel onCallAnalysisComplete={setCallAnalysis} />
            <CallAnalysisPanel summary={callAnalysis} />
            <KpiDashboard kpi={kpi} />
            <DailyPlanBoard plan={plan} />
            <RecommendedActionsList actions={actions} leadsById={leadsById} />
            <LeadTable leads={leads} />
          </>
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
