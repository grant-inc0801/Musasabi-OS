import type { DailyPlan, Lead } from "@musasabi/ai-core";

function LeadNameList({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return <p>該当なし</p>;
  }
  return (
    <ul>
      {leads.map((lead) => (
        <li key={lead.id}>
          {lead.name}({lead.company})
        </li>
      ))}
    </ul>
  );
}

export function DailyPlanBoard({ plan }: { plan: DailyPlan }) {
  return (
    <section aria-label="日次計画">
      <h2>今日の日次計画</h2>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <h3>優先リード</h3>
          <LeadNameList leads={plan.priorityLeads} />
        </div>
        <div>
          <h3>コールバック</h3>
          <LeadNameList leads={plan.callbacks} />
        </div>
        <div>
          <h3>フォローアップ</h3>
          <LeadNameList leads={plan.followUps} />
        </div>
      </div>
    </section>
  );
}
