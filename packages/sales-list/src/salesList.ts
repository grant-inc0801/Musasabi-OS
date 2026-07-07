import type { LeadStatus, SalesLead } from "./types";
import { LEAD_STATUSES } from "./types";

// 営業リストの操作(決定論・イミュータブル)。重複は電話番号
// (無ければ店舗名+住所)で排除し、既存リードのステータス・メモを保持する。

const MAX_LEADS = 2000;

/** 取り込み元となる店舗情報(架電リスト制作課の RestaurantRecord と互換の最小形)。 */
export interface LeadSource {
  storeName: string;
  phone: string;
  address: string;
  genre: string;
}

/** 重複判定キー(電話番号優先)。 */
export function leadKey(lead: Pick<SalesLead, "storeName" | "phone" | "address">): string {
  return lead.phone.trim() !== "" ? `tel:${lead.phone}` : `name:${lead.storeName}|${lead.address}`;
}

/**
 * 店舗情報を営業リストへ取り込む。既存(重複)は上書きせずスキップし、
 * 追加された件数を返す。新しい順に整列。
 */
export function importLeads(
  leads: readonly SalesLead[],
  records: readonly LeadSource[],
  source: string,
  nowMs: number,
): { leads: SalesLead[]; added: number } {
  const existing = new Set(leads.map((l) => leadKey(l)));
  const added: SalesLead[] = [];
  for (const [i, record] of records.entries()) {
    const candidate: SalesLead = {
      id: `lead-${nowMs}-${i}`,
      storeName: record.storeName,
      phone: record.phone,
      address: record.address,
      genre: record.genre,
      source,
      status: "not_called",
      note: "",
      createdAtMs: nowMs,
      updatedAtMs: nowMs,
    };
    const key = leadKey(candidate);
    if (existing.has(key)) continue;
    existing.add(key);
    added.push(candidate);
  }
  return { leads: [...added, ...leads].slice(0, MAX_LEADS), added: added.length };
}

/** ステータス変更(イミュータブル)。 */
export function setLeadStatus(
  leads: readonly SalesLead[],
  id: string,
  status: LeadStatus,
  nowMs: number,
): SalesLead[] {
  return leads.map((l) => (l.id === id ? { ...l, status, updatedAtMs: nowMs } : l));
}

/** メモ変更(イミュータブル)。 */
export function setLeadNote(
  leads: readonly SalesLead[],
  id: string,
  note: string,
  nowMs: number,
): SalesLead[] {
  return leads.map((l) => (l.id === id ? { ...l, note, updatedAtMs: nowMs } : l));
}

/** ステータス別件数。 */
export function countByStatus(leads: readonly SalesLead[]): Record<LeadStatus, number> {
  const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
  for (const lead of leads) {
    counts[lead.status] += 1;
  }
  return counts;
}

// ---- 永続化(JSON直列化・検証) ----

export const SALES_LIST_SCHEMA_VERSION = 1;

function isLead(value: unknown): value is SalesLead {
  const v = value as SalesLead;
  return (
    typeof v === "object" &&
    v !== null &&
    typeof v.id === "string" &&
    typeof v.storeName === "string" &&
    typeof v.phone === "string" &&
    typeof v.address === "string" &&
    typeof v.genre === "string" &&
    typeof v.source === "string" &&
    LEAD_STATUSES.includes(v.status as LeadStatus) &&
    typeof v.note === "string" &&
    typeof v.createdAtMs === "number" &&
    typeof v.updatedAtMs === "number"
  );
}

export function serializeLeads(leads: readonly SalesLead[]): string {
  return JSON.stringify({ version: SALES_LIST_SCHEMA_VERSION, leads });
}

export function parseLeads(value: unknown): SalesLead[] {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  const leads = (value as { leads?: unknown } | null)?.leads;
  if (!Array.isArray(leads)) {
    return [];
  }
  return leads.filter(isLead).slice(0, MAX_LEADS);
}
