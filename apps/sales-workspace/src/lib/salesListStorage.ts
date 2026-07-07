import { parseLeads, serializeLeads } from "@musasabi/sales-list";
import type { SalesLead } from "@musasabi/sales-list";
import { appLogger } from "./appLogger";

// 営業リストのローカル永続化(この端末のlocalStorageのみ。外部送信なし)。

const STORAGE_KEY = "musasabi.salesList";
/** テストコールへの連絡先受け渡し(営業リスト→コールトレーニング)。 */
export const CALL_HANDOFF_KEY = "musasabi.callContactHandoff";

export function loadLeads(): SalesLead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? [] : parseLeads(raw);
  } catch (error) {
    appLogger.warn("failed to load sales list; starting empty", { error: String(error) });
    return [];
  }
}

export function saveLeads(leads: readonly SalesLead[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeLeads(leads));
  } catch (error) {
    appLogger.warn("failed to persist sales list", { error: String(error) });
  }
}

/** テストコール画面への連絡先の受け渡し(1回で消費される)。 */
export function setCallHandoff(contact: string): void {
  try {
    localStorage.setItem(CALL_HANDOFF_KEY, contact);
  } catch {
    /* 受け渡しのみ */
  }
}

export function takeCallHandoff(): string | null {
  try {
    const value = localStorage.getItem(CALL_HANDOFF_KEY);
    if (value !== null) {
      localStorage.removeItem(CALL_HANDOFF_KEY);
    }
    return value;
  } catch {
    return null;
  }
}
