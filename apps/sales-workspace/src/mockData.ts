import type { CallRecord, Lead } from "@musasabi/ai-core";

// FileMaker連携(Phase 4)・Zoom Phone連携(Phase 5)までの仮データ。
// 実データ接続後はここを置き換える。

export const MOCK_LEADS: Lead[] = [
  {
    id: "lead-001",
    name: "田中 太郎",
    company: "株式会社アクメ",
    status: "new",
    priorityScore: 85,
    lastContactedAt: null,
    nextCallbackAt: null,
  },
  {
    id: "lead-002",
    name: "佐藤 花子",
    company: "サンプル商事",
    status: "callback",
    priorityScore: 60,
    lastContactedAt: "2026-07-03T05:00:00Z",
    nextCallbackAt: "2026-07-04T02:00:00Z",
  },
  {
    id: "lead-003",
    name: "鈴木 一郎",
    company: "テスト工業",
    status: "interested",
    priorityScore: 55,
    lastContactedAt: "2026-07-02T06:00:00Z",
    nextCallbackAt: null,
  },
  {
    id: "lead-004",
    name: "高橋 次郎",
    company: "デモ物産",
    status: "negotiating",
    priorityScore: 90,
    lastContactedAt: "2026-07-03T08:00:00Z",
    nextCallbackAt: null,
  },
  {
    id: "lead-005",
    name: "伊藤 三郎",
    company: "サンプルテック",
    status: "appointment",
    priorityScore: 75,
    lastContactedAt: "2026-07-03T09:00:00Z",
    nextCallbackAt: null,
  },
  {
    id: "lead-006",
    name: "渡辺 四郎",
    company: "アクメ工業",
    status: "contacted",
    priorityScore: 40,
    lastContactedAt: "2026-07-01T04:00:00Z",
    nextCallbackAt: null,
  },
];

export const MOCK_CALLS: CallRecord[] = [
  { id: "call-1", leadId: "lead-005", occurredAt: "2026-07-04T01:00:00Z", outcome: "appointment_set" },
  { id: "call-2", leadId: "lead-003", occurredAt: "2026-07-04T02:00:00Z", outcome: "callback_requested" },
  { id: "call-3", leadId: "lead-006", occurredAt: "2026-07-04T03:00:00Z", outcome: "no_answer" },
  { id: "call-4", leadId: "lead-004", occurredAt: "2026-07-03T08:30:00Z", outcome: "appointment_set" },
  { id: "call-5", leadId: "lead-002", occurredAt: "2026-07-02T05:30:00Z", outcome: "closed_won" },
];
