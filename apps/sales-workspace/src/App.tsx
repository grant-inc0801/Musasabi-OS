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
import { CallTrainingPage } from "./components/CallTraining/CallTrainingPage";
import { FirstRunSetup } from "./components/Setup/FirstRunSetup";
import { loadSetupState } from "./lib/setupStorage";

type Tab = "home" | "call_training" | "settings";

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
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Musasabi OS — Sales Workspace</h1>
      <nav style={{ marginBottom: "1.5rem" }}>
        <button type="button" onClick={() => setTab("home")} disabled={tab === "home"}>
          ホーム
        </button>{" "}
        <button
          type="button"
          onClick={() => setTab("call_training")}
          disabled={tab === "call_training"}
        >
          コールトレーニング
        </button>{" "}
        <button type="button" onClick={() => setTab("settings")} disabled={tab === "settings"}>
          設定
        </button>
      </nav>
      {tab === "settings" ? (
        <ConnectionSettingsPanel />
      ) : tab === "call_training" ? (
        <CallTrainingPage />
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
  );
}
