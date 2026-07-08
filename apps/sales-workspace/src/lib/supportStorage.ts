import {
  applyTicketOverrides,
  parseTicketOverrides,
  SUPPORT_TICKETS,
  type SupportTicket,
  type TicketStatus,
} from "@musasabi/ai-company";

// サポートチケットのステータス上書きを localStorage へ永続化する。
// マスタ(Mockチケット)は ai-company 側に置き、変更分だけを保存する。
// musasabi.* キーなのでバックアップ/復元の対象に自動的に含まれる。

const SUPPORT_KEY = "musasabi.supportTickets";

/** 保存済みステータスを適用したチケット一覧を返す。 */
export function loadSupportTickets(): SupportTicket[] {
  try {
    return applyTicketOverrides(SUPPORT_TICKETS, parseTicketOverrides(localStorage.getItem(SUPPORT_KEY)));
  } catch {
    return [...SUPPORT_TICKETS];
  }
}

/** ステータス変更を保存する。 */
export function saveTicketStatus(id: string, status: TicketStatus): void {
  try {
    const overrides = parseTicketOverrides(localStorage.getItem(SUPPORT_KEY));
    overrides[id] = status;
    localStorage.setItem(SUPPORT_KEY, JSON.stringify(overrides));
  } catch {
    // 容量超過等は無視(表示は続行)
  }
}
