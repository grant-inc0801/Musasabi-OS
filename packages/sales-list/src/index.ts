// 営業リスト(Development Bible 第13章)。架電リストからの取り込み・
// ステータス管理・集計・永続化。ローカルのみ・実架電なし。

export * from "./types";
export {
  SALES_LIST_SCHEMA_VERSION,
  countByStatus,
  importLeads,
  leadKey,
  parseLeads,
  serializeLeads,
  setLeadNote,
  setLeadStatus,
} from "./salesList";
export type { LeadSource } from "./salesList";
