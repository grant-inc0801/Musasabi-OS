import type { KpiSnapshot } from "@musasabi/ai-core";

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function KpiDashboard({ kpi }: { kpi: KpiSnapshot }) {
  const stats = [
    { label: "架電数", value: kpi.callsMade },
    { label: "アポ獲得数", value: kpi.appointmentsSet },
    { label: "成約数", value: kpi.dealsWon },
    { label: "アポ率", value: formatPercent(kpi.appointmentRate) },
    { label: "成約率", value: formatPercent(kpi.winRate) },
  ];

  return (
    <section aria-label="KPIダッシュボード">
      <h2>KPIダッシュボード</h2>
      <dl style={{ display: "flex", gap: "1.5rem" }}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
