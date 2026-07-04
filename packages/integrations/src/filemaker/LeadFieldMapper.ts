import type { Lead, LeadStatus } from "@musasabi/ai-core";
import type { FileMakerFieldData, FileMakerRecord } from "./types";

export interface LeadFieldMapping {
  name: string;
  company: string;
  status: string;
  priorityScore: string;
  lastContactedAt: string;
  nextCallbackAt: string;
}

/** 実際のFileMaker DBのフィールド名は顧客ごとに異なるため、この既定値は出発点に過ぎない。 */
export const DEFAULT_LEAD_FIELD_MAPPING: LeadFieldMapping = {
  name: "Name",
  company: "Company",
  status: "Status",
  priorityScore: "PriorityScore",
  lastContactedAt: "LastContactedAt",
  nextCallbackAt: "NextCallbackAt",
};

export const DEFAULT_STATUS_MAPPING: Record<string, LeadStatus> = {
  New: "new",
  Contacted: "contacted",
  Callback: "callback",
  Interested: "interested",
  Negotiating: "negotiating",
  Appointment: "appointment",
  Lost: "lost",
};

function toReverseStatusMapping(statusMapping: Record<string, LeadStatus>): Record<LeadStatus, string> {
  const reversed = {} as Record<LeadStatus, string>;
  for (const [fmStatus, leadStatus] of Object.entries(statusMapping)) {
    reversed[leadStatus] = fmStatus;
  }
  return reversed;
}

/**
 * FileMakerレコード(recordId + fieldData)を ai-core の Lead 型に変換する。
 * 未知のステータス文字列はサイレントに握りつぶさず、明示的にエラーとする
 * (データ不整合をUIに気付かれず表示させないため)。
 */
export function fromFileMakerRecord(
  record: FileMakerRecord,
  mapping: LeadFieldMapping = DEFAULT_LEAD_FIELD_MAPPING,
  statusMapping: Record<string, LeadStatus> = DEFAULT_STATUS_MAPPING,
): Lead {
  const fields = record.fieldData;
  const rawStatus = String(fields[mapping.status] ?? "");
  const status = statusMapping[rawStatus];
  if (!status) {
    throw new Error(
      `FileMaker record ${record.recordId}: unknown status "${rawStatus}" (no mapping to LeadStatus)`,
    );
  }

  return {
    id: record.recordId,
    name: String(fields[mapping.name] ?? ""),
    company: String(fields[mapping.company] ?? ""),
    status,
    priorityScore: Number(fields[mapping.priorityScore] ?? 0),
    lastContactedAt: fields[mapping.lastContactedAt] ? String(fields[mapping.lastContactedAt]) : null,
    nextCallbackAt: fields[mapping.nextCallbackAt] ? String(fields[mapping.nextCallbackAt]) : null,
  };
}

/**
 * Leadの一部フィールドをFileMaker更新用のfieldDataに変換する(update呼び出し用)。
 */
export function toFileMakerFieldData(
  lead: Partial<Lead>,
  mapping: LeadFieldMapping = DEFAULT_LEAD_FIELD_MAPPING,
  statusMapping: Record<string, LeadStatus> = DEFAULT_STATUS_MAPPING,
): FileMakerFieldData {
  const reverseStatusMapping = toReverseStatusMapping(statusMapping);
  const fieldData: FileMakerFieldData = {};

  if (lead.name !== undefined) fieldData[mapping.name] = lead.name;
  if (lead.company !== undefined) fieldData[mapping.company] = lead.company;
  if (lead.status !== undefined) fieldData[mapping.status] = reverseStatusMapping[lead.status];
  if (lead.priorityScore !== undefined) fieldData[mapping.priorityScore] = lead.priorityScore;
  if (lead.lastContactedAt !== undefined && lead.lastContactedAt !== null) {
    fieldData[mapping.lastContactedAt] = lead.lastContactedAt;
  }
  if (lead.nextCallbackAt !== undefined && lead.nextCallbackAt !== null) {
    fieldData[mapping.nextCallbackAt] = lead.nextCallbackAt;
  }

  return fieldData;
}
