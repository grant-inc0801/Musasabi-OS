import type { Lead } from "./types";

function isCallbackDue(lead: Lead, now: Date): boolean {
  if (!lead.nextCallbackAt) {
    return false;
  }
  return new Date(lead.nextCallbackAt).getTime() <= now.getTime();
}

/**
 * リードを優先度順に並べ替える。期限到来したコールバックは最優先、
 * それ以外は priorityScore 降順(Development Bible: Deterministic behavior、LLM推論なし)。
 */
export function prioritizeLeads(leads: Lead[], now: Date = new Date()): Lead[] {
  return [...leads]
    .filter((lead) => lead.status !== "lost")
    .sort((a, b) => {
      const aDue = isCallbackDue(a, now);
      const bDue = isCallbackDue(b, now);
      if (aDue !== bDue) {
        return aDue ? -1 : 1;
      }
      return b.priorityScore - a.priorityScore;
    });
}
