// カスタマーサポート部のMockデータ(サポート部ページ充実フェーズ)。
// β版はすべてMock: 実問い合わせ受信・実メール/チャット接続・外部送信は行わない。
// AI社員数は COMMAND_DEPARTMENTS(support 5)と整合させる。

/** 問い合わせチケットのステータス。 */
export type TicketStatus = "未対応" | "対応中" | "回答済み" | "クローズ";

export const TICKET_STATUSES: readonly TicketStatus[] = [
  "未対応",
  "対応中",
  "回答済み",
  "クローズ",
];

/** ステータス色(Command Center の状態色と同系統)。 */
export const TICKET_STATUS_COLOR: Record<TicketStatus, string> = {
  未対応: "#EF4444",
  対応中: "#FACC15",
  回答済み: "#22C55E",
  クローズ: "#6b7280",
};

/** 問い合わせチケット(Mock)。実顧客・実問い合わせではない。 */
export interface SupportTicket {
  id: string;
  subject: string;
  customer: string;
  channel: "メール" | "チャット" | "電話";
  priority: "高" | "中" | "低";
  status: TicketStatus;
  receivedAt: string;
  assignee: string;
}

export const SUPPORT_TICKETS: readonly SupportTicket[] = [
  {
    id: "T-1041",
    subject: "初回セットアップが完了できない",
    customer: "株式会社アルファ(Mock)",
    channel: "メール",
    priority: "高",
    status: "未対応",
    receivedAt: "07/07 09:12",
    assignee: "AIサポート(1号)",
  },
  {
    id: "T-1040",
    subject: "営業リストのExcel出力先を変えたい",
    customer: "ベータ商事(Mock)",
    channel: "チャット",
    priority: "中",
    status: "対応中",
    receivedAt: "07/07 08:45",
    assignee: "AIサポート(2号)",
  },
  {
    id: "T-1039",
    subject: "アバターの色を変更する方法",
    customer: "ガンマ食堂(Mock)",
    channel: "チャット",
    priority: "低",
    status: "回答済み",
    receivedAt: "07/06 17:20",
    assignee: "AIサポート(1号)",
  },
  {
    id: "T-1038",
    subject: "テストコールの履歴が見つからない",
    customer: "デルタ物産(Mock)",
    channel: "電話",
    priority: "中",
    status: "対応中",
    receivedAt: "07/06 15:02",
    assignee: "AIサポート(3号)",
  },
  {
    id: "T-1037",
    subject: "バックアップの復元手順",
    customer: "イプシロン堂(Mock)",
    channel: "メール",
    priority: "中",
    status: "回答済み",
    receivedAt: "07/06 11:30",
    assignee: "AIサポート(2号)",
  },
  {
    id: "T-1036",
    subject: "請求書の宛名変更",
    customer: "ゼータ企画(Mock)",
    channel: "メール",
    priority: "低",
    status: "クローズ",
    receivedAt: "07/05 10:15",
    assignee: "AIサポート(3号)",
  },
];

/** FAQ(Mock)。 */
export interface FaqItem {
  question: string;
  answer: string;
  updatedAt: string;
  views: number;
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "初回セットアップをやり直すには?",
    answer: "設定 > データ管理からローカルデータを削除すると、次回起動時にセットアップが再表示されます。",
    updatedAt: "07/07",
    views: 128,
  },
  {
    question: "営業リストはどこから取り込めますか?",
    answer: "開発部 > 架電リスト制作課で検索した結果を「営業リストへ取り込む」で追加できます。",
    updatedAt: "07/06",
    views: 96,
  },
  {
    question: "アバターの見た目を変えるには?",
    answer: "設定 > アバター作成スタジオで色や表情を確認し、「保存して反映」を押してください。",
    updatedAt: "07/06",
    views: 74,
  },
  {
    question: "データのバックアップ方法は?",
    answer: "設定 > データ管理の「バックアップをエクスポート」でJSONファイルとして保存できます。",
    updatedAt: "07/05",
    views: 61,
  },
  {
    question: "架電は実際に発信されますか?",
    answer: "β版は実架電を行いません。コールトレーニングはすべてMockで動作します。",
    updatedAt: "07/04",
    views: 205,
  },
];

export const SUPPORT_STAFF: readonly string[] = [
  "AIサポート(1号)",
  "AIサポート(2号)",
  "AIサポート(3号)",
  "AI FAQエディター",
  "AIエスカレーション管理",
];

export interface SupportKpi {
  openCount: number;
  inProgressCount: number;
  answeredCount: number;
  closedCount: number;
  faqCount: number;
}

/** サポートKPI(チケット配列から導出)。 */
export function buildSupportKpi(tickets: readonly SupportTicket[]): SupportKpi {
  const count = (s: TicketStatus) => tickets.filter((t) => t.status === s).length;
  return {
    openCount: count("未対応"),
    inProgressCount: count("対応中"),
    answeredCount: count("回答済み"),
    closedCount: count("クローズ"),
    faqCount: FAQ_ITEMS.length,
  };
}

/** チケットのステータスを変更した新しい配列を返す(存在しないIDは変更なし)。 */
export function setTicketStatus(
  tickets: readonly SupportTicket[],
  id: string,
  status: TicketStatus,
): SupportTicket[] {
  return tickets.map((t) => (t.id === id ? { ...t, status } : t));
}
