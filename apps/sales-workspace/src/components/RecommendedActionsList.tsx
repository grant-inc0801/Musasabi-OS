import type { Lead, RecommendedAction } from "@musasabi/ai-core";

const CONFIDENCE_LABEL: Record<RecommendedAction["confidence"], string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export function RecommendedActionsList({
  actions,
  leadsById,
}: {
  actions: RecommendedAction[];
  leadsById: Map<string, Lead>;
}) {
  return (
    <section aria-label="推奨アクション">
      <h2>MUSAからの推奨アクション</h2>
      <ul>
        {actions.map((action) => {
          const lead = leadsById.get(action.leadId);
          return (
            <li key={`${action.leadId}-${action.action}`}>
              <strong>{lead ? lead.name : action.leadId}</strong>: {action.action}
              (自信度: {CONFIDENCE_LABEL[action.confidence]}) — {action.reason}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
