// AI Sales Employee のドメイン型。Development Bible 第13章、
// docs/department-playbooks/sales.md のリードステータスに基づく。

export type LeadStatus =
  | "new"
  | "contacted"
  | "callback"
  | "interested"
  | "negotiating"
  | "appointment"
  | "lost";

export interface Lead {
  id: string;
  name: string;
  company: string;
  status: LeadStatus;
  /** 0-100。高いほど優先度が高い。FileMaker連携(Phase 4)までは手動/モック値。 */
  priorityScore: number;
  lastContactedAt: string | null;
  nextCallbackAt: string | null;
}

export type CallOutcome =
  | "no_answer"
  | "callback_requested"
  | "appointment_set"
  | "not_interested"
  | "closed_won"
  | "closed_lost";

export interface CallRecord {
  id: string;
  leadId: string;
  occurredAt: string;
  outcome: CallOutcome;
}

export interface KpiSnapshot {
  callsMade: number;
  appointmentsSet: number;
  dealsWon: number;
  appointmentRate: number;
  winRate: number;
}

export interface DailyPlan {
  priorityLeads: Lead[];
  callbacks: Lead[];
  followUps: Lead[];
  recommendedQueue: Lead[];
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface RecommendedAction {
  leadId: string;
  action: string;
  confidence: ConfidenceLevel;
  reason: string;
}
