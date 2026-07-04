import { prioritizeLeads } from "./LeadPrioritizer";
import type { DailyPlan, Lead } from "./types";

const PRIORITY_QUEUE_SIZE = 5;

function isCallbackDue(lead: Lead, now: Date): boolean {
  return Boolean(lead.nextCallbackAt) && new Date(lead.nextCallbackAt as string).getTime() <= now.getTime();
}

/**
 * AI Employee Bible 第5章: 今日の優先リード / コールバック / フォローアップ / 推奨キュー。
 */
export function generateDailyPlan(leads: Lead[], now: Date = new Date()): DailyPlan {
  const active = prioritizeLeads(leads, now);

  const callbacks = active.filter((lead) => lead.status === "callback" && isCallbackDue(lead, now));
  const followUps = active.filter((lead) => lead.status === "contacted" || lead.status === "interested");
  const priorityLeads = active.filter((lead) => lead.status === "new" || lead.status === "negotiating");

  return {
    priorityLeads,
    callbacks,
    followUps,
    recommendedQueue: active.slice(0, PRIORITY_QUEUE_SIZE),
  };
}
