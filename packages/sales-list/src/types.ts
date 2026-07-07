// 営業リスト(Development Bible 第13章 Sales Workspace「営業リスト」)。
// 架電リスト制作課で抽出した店舗を営業対象として取り込み、
// ステータス(未架電→架電済→アポ獲得→成約)を管理する。
// 保存はローカルのみ(localStorage)。実架電・外部送信はしない。

/** 営業ステータス。 */
export type LeadStatus = "not_called" | "called" | "appointment" | "won" | "excluded";

export const LEAD_STATUSES: readonly LeadStatus[] = [
  "not_called",
  "called",
  "appointment",
  "won",
  "excluded",
];

export const LEAD_STATUS_LABEL_JA: Record<LeadStatus, string> = {
  not_called: "未架電",
  called: "架電済",
  appointment: "アポ獲得",
  won: "成約",
  excluded: "対象外",
};

/** 営業リストの1件。 */
export interface SalesLead {
  id: string;
  storeName: string;
  phone: string;
  address: string;
  genre: string;
  /** 取り込み元(例: "架電リスト制作課(大阪府高槻市)")。 */
  source: string;
  status: LeadStatus;
  note: string;
  createdAtMs: number;
  updatedAtMs: number;
}
