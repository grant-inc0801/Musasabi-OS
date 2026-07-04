import { calculateKpi, generateDailyPlan, recommendActions } from "@musasabi/ai-core";
import { MOCK_CALLS, MOCK_LEADS } from "./mockData";
import { KpiDashboard } from "./components/KpiDashboard";
import { DailyPlanBoard } from "./components/DailyPlanBoard";
import { LeadTable } from "./components/LeadTable";
import { RecommendedActionsList } from "./components/RecommendedActionsList";

export function App() {
  const leads = MOCK_LEADS;
  const kpi = calculateKpi(MOCK_CALLS);
  const plan = generateDailyPlan(leads);
  const actions = recommendActions(leads);
  const leadsById = new Map(leads.map((lead) => [lead.id, lead]));

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Musasabi OS — Sales Workspace</h1>
      <KpiDashboard kpi={kpi} />
      <DailyPlanBoard plan={plan} />
      <RecommendedActionsList actions={actions} leadsById={leadsById} />
      <LeadTable leads={leads} />
    </main>
  );
}
